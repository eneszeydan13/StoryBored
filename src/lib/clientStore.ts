import { UserSummary, BoardDetail, BoardSummary, TicketItem, WorkflowState } from '@/types';
import { supabase } from './supabase';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const DEFAULT_USERS: UserSummary[] = [
  { id: '1c7bb5f2-40d4-49b8-8839-6d24fabd97da', username: 'enes', email: 'enes@storyboard.dev', color: '#3B82F6' },
  { id: 'c27341d9-f212-4777-9e7d-a8be146f1237', username: 'alex_dev', email: 'alex@storyboard.dev', color: '#8B5CF6' },
  { id: 'f23071c8-e07b-4829-91e4-ea2ebfa96ccc', username: 'sara_ui', email: 'sara@storyboard.dev', color: '#10B981' },
];

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error', e);
  }
}

export const clientStore = {
  getCurrentUser: (): UserSummary | null => {
    return getStorage('storyboard_current_user', DEFAULT_USERS[0]);
  },

  setCurrentUser: (user: UserSummary | null) => {
    setStorage('storyboard_current_user', user);
  },

  login: async (identifier: string): Promise<UserSummary> => {
    const clean = identifier.trim().toLowerCase();
    const now = new Date().toISOString();

    try {
      const { data } = await supabase
        .from('User')
        .select('*')
        .or(`username.ilike.${clean},email.ilike.${clean}`)
        .maybeSingle();

      if (data) {
        const u: UserSummary = { id: data.id, username: data.username, email: data.email, color: data.color };
        clientStore.setCurrentUser(u);
        return u;
      }
    } catch {
      //
    }

    const newUser: UserSummary = {
      id: generateId(),
      username: clean.split('@')[0],
      email: clean.includes('@') ? clean : `${clean}@storyboard.dev`,
      color: '#3B82F6',
    };
    clientStore.setCurrentUser(newUser);

    try {
      await supabase.from('User').insert([{
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        passwordHash: 'demo',
        color: newUser.color,
        updatedAt: now,
      }]);
    } catch (e) {
      console.error('User insert cloud error', e);
    }

    return newUser;
  },

  register: async (data: { username: string; email: string; color?: string }): Promise<UserSummary> => {
    const now = new Date().toISOString();
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanEmail = data.email.trim().toLowerCase();

    try {
      const { data: existing } = await supabase
        .from('User')
        .select('*')
        .or(`username.ilike.${cleanUsername},email.ilike.${cleanEmail}`)
        .maybeSingle();

      if (existing) {
        const u: UserSummary = { id: existing.id, username: existing.username, email: existing.email, color: data.color || existing.color };
        clientStore.setCurrentUser(u);
        return u;
      }
    } catch {
      //
    }

    const newUser: UserSummary = {
      id: generateId(),
      username: data.username.trim(),
      email: data.email.trim(),
      color: data.color || '#3B82F6',
    };
    clientStore.setCurrentUser(newUser);

    try {
      await supabase.from('User').insert([{
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        passwordHash: 'demo',
        color: newUser.color,
        updatedAt: now,
      }]);
    } catch (e) {
      console.error('User register cloud error', e);
    }

    return newUser;
  },

  getBoards: async (): Promise<BoardSummary[]> => {
    try {
      const { data: remoteBoards, error } = await supabase
        .from('Board')
        .select(`
          *,
          tickets:Ticket(count),
          members:BoardMember(count)
        `)
        .order('createdAt', { ascending: false });

      if (!error && remoteBoards && remoteBoards.length > 0) {
        const list: BoardSummary[] = remoteBoards.map((b: any) => ({
          id: b.id,
          title: b.title,
          description: b.description,
          inviteCode: b.inviteCode,
          ownerId: b.ownerId,
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
          _count: {
            tickets: b.tickets?.[0]?.count || 0,
            members: b.members?.[0]?.count || 1,
          },
          role: 'OWNER',
        }));
        setStorage('storyboard_boards_cache', list);
        return list;
      }
    } catch (e) {
      console.error('getBoards cloud error', e);
    }

    return getStorage<BoardSummary[]>('storyboard_boards_cache', []);
  },

  getBoard: async (idOrCode: string): Promise<BoardDetail | null> => {
    try {
      const clean = idOrCode.trim();
      const isUuid = /^[0-9a-fA-F-]{10,}$/.test(clean);

      let query = supabase.from('Board').select('*, tickets:Ticket(*), members:BoardMember(*)');

      if (isUuid) {
        query = query.or(`id.eq.${clean},inviteCode.eq.${clean.toUpperCase()}`);
      } else {
        query = query.eq('inviteCode', clean.toUpperCase());
      }

      const { data: remoteBoard, error } = await query.maybeSingle();

      if (!error && remoteBoard) {
        const { data: users } = await supabase.from('User').select('*');
        const userMap = new Map<string, UserSummary>();
        if (users) {
          users.forEach((u) => userMap.set(u.id, { id: u.id, username: u.username, email: u.email, color: u.color }));
        }

        const owner = userMap.get(remoteBoard.ownerId) || {
          id: remoteBoard.ownerId,
          username: 'owner',
          email: 'owner@storyboard.dev',
          color: '#3B82F6',
        };

        const members = (remoteBoard.members || []).map((m: any) => ({
          id: m.id,
          boardId: m.boardId,
          userId: m.userId,
          role: m.role || 'MEMBER',
          joinedAt: m.joinedAt || new Date().toISOString(),
          user: userMap.get(m.userId) || { id: m.userId, username: 'dev', email: 'dev@storyboard.dev', color: '#10B981' },
        }));

        const tickets: TicketItem[] = (remoteBoard.tickets || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          state: t.state || 'STORY',
          priority: t.priority || 'MEDIUM',
          color: t.color || 'yellow',
          tags: t.tags || '',
          storyPoints: t.storyPoints,
          order: t.order || 0,
          boardId: t.boardId,
          creatorId: t.creatorId,
          assigneeId: t.assigneeId,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          assignee: t.assigneeId ? userMap.get(t.assigneeId) || null : null,
          creator: t.creatorId ? userMap.get(t.creatorId) || null : null,
        }));

        return {
          id: remoteBoard.id,
          title: remoteBoard.title,
          description: remoteBoard.description,
          inviteCode: remoteBoard.inviteCode,
          ownerId: remoteBoard.ownerId,
          createdAt: remoteBoard.createdAt,
          updatedAt: remoteBoard.updatedAt,
          owner,
          members,
          tickets,
        };
      }
    } catch (e) {
      console.error('getBoard cloud error', e);
    }

    return null;
  },

  createBoard: async (title: string, description?: string): Promise<BoardDetail> => {
    let user = clientStore.getCurrentUser() || DEFAULT_USERS[0];
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const boardId = generateId();
    const now = new Date().toISOString();

    // Verify user exists in Supabase, else insert
    try {
      const { data: dbUser } = await supabase.from('User').select('*').eq('id', user.id).maybeSingle();
      if (!dbUser) {
        const { data: byUsername } = await supabase.from('User').select('*').eq('username', user.username).maybeSingle();
        if (byUsername) {
          user = { id: byUsername.id, username: byUsername.username, email: byUsername.email, color: byUsername.color };
          clientStore.setCurrentUser(user);
        } else {
          await supabase.from('User').insert([{
            id: user.id,
            username: user.username,
            email: user.email,
            passwordHash: 'demo',
            color: user.color,
            updatedAt: now,
          }]);
        }
      }
    } catch (e) {
      console.error('User verification before board creation error', e);
    }

    const newBoard: BoardDetail = {
      id: boardId,
      title: title.trim(),
      description: description?.trim() || null,
      inviteCode,
      ownerId: user.id,
      createdAt: now,
      updatedAt: now,
      owner: user,
      members: [
        { id: generateId(), boardId, userId: user.id, role: 'OWNER', joinedAt: now, user },
      ],
      tickets: [],
    };

    // Save to Supabase cloud
    try {
      await supabase.from('Board').insert([{
        id: newBoard.id,
        title: newBoard.title,
        description: newBoard.description,
        inviteCode: newBoard.inviteCode,
        ownerId: user.id,
        updatedAt: now,
      }]);

      await supabase.from('BoardMember').insert([{
        id: generateId(),
        boardId: newBoard.id,
        userId: user.id,
        role: 'OWNER',
      }]);
    } catch (e) {
      console.error('Supabase cloud createBoard error', e);
    }

    return newBoard;
  },

  deleteBoard: async (id: string) => {
    try {
      await supabase.from('Ticket').delete().eq('boardId', id);
      await supabase.from('BoardMember').delete().eq('boardId', id);
      await supabase.from('Board').delete().eq('id', id);
    } catch (e) {
      console.error('deleteBoard cloud error', e);
    }
  },

  joinBoard: async (code: string): Promise<BoardDetail | null> => {
    const cleanCode = code.trim().toUpperCase();
    let user = clientStore.getCurrentUser() || DEFAULT_USERS[0];
    const now = new Date().toISOString();

    try {
      // Find the board by inviteCode
      const { data: remoteBoard, error } = await supabase
        .from('Board')
        .select('*')
        .eq('inviteCode', cleanCode)
        .maybeSingle();

      if (!error && remoteBoard) {
        // Verify user exists in Supabase
        const { data: dbUser } = await supabase.from('User').select('*').eq('id', user.id).maybeSingle();
        if (!dbUser) {
          const { data: byUsername } = await supabase.from('User').select('*').eq('username', user.username).maybeSingle();
          if (byUsername) {
            user = { id: byUsername.id, username: byUsername.username, email: byUsername.email, color: byUsername.color };
            clientStore.setCurrentUser(user);
          } else {
            await supabase.from('User').insert([{
              id: user.id,
              username: user.username,
              email: user.email,
              passwordHash: 'demo',
              color: user.color,
              updatedAt: now,
            }]);
          }
        }

        // Add user as member if not already joined
        const { data: existingMember } = await supabase
          .from('BoardMember')
          .select('*')
          .eq('boardId', remoteBoard.id)
          .eq('userId', user.id)
          .maybeSingle();

        if (!existingMember) {
          await supabase.from('BoardMember').insert([{
            id: generateId(),
            boardId: remoteBoard.id,
            userId: user.id,
            role: 'MEMBER',
          }]);
        }

        return clientStore.getBoard(remoteBoard.id);
      }
    } catch (e) {
      console.error('joinBoard cloud error', e);
    }

    return null;
  },

  createTicket: async (boardId: string, ticketData: Partial<TicketItem>): Promise<TicketItem> => {
    const user = clientStore.getCurrentUser() || DEFAULT_USERS[0];
    const ticketId = generateId();
    const now = new Date().toISOString();

    const newTicket: TicketItem = {
      id: ticketId,
      title: ticketData.title || 'Untitled',
      description: ticketData.description || null,
      state: ticketData.state || 'STORY',
      priority: ticketData.priority || 'MEDIUM',
      color: ticketData.color || 'yellow',
      tags: ticketData.tags || '',
      storyPoints: ticketData.storyPoints || null,
      order: 0,
      boardId,
      creatorId: user.id,
      assigneeId: ticketData.assigneeId || null,
      createdAt: now,
      updatedAt: now,
      assignee: null,
      creator: user,
    };

    try {
      await supabase.from('Ticket').insert([{
        id: newTicket.id,
        title: newTicket.title,
        description: newTicket.description,
        state: newTicket.state,
        priority: newTicket.priority,
        color: newTicket.color,
        tags: newTicket.tags,
        storyPoints: newTicket.storyPoints,
        order: newTicket.order,
        boardId: newTicket.boardId,
        creatorId: newTicket.creatorId,
        assigneeId: newTicket.assigneeId,
        updatedAt: now,
      }]);
    } catch (e) {
      console.error('createTicket cloud error', e);
    }

    return newTicket;
  },

  updateTicket: async (ticketId: string, ticketData: Partial<TicketItem>): Promise<TicketItem | null> => {
    const now = new Date().toISOString();
    try {
      await supabase.from('Ticket').update({
        ...(ticketData.title !== undefined && { title: ticketData.title }),
        ...(ticketData.description !== undefined && { description: ticketData.description }),
        ...(ticketData.state !== undefined && { state: ticketData.state }),
        ...(ticketData.priority !== undefined && { priority: ticketData.priority }),
        ...(ticketData.color !== undefined && { color: ticketData.color }),
        ...(ticketData.tags !== undefined && { tags: ticketData.tags }),
        ...(ticketData.storyPoints !== undefined && { storyPoints: ticketData.storyPoints }),
        ...(ticketData.assigneeId !== undefined && { assigneeId: ticketData.assigneeId }),
        updatedAt: now,
      }).eq('id', ticketId);
    } catch (e) {
      console.error('updateTicket cloud error', e);
    }
    return null;
  },

  deleteTicket: async (ticketId: string) => {
    try {
      await supabase.from('Ticket').delete().eq('id', ticketId);
    } catch (e) {
      console.error('deleteTicket cloud error', e);
    }
  },
};
