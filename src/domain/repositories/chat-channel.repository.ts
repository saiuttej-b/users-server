import { EditOptions } from 'src/utils/mongoose.config';
import { ChatChannelMember } from '../schemas/chat-channel-member.schema';
import { ChatChannelMessage } from '../schemas/chat-channel-message.schema';
import { ChatChannel } from '../schemas/chat-channel.schema';
import { MediaResource } from '../schemas/media-resource.schema';

export type MyChatChannel = ChatChannelMember & {
  chatChannel: ChatChannel;
  lastMessage: ChatChannelMessage;
  notSeenMessagesCount: number;
  chatName: string;
  emailId?: string;
  avatar?: MediaResource;
};

export abstract class ChatChannelRepository {
  abstract instance(data?: Partial<ChatChannel>): ChatChannel;

  abstract create(chatChannel: ChatChannel): Promise<ChatChannel>;

  abstract save(chatChannel: ChatChannel, options?: EditOptions): Promise<ChatChannel>;

  abstract findById(props: { id: string; type?: string }): Promise<ChatChannel>;

  abstract findByIds(props: { ids: string[]; type?: string }): Promise<ChatChannel[]>;

  abstract findUserChatChannels(props: { userId: string }): Promise<MyChatChannel[]>;
}
