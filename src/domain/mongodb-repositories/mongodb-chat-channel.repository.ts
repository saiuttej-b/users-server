import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { convertDoc } from 'src/utils/mongoose.config';
import { generateTimestampId } from 'src/utils/util-functions';
import { ChatChannelRepository } from '../repositories/chat-channel.repository';
import { ChatChannel, ChatChannelDocument } from '../schemas/chat-channel.schema';

@Injectable()
export class MongoDBChatChannelRepository implements ChatChannelRepository {
  constructor(@InjectModel(ChatChannel.name) private readonly model: Model<ChatChannel>) {}

  instance(data?: Partial<ChatChannel>): ChatChannel {
    const channel = new ChatChannel();
    if (data) Object.assign(channel, data);
    if (!channel.id) channel.id = generateTimestampId();

    return channel;
  }

  async create(chatChannel: ChatChannel): Promise<ChatChannel> {
    if (!chatChannel.id) chatChannel.id = generateTimestampId();

    const record = await this.model.create(chatChannel);
    return this.convert(record);
  }

  async findByKey(props: { key: string; type?: string }): Promise<ChatChannel> {
    const record = await this.model
      .findOne({ key: props.key, ...(props.type && { type: props.type }) })
      .exec();
    return this.convert(record);
  }

  async findByKeys(props: { keys: string[]; type?: string }): Promise<ChatChannel[]> {
    if (!props.keys.length) return [];

    const records = await this.model
      .find({ key: { $in: props.keys }, ...(props.type && { type: props.type }) })
      .exec();

    return this.convert(records);
  }

  private convert(channel: ChatChannelDocument): ChatChannel;
  private convert(channels: ChatChannelDocument[]): ChatChannel[];
  private convert(
    channel: ChatChannelDocument | ChatChannelDocument[],
  ): ChatChannel | ChatChannel[] {
    return convertDoc(() => new ChatChannel(), channel);
  }
}
