export type WorkflowState = 'STORY' | 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type PostItColor = 'yellow' | 'pink' | 'cyan' | 'green' | 'purple' | 'orange';

export interface UserSummary {
  id: string;
  username: string;
  email: string;
  color: string;
  avatar?: string | null;
}

export interface BoardMemberWithUser {
  id: string;
  boardId: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: UserSummary;
}

export interface TicketItem {
  id: string;
  title: string;
  description?: string | null;
  state: WorkflowState;
  priority: Priority;
  color: PostItColor;
  tags: string; // comma-separated or json array string
  storyPoints?: number | null;
  order: number;
  boardId: string;
  creatorId?: string | null;
  assigneeId?: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: UserSummary | null;
  assignee?: UserSummary | null;
}

export interface BoardDetail {
  id: string;
  title: string;
  description?: string | null;
  inviteCode: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: UserSummary;
  members: BoardMemberWithUser[];
  tickets: TicketItem[];
}

export interface BoardSummary {
  id: string;
  title: string;
  description?: string | null;
  inviteCode: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tickets: number;
    members: number;
  };
  role?: string;
}
