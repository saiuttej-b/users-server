import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateTimestampId } from 'src/utils/util-functions';
import { ChatChannelMessageRepository } from '../repositories/chat-channel-message.repository';
import {
  ChatChannelMessage,
  convertChatChannelMessageDoc,
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
}
