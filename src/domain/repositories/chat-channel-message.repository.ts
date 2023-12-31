import { GetChatChannelMessagesDto } from 'src/chat-channel-messages/dtos/chat-channel-messages.dto';
import { ChatChannelMessage } from '../schemas/chat-channel-message.schema';

export abstract class ChatChannelMessageRepository {
  abstract instance(data?: Partial<ChatChannelMessage>): ChatChannelMessage;

  abstract create(message: ChatChannelMessage): Promise<ChatChannelMessage>;

  abstract save(message: ChatChannelMessage): Promise<ChatChannelMessage>;

  abstract deleteById(id: string): Promise<void>;

  abstract findById(id: string): Promise<ChatChannelMessage>;

  abstract chatChannelMessages(
    query: GetChatChannelMessagesDto,
  ): Promise<{ hasMore: boolean; messages: ChatChannelMessage[] }>;
}
