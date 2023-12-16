import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { keyBy } from 'lodash';
import { FilterQuery, Model } from 'mongoose';
import { GetChatChannelMessagesDto } from 'src/chat-channel-messages/dtos/chat-channel-messages.dto';
import { generateId } from 'src/utils/util-functions';
import { ChatChannelMessageRepository } from '../repositories/chat-channel-message.repository';
import { UserRepository } from '../repositories/user.repository';
import {
  ChatChannelMessage,
  convertChatChannelMessageDoc,
} from '../schemas/chat-channel-message.schema';

@Injectable()
export class MongoDBChatChannelMessageRepository implements ChatChannelMessageRepository {
  constructor(
    @InjectModel(ChatChannelMessage.name) private readonly model: Model<ChatChannelMessage>,
    private readonly userRepo: UserRepository,
  ) {}

  instance(data?: Partial<ChatChannelMessage>): ChatChannelMessage {
    const message = new ChatChannelMessage();
    if (data) Object.assign(message, data);
    if (!message.id) message.id = generateId();

    return message;
  }

  async create(message: ChatChannelMessage): Promise<ChatChannelMessage> {
    const record = await this.model.create(message);
    return convertChatChannelMessageDoc(record);
  }

  async save(message: ChatChannelMessage): Promise<ChatChannelMessage> {
    const previous = await this.model.findOne({ id: message.id }).exec();
    if (!previous) return this.create(message);

    Object.assign(previous, message);
    if (!previous.isModified()) return message;

    const record = await previous.save();
    return convertChatChannelMessageDoc(record);
  }

  async deleteById(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }

  async findById(id: string): Promise<ChatChannelMessage> {
    const message = await this.model.findOne({ id }).exec();
    return convertChatChannelMessageDoc(message);
  }

  async chatChannelMessages(
    query: GetChatChannelMessagesDto,
  ): Promise<{ hasMore: boolean; messages: ChatChannelMessage[] }> {
    const filter: FilterQuery<ChatChannelMessage> = {
      chatChannelId: query.chatChannelId,
      createdAt: { $lt: query.lastMessageTimestamp },
    };

    const messagesLimit = 50;

    // Getting next 50 messages
    const res = await this.model.find(filter).sort({ createdAt: -1 }).limit(messagesLimit).exec();

    const userIds = res.map((message) => message.createdById).filter((id) => !!id);
    filter.createdAt = { $lt: res[res.length - 1]?.createdAt };

    // Getting users and checking if there are more messages
    const [users, hasMore] = await Promise.all([
      this.userRepo.findMetaDetailsByIds(userIds).then((users) => keyBy(users, (v) => v.id)),
      res.length < messagesLimit
        ? false
        : this.model
            .countDocuments(filter)
            .exec()
            .then((count) => {
              console.log(count);
              return count > 0;
            }),
    ]);

    return {
      hasMore: hasMore,
      messages: res.map((message) => {
        const value = convertChatChannelMessageDoc(message);
        value.createdBy = users[value.createdById];
        return value;
      }),
    };
  }
}
