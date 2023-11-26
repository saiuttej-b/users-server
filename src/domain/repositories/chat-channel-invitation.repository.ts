import { GetChatChannelInvitationsDto } from 'src/chat-channel-invitations/dtos/chat-channel-invitation.dto';
import { ChatChannelInvitation } from '../schemas/chat-channel-invitation.schema';

export abstract class ChatChannelInvitationRepository {
  abstract instance(data?: Partial<ChatChannelInvitation>): ChatChannelInvitation;

  abstract insertMany(invitations: ChatChannelInvitation[]): Promise<void>;

  abstract updateResponse(props: {
    invitationId: string;
    response: string;
    respondedAt?: Date;
    message?: string;
  }): Promise<void>;

  abstract deleteById(id: string): Promise<void>;

  abstract deleteByPreviousPendingInvitations(props: {
    createdById: string;
    values: {
      userId: string;
      chatChannelKey: string;
    }[];
  }): Promise<void>;

  abstract findById(id: string): Promise<ChatChannelInvitation>;

  abstract find(
    query: GetChatChannelInvitationsDto,
  ): Promise<{ total: number; invitations: ChatChannelInvitation[] }>;
}
