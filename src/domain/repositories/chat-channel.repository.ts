import { ChatChannel } from '../schemas/chat-channel.schema';

export abstract class ChatChannelRepository {
  abstract instance(data?: Partial<ChatChannel>): ChatChannel;

  abstract create(chatChannel: ChatChannel): Promise<ChatChannel>;

  abstract findById(props: { id: string; type?: string }): Promise<ChatChannel>;

  abstract findByIds(props: { ids: string[]; type?: string }): Promise<ChatChannel[]>;
}
