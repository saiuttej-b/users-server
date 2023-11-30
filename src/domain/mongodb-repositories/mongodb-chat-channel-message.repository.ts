import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { convertDoc } from 'src/utils/mongoose.config';
import { generateTimestampId } from 'src/utils/util-functions';
import { ChatChannelMessageRepository } from '../repositories/chat-channel-message.repository';
import {
  ChatChannelMessage,
  ChatChannelMessageDocument,
} from '../schemas/chat-channel-message.schema';

@Injectable()
export class MongoDBChatChannelMessageRepository implements ChatChannelMessageRepository {
  constructor(
    @InjectModel(ChatChannelMessage.name) private readonly model: Model<ChatChannelMessage>,
  ) {}

  instance(data?: Partial<ChatChannelMessage>): ChatChannelMessage {
    const message = new ChatChannelMessage();
    if (data) Object.assign(message, data);
    if (!message.id) message.id = generateTimestampId();

    return message;
  }

  async create(message: ChatChannelMessage): Promise<ChatChannelMessage> {
    const record = await this.model.create(message);
    return this.convert(record);
  }

  async save(message: ChatChannelMessage): Promise<ChatChannelMessage> {
    const previous = await this.model.findOne({ id: message.id }).exec();
    if (!previous) return this.create(message);

    Object.assign(previous, message);
    if (!previous.isModified()) return message;

    const record = await previous.save();
    return this.convert(record);
  }

  async deleteById(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }

  async findById(id: string): Promise<ChatChannelMessage> {
    const message = await this.model.findOne({ id }).exec();
    return this.convert(message);
  }

  private convert(channel: ChatChannelMessageDocument): ChatChannelMessage;
  private convert(channels: ChatChannelMessageDocument[]): ChatChannelMessage[];
  private convert(
    channel: ChatChannelMessageDocument | ChatChannelMessageDocument[],
  ): ChatChannelMessage | ChatChannelMessage[] {
    return convertDoc(() => new ChatChannelMessage(), channel);
  }
}
