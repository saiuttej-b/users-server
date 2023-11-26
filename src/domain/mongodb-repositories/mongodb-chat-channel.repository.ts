import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { convertDoc } from 'src/utils/mongoose.config';
import { ChatChannelRepository } from '../repositories/chat-channel.repository';
import { ChatChannel, ChatChannelDocument } from '../schemas/chat-channel.schema';

@Injectable()
export class MongoDBChatChannelRepository implements ChatChannelRepository {
  constructor(@InjectModel(ChatChannel.name) private readonly model: Model<ChatChannel>) {}

  instance(data?: Partial<ChatChannel>): ChatChannel {
    const channel = new ChatChannel();
    if (data) Object.assign(channel, data);

    return channel;
  }

  async create(chatChannel: ChatChannel): Promise<ChatChannel> {
    const record = await this.model.create(chatChannel);
    return this.convert(record);
  }

  async findById(props: { id: string; type?: string }): Promise<ChatChannel> {
    const record = await this.model
      .findOne({ id: props.id, ...(props.type && { type: props.type }) })
      .exec();
    return this.convert(record);
  }

  async findByIds(props: { ids: string[]; type?: string }): Promise<ChatChannel[]> {
    if (!props.ids.length) return [];

    const records = await this.model
      .find({ id: { $in: props.ids }, ...(props.type && { type: props.type }) })
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
