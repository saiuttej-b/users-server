import { ChatChannelMember } from '../schemas/chat-channel-member.schema';

export abstract class ChatChannelMemberRepository {
  abstract instance(data?: Partial<ChatChannelMember>): ChatChannelMember;

  abstract insertMany(members: ChatChannelMember[]): Promise<void>;

  abstract updateRole(props: {
    chatChannelId: string;
    userId: string;
    role: string;
  }): Promise<void>;

  abstract findByChannelIdAndUserId(props: {
    chatChannelId: string;
    userId: string;
  }): Promise<ChatChannelMember>;

  abstract findByChannelIdAndUserIds(props: {
    chatChannelId: string;
    userIds: string[];
  }): Promise<ChatChannelMember[]>;
}
