import { UserSummary, BoardDetail, BoardSummary, TicketItem, WorkflowState } from '@/types';
import { supabase } from './supabase';

const DEFAULT_USERS: UserSummary[] = [
  { id: 'usr-enes', username: 'enes', email: 'enes@storyboard.dev', color: '#3B82F6' },
  { id: 'usr-alex', username: 'alex_dev', email: 'alex@storyboard.dev', color: '#8B5CF6' },
  { id: 'usr-sara', username: 'sara_ui', email: 'sara@storyboard.dev', color: '#10B981' },
];

const DEFAULT_BOARD: BoardDetail = {
  id: 'sprint-1',
  title: 'Dev Sprint - Mobile & Web App',
  description: 'Core sprint backlog, API integration, auth flow and mobile responsive storyboard.',
  inviteCode: 'SPRINT1',
  ownerId: 'usr-enes',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  owner: DEFAULT_USERS[0],
  members: [
    { id: 'm-1', boardId: 'sprint-1', userId: 'usr-enes', role: 'OWNER', joinedAt: new Date().toISOString(), user: DEFAULT_USERS[0] },
    { id: 'm-2', boardId: 'sprint-1', userId: 'usr-alex', role: 'MEMBER', joinedAt: new Date().toISOString(), user: DEFAULT_USERS[1] },
    { id: 'm-3', boardId: 'sprint-1', userId: 'usr-sara', role: 'MEMBER', joinedAt: new Date().toISOString(), user: DEFAULT_USERS[2] },
  ],
  tickets: [
    {
      id: 't-1',
      title: 'Design sticky note color system & masking tape',
      description: 'Use pastel yellow, cyan, pink, green, orange, and purple with tactile shadows and tape overlay.',
      state: 'STORY',
      priority: 'HIGH',
      color: 'yellow',
      tags: 'UI/UX,Design',
      storyPoints: 3,
      order: 0,
      boardId: 'sprint-1',
      creatorId: 'usr-enes',
      assigneeId: 'usr-sara',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignee: DEFAULT_USERS[2],
    },
    {
      id: 't-2',
      title: 'Implement Dark Mode & Light Mode themes',
      description: 'Ensure smooth toggle and high contrast on wooden desk backdrop and slate dark mode.',
      state: 'TODO',
      priority: 'MEDIUM',
      color: 'pink',
      tags: 'Theme,Frontend',
      storyPoints: 2,
      order: 0,
      boardId: 'sprint-1',
      creatorId: 'usr-enes',
      assigneeId: 'usr-sara',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignee: DEFAULT_USERS[2],
    },
    {
      id: 't-3',
      title: 'Turkish & English bilingual i18n support',
      description: 'Full localized dictionary with instant switcher for all buttons, states, and modals.',
      state: 'TODO',
      priority: 'MEDIUM',
      color: 'cyan',
      tags: 'i18n,Localization',
      storyPoints: 2,
      order: 1,
      boardId: 'sprint-1',
      creatorId: 'usr-enes',
      assigneeId: 'usr-alex',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignee: DEFAULT_USERS[1],
    },
    {
      id: 't-4',
      title: 'Mobile touch drag-and-drop & column swipe tabs',
      description: 'Support seamless finger dragging and quick column tabs on 375px mobile screens.',
      state: 'IN_PROGRESS',
      priority: 'URGENT',
      color: 'orange',
      tags: 'Mobile,Touch',
      storyPoints: 5,
      order: 0,
      boardId: 'sprint-1',
      creatorId: 'usr-enes',
      assigneeId: 'usr-alex',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignee: DEFAULT_USERS[1],
    },
    {
      id: 't-5',
      title: 'QR Code mobile pairing on PC screen',
      description: 'Generate on-screen QR code so developers can point mobile camera and open the board directly.',
      state: 'IN_PROGRESS',
      priority: 'HIGH',
      color: 'purple',
      tags: 'Mobile,QR',
      storyPoints: 3,
      order: 1,
      boardId: 'sprint-1',
      creatorId: 'usr-enes',
      assigneeId: 'usr-enes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignee: DEFAULT_USERS[0],
    },
    {
      id: 't-6',
      title: 'Database schema & Cross-device sync',
      description: 'Supabase PostgreSQL with live polling to sync tickets between PC and phone without reload.',
      state: 'COMPLETED',
      priority: 'HIGH',
      color: 'green',
      tags: 'Backend,Database',
      storyPoints: 5,
      order: 0,
      boardId: 'sprint-1',
      creatorId: 'usr-enes',
      assigneeId: 'usr-enes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignee: DEFAULT_USERS[0],
    },
  ],
};

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
  getUsers: (): UserSummary[] => {
    return getStorage('storyboard_users', DEFAULT_USERS);
  },

  getCurrentUser: (): UserSummary | null => {
    return getStorage('storyboard_current_user', DEFAULT_USERS[0]);
  },

  setCurrentUser: (user: UserSummary | null) => {
    setStorage('storyboard_current_user', user);
  },

  login: async (identifier: string): Promise<UserSummary> => {
    const clean = identifier.trim().toLowerCase();
    try {
      const { data } = await supabase
        .from('User')
        .select('*')
        .or(`username.ilike.${clean},email.ilike.${clean}`)
        .single();
      if (data) {
        const u: UserSummary = { id: data.id, username: data.username, email: data.email, color: data.color };
        clientStore.setCurrentUser(u);
        return u;
      }
    } catch {
      //
    }

    const users = clientStore.getUsers();
    const found = users.find((u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean);
    if (found) {
      clientStore.setCurrentUser(found);
      return found;
    }

    const newUser: UserSummary = {
      id: 'usr-' + Date.now(),
      username: clean.split('@')[0],
      email: clean.includes('@') ? clean : `${clean}@storyboard.dev`,
      color: '#3B82F6',
    };
    const updated = [...users, newUser];
    setStorage('storyboard_users', updated);
    clientStore.setCurrentUser(newUser);

    try {
      await supabase.from('User').insert([{
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        passwordHash: 'demo',
        color: newUser.color,
      }]);
    } catch {
      //
    }

    return newUser;
  },

  register: async (data: { username: string; email: string; color?: string }): Promise<UserSummary> => {
    const newUser: UserSummary = {
      id: 'usr-' + Date.now(),
      username: data.username.trim(),
      email: data.email.trim(),
      color: data.color || '#3B82F6',
    };
    const users = clientStore.getUsers();
    const updated = [...users, newUser];
    setStorage('storyboard_users', updated);
    clientStore.setCurrentUser(newUser);

    try {
      await supabase.from('User').insert([{
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        passwordHash: 'demo',
        color: newUser.color,
      }]);
    } catch {
      //
    }

    return newUser;
  },

  getBoards: async (): Promise<BoardSummary[]> => {
    try {
      const { data: remoteBoards } = await supabase
        .from('Board')
        .select(`
          *,
          tickets:Ticket(count),
          members:BoardMember(count)
        `)
        .order('createdAt', { ascending: false });

      if (remoteBoards && remoteBoards.length > 0) {
        return remoteBoards.map((b: any) => ({
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
      }
    } catch {
      //
    }

    const boards = getStorage<BoardDetail[]>('storyboard_boards', [DEFAULT_BOARD]);
    return boards.map((b) => ({
      id: b.id,
      title: b.title,
      description: b.description,
      inviteCode: b.inviteCode,
      ownerId: b.ownerId,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      _count: {
        tickets: b.tickets?.length || 0,
        members: b.members?.length || 1,
      },
      role: 'OWNER',
    }));
  },

  getBoard: async (idOrCode: string): Promise<BoardDetail | null> => {
    try {
      const { data: remoteBoard } = await supabase
        .from('Board')
        .select(`
          *,
          owner:User!BoardOwner(*),
          members:BoardMember(*, user:User(*)),
          tickets:Ticket(*, assignee:User!TicketAssignee(*))
        `)
        .or(`id.eq.${idOrCode},inviteCode.eq.${idOrCode.toUpperCase()}`)
        .single();

      if (remoteBoard) {
        return {
          id: remoteBoard.id,
          title: remoteBoard.title,
          description: remoteBoard.description,
          inviteCode: remoteBoard.inviteCode,
          ownerId: remoteBoard.ownerId,
          createdAt: remoteBoard.createdAt,
          updatedAt: remoteBoard.updatedAt,
          owner: remoteBoard.owner || DEFAULT_USERS[0],
          members: remoteBoard.members || [],
          tickets: remoteBoard.tickets || [],
        };
      }
    } catch {
      //
    }

    const boards = getStorage<BoardDetail[]>('storyboard_boards', [DEFAULT_BOARD]);
    const found = boards.find((b) => b.id === idOrCode || b.inviteCode.toUpperCase() === idOrCode.toUpperCase());
    return found || null;
  },

  createBoard: async (title: string, description?: string): Promise<BoardDetail> => {
    const user = clientStore.getCurrentUser() || DEFAULT_USERS[0];
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const boardId = 'board-' + Date.now();

    const newBoard: BoardDetail = {
      id: boardId,
      title: title.trim(),
      description: description?.trim() || null,
      inviteCode,
      ownerId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: user,
      members: [
        { id: 'm-' + Date.now(), boardId, userId: user.id, role: 'OWNER', joinedAt: new Date().toISOString(), user },
      ],
      tickets: [],
    };

    // Save locally
    const boards = getStorage<BoardDetail[]>('storyboard_boards', [DEFAULT_BOARD]);
    setStorage('storyboard_boards', [newBoard, ...boards]);

    // Save to Supabase cloud
    try {
      await supabase.from('User').upsert([{
        id: user.id,
        username: user.username,
        email: user.email,
        passwordHash: 'demo',
        color: user.color,
      }]);

      await supabase.from('Board').insert([{
        id: newBoard.id,
        title: newBoard.title,
        description: newBoard.description,
        inviteCode: newBoard.inviteCode,
        ownerId: user.id,
      }]);

      await supabase.from('BoardMember').insert([{
        id: 'm-' + Date.now(),
        boardId: newBoard.id,
        userId: user.id,
        role: 'OWNER',
      }]);
    } catch (e) {
      console.error('Supabase cloud board creation fallback', e);
    }

    return newBoard;
  },

  deleteBoard: async (id: string) => {
    const boards = getStorage<BoardDetail[]>('storyboard_boards', [DEFAULT_BOARD]);
    setStorage('storyboard_boards', boards.filter((b) => b.id !== id));
    try {
      await supabase.from('Board').delete().eq('id', id);
    } catch {
      //
    }
  },

  joinBoard: async (code: string): Promise<BoardDetail | null> => {
    const cleanCode = code.trim().toUpperCase();
    const user = clientStore.getCurrentUser() || DEFAULT_USERS[0];

    // Try cloud first
    try {
      const { data: remoteBoard } = await supabase
        .from('Board')
        .select('*')
        .eq('inviteCode', cleanCode)
        .single();

      if (remoteBoard) {
        await supabase.from('User').upsert([{
          id: user.id,
          username: user.username,
          email: user.email,
          passwordHash: 'demo',
          color: user.color,
        }]);

        await supabase.from('BoardMember').upsert([{
          id: 'm-' + Date.now(),
          boardId: remoteBoard.id,
          userId: user.id,
          role: 'MEMBER',
        }]);

        return clientStore.getBoard(remoteBoard.id);
      }
    } catch {
      //
    }

    // Local fallback
    const boards = getStorage<BoardDetail[]>('storyboard_boards', [DEFAULT_BOARD]);
    const board = boards.find((b) => b.inviteCode === cleanCode || b.id === code);
    if (!board) return null;

    if (!board.members.some((m) => m.userId === user.id)) {
      board.members.push({
        id: 'm-' + Date.now(),
        boardId: board.id,
        userId: user.id,
        role: 'MEMBER',
        joinedAt: new Date().toISOString(),
        user,
      });
      setStorage('storyboard_boards', boards);
    }
    return board;
  },

  createTicket: async (boardId: string, ticketData: Partial<TicketItem>): Promise<TicketItem> => {
    const user = clientStore.getCurrentUser() || DEFAULT_USERS[0];
    const ticketId = 't-' + Date.now();

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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignee: null,
      creator: user,
    };

    const boards = getStorage<BoardDetail[]>('storyboard_boards', [DEFAULT_BOARD]);
    const board = boards.find((b) => b.id === boardId) || boards[0];
    const assignee = board.members.find((m) => m.user.id === ticketData.assigneeId)?.user || null;
    newTicket.assignee = assignee;

    board.tickets.push(newTicket);
    setStorage('storyboard_boards', boards);

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
      }]);
    } catch {
      //
    }

    return newTicket;
  },

  updateTicket: async (ticketId: string, ticketData: Partial<TicketItem>): Promise<TicketItem | null> => {
    const boards = getStorage<BoardDetail[]>('storyboard_boards', [DEFAULT_BOARD]);
    for (const board of boards) {
      const idx = board.tickets.findIndex((t) => t.id === ticketId);
      if (idx !== -1) {
        const current = board.tickets[idx];
        const assignee = ticketData.assigneeId
          ? board.members.find((m) => m.user.id === ticketData.assigneeId)?.user || null
          : ticketData.assigneeId === null
          ? null
          : current.assignee;

        board.tickets[idx] = {
          ...current,
          ...ticketData,
          assignee,
          updatedAt: new Date().toISOString(),
        };
        setStorage('storyboard_boards', boards);

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
          }).eq('id', ticketId);
        } catch {
          //
        }

        return board.tickets[idx];
      }
    }
    return null;
  },

  deleteTicket: async (ticketId: string) => {
    const boards = getStorage<BoardDetail[]>('storyboard_boards', [DEFAULT_BOARD]);
    for (const board of boards) {
      board.tickets = board.tickets.filter((t) => t.id !== ticketId);
    }
    setStorage('storyboard_boards', boards);

    try {
      await supabase.from('Ticket').delete().eq('id', ticketId);
    } catch {
      //
    }
  },
};
