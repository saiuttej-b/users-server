import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { keyBy, uniq } from 'lodash';
import { FilterQuery, Model } from 'mongoose';
import { GetChatChannelInvitationsDto } from 'src/chat-channel-invitations/dtos/chat-channel-invitation.dto';
import { convertDoc } from 'src/utils/mongoose.config';
import { generateTimestampId } from 'src/utils/util-functions';
import { ChatChannelInvitationRepository } from '../repositories/chat-channel-invitation.repository';
import { ChatChannelRepository } from '../repositories/chat-channel.repository';
import { UserRepository } from '../repositories/user.repository';
import {
  ChatChannelInvitation,
  ChatChannelInvitationDocument,
  ChatChannelInvitationStatus,
} from '../schemas/chat-channel-invitation.schema';

@Injectable()
export class MongoDBChatChannelInvitationRepository implements ChatChannelInvitationRepository {
  constructor(
    @InjectModel(ChatChannelInvitation.name) private readonly model: Model<ChatChannelInvitation>,

    private readonly userRepo: UserRepository,
    private readonly chatChannelRepo: ChatChannelRepository,
  ) {}

  instance(data?: Partial<ChatChannelInvitation>): ChatChannelInvitation {
    const invitation = new ChatChannelInvitation();
    if (data) Object.assign(invitation, data);
    if (!invitation.id) invitation.id = generateTimestampId();

    return invitation;
  }

  async insertMany(invitations: ChatChannelInvitation[]): Promise<void> {
    if (!invitations.length) return;

    await this.model.insertMany(invitations);
  }

  async updateResponse(props: {
    invitationId: string;
    response: string;
    respondedAt?: Date;
    message?: string;
  }): Promise<void> {
    await this.model
      .updateOne(
        { id: props.invitationId },
        {
          $set: {
            status: props.response,
            respondedAt: props.respondedAt,
            respondedMessage: props.message || null,
          },
        },
      )
      .exec();
  }

  async deleteById(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }

  async deleteByPreviousPendingInvitations(props: {
    createdById: string;
    values: { userId: string; chatChannelId: string }[];
  }): Promise<void> {
    if (!props.values.length) return;

    await this.model.deleteMany({
      createdById: props.createdById,
      status: ChatChannelInvitationStatus.PENDING,
      $or: props.values.map((v) => ({
        userId: v.userId,
        chatChannelId: v.chatChannelId,
      })),
    });
  }

  async findById(id: string): Promise<ChatChannelInvitation> {
    const record = await this.model.findOne({ id }).exec();
    return this.convert(record);
  }

  async find(
    query: GetChatChannelInvitationsDto,
  ): Promise<{ total: number; invitations: ChatChannelInvitation[] }> {
    const statuses = query.statuses ? query.statuses.filter(Boolean) : [];
    // creating filter query
    const filters: FilterQuery<ChatChannelInvitation> = {
      $and: [
        ...(query.userId ? [{ userId: query.userId }] : []),
        ...(query.createdById ? [{ createdById: query.createdById }] : []),
        ...(query.chatChannelType ? [{ chatChannelType: query.chatChannelType }] : []),
        ...(query.chatChannelId ? [{ chatChannelId: query.chatChannelId }] : []),
        ...(statuses.length ? [{ status: { $in: statuses } }] : []),
      ],
    };

    // getting total count and records
    const [recordCount, records] = await Promise.all([
      query.limit || query.skip ? this.model.countDocuments(filters).exec() : null,
      this.model
        .find(filters)
        .sort({ createdAt: -1 })
        .skip(query.skip || 0)
        .limit(query.limit || Number.MAX_SAFE_INTEGER)
        .exec(),
    ]);
    const total = recordCount || records.length;

    // getting user ids and chat channel ids for fetching user and chat channel data
    const [userIds, chatChannelIds] = records.reduce<[string[], string[]]>(
      (acc, curr) => {
        acc[0].push(curr.userId);
        acc[0].push(curr.createdById);
        acc[1].push(curr.chatChannelId);
        return acc;
      },
      [[], []],
    );

    // fetching user and chat channel data
    const [users, chatChannels] = await Promise.all([
      this.userRepo.findByIds(uniq(userIds)).then((res) => keyBy(res, (v) => v.id)),
      this.chatChannelRepo
        .findByIds({ ids: uniq(chatChannelIds) })
        .then((res) => keyBy(res, (v) => v.id)),
    ]);

    // converting records to ChatChannelInvitation and adding user and chat channel data
    const result = records.map((record) => {
      const invitation = this.convert(record);
      invitation.user = users[invitation.userId];
      invitation.createdBy = users[invitation.createdById];
      invitation.chatChannel = chatChannels[invitation.chatChannelId];
      return invitation;
    });

    return { total, invitations: result };
  }

  private convert(value: ChatChannelInvitationDocument): ChatChannelInvitation;
  private convert(value: ChatChannelInvitationDocument[]): ChatChannelInvitation[];
  private convert(
    value: ChatChannelInvitationDocument | ChatChannelInvitationDocument[],
  ): ChatChannelInvitation | ChatChannelInvitation[] {
    return convertDoc(() => new ChatChannelInvitation(), value);
  }
}
