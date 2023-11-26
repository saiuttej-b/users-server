import { ChatChannel } from '../schemas/chat-channel.schema';

export abstract class ChatChannelRepository {
  abstract instance(data?: Partial<ChatChannel>): ChatChannel;

  abstract create(chatChannel: ChatChannel): Promise<ChatChannel>;

  abstract findByKey(props: { key: string; type?: string }): Promise<ChatChannel>;

  abstract findByKeys(props: { keys: string[]; type?: string }): Promise<ChatChannel[]>;
}
