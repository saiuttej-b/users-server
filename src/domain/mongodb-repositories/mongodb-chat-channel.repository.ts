import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EditOptions } from 'src/utils/mongoose.config';
import { getFullName } from 'src/utils/util-functions';
import { ChatChannelRepository, MyChatChannel } from '../repositories/chat-channel.repository';
import { ChatChannelMember } from '../schemas/chat-channel-member.schema';
import {
  ChatChannelMessageCName,
  formatChatChannelMessageObject,
} from '../schemas/chat-channel-message.schema';
import {
  ChatChannel,
  ChatChannelCName,
  ChatChannelType,
  convertChatChannelDoc,
  formatChatChannelObject,
} from '../schemas/chat-channel.schema';
import { UserCName, formatUserObject } from '../schemas/user.schema';

@Injectable()
export class MongoDBChatChannelRepository implements ChatChannelRepository {
  constructor(
    @InjectModel(ChatChannel.name) private readonly model: Model<ChatChannel>,
    @InjectModel(ChatChannelMember.name) private readonly memberModel: Model<ChatChannelMember>,
  ) {}

  instance(data?: Partial<ChatChannel>): ChatChannel {
    const channel = new ChatChannel();
    if (data) Object.assign(channel, data);

    return channel;
  }

  async create(chatChannel: ChatChannel): Promise<ChatChannel> {
    const record = await this.model.create(chatChannel);
    return convertChatChannelDoc(record);
  }

  async save(chatChannel: ChatChannel, options?: EditOptions): Promise<ChatChannel> {
    if (!chatChannel.id) {
      throw new BadRequestException('Chat channel id is required.');
    }

    const previous = await this.model.findOne({ id: chatChannel.id }).exec();
    if (!previous) return this.create(chatChannel);

    Object.assign(previous, chatChannel);
    if (!previous.isModified()) return chatChannel;

    if (options?.updatedById) {
      // TODO: update updatedById
    }

    const record = await previous.save();
    return convertChatChannelDoc(record);
  }

  async findById(props: { id: string; type?: string }): Promise<ChatChannel> {
    const record = await this.model
      .findOne({ id: props.id, ...(props.type && { type: props.type }) })
      .exec();
    return convertChatChannelDoc(record);
  }

  async findByIds(props: { ids: string[]; type?: string }): Promise<ChatChannel[]> {
    if (!props.ids.length) return [];

    const records = await this.model
      .find({ id: { $in: props.ids }, ...(props.type && { type: props.type }) })
      .exec();

    return convertChatChannelDoc(records);
  }

  async findUserChatChannels(props: { userId: string }): Promise<MyChatChannel[]> {
    const res = await this.memberModel
      .aggregate([
        // find chat channels that user is a member of
        {
          $match: {
            userId: props.userId,
          },
        },

        // join chat channel info
        {
          $lookup: {
            from: ChatChannelCName,
            localField: 'chatChannelId',
            foreignField: 'id',
            as: 'chatChannel',
            pipeline: [
              // Getting chat channel members ids if it is a direct chat
              {
                $addFields: {
                  userIds: {
                    $split: ['$id', '--'],
                  },
                  _id: '$$REMOVE',
                  __v: '$$REMOVE',
                },
              },
              // Getting other user id if it is a direct chat
              {
                $addFields: {
                  otherUserId: {
                    $cond: {
                      if: { $eq: ['$type', ChatChannelType.DIRECT] },
                      else: '$$REMOVE',
                      then: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$userIds',
                              as: 'userId',
                              cond: { $ne: ['$$userId', props.userId] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                  },
                  userIds: '$$REMOVE',
                },
              },
              // Getting other user details if it is a direct chat
              {
                $lookup: {
                  from: UserCName,
                  localField: 'otherUserId',
                  foreignField: 'id',
                  as: 'otherUser',
                  pipeline: [{ $unset: ['_id', '__v', 'password', 'profiles'] }],
                },
              },
              { $unwind: { path: '$otherUser', preserveNullAndEmptyArrays: true } },
            ],
          },
        },
        {
          $unwind: {
            path: '$chatChannel',
            preserveNullAndEmptyArrays: false,
          },
        },

        // join last chat channel message and sort by it
        {
          $lookup: {
            from: ChatChannelMessageCName,
            as: 'lastMessage',
            let: { chatChannelId: '$chatChannelId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$chatChannelId', '$$chatChannelId'],
                  },
                },
              },
              { $sort: { createdAt: -1 } },
              { $limit: 1 },
              { $unset: ['_id', '__v'] },
              // adding message creator details
              {
                $lookup: {
                  from: UserCName,
                  localField: 'createdById',
                  foreignField: 'id',
                  as: 'createdBy',
                  pipeline: [{ $unset: ['_id', '__v', 'password', 'profiles'] }],
                },
              },
              { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
            ],
          },
        },
        {
          $unwind: {
            path: '$lastMessage',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: {
            'lastMessage.createdAt': -1,
          },
        },

        // finding not seen messages count
        {
          $lookup: {
            from: ChatChannelMessageCName,
            as: 'notSeenMessages',
            let: { chatChannelId: '$chatChannelId', lastSeenAt: '$lastSeenAt' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$chatChannelId', '$$chatChannelId'] },
                      { $gt: ['$createdAt', '$$lastSeenAt'] },
                    ],
                  },
                },
              },
              { $count: 'count' },
            ],
          },
        },
        {
          $addFields: {
            notSeenMessagesCount: {
              $ifNull: [{ $arrayElemAt: ['$notSeenMessages.count', 0] }, 0],
            },
          },
        },

        // remove unnecessary fields
        { $unset: ['notSeenMessages', '_id', '__v'] },
      ])
      .exec();

    // formatting result
    return res.map((item) => {
      const channel = formatChatChannelObject(item.chatChannel);
      const otherUser = formatUserObject(item.chatChannel?.otherUser);

      delete item.chatChannel?.otherUser;

      const value: MyChatChannel = {
        ...item,
        chatChannel: channel,
        chatName:
          channel.type === ChatChannelType.GROUP
            ? channel.name
            : getFullName(otherUser?.firstName, otherUser?.lastName),
        emailId: otherUser?.email,
        avatar: channel.type === ChatChannelType.GROUP ? channel.avatar : otherUser?.profilePicture,
        lastMessage: formatChatChannelMessageObject(item.lastMessage),
      };
      return value;
    });
  }
}
