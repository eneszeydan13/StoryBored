'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import confetti from 'canvas-confetti';
import { BoardDetail, TicketItem, WorkflowState } from '@/types';
import { WORKFLOW_STATES } from '@/lib/constants';
import { KanbanColumn } from './KanbanColumn';
import { PostItCard } from './PostItCard';
import { TicketModal } from './TicketModal';
import { FilterBar } from './FilterBar';
import { useI18n } from '@/lib/i18n/context';
import { clientStore } from '@/lib/clientStore';

interface KanbanBoardProps {
  initialBoard: BoardDetail;
}

export function KanbanBoard({ initialBoard }: KanbanBoardProps) {
  const { t } = useI18n();
  const [board, setBoard] = useState<BoardDetail>(initialBoard);
  const [tickets, setTickets] = useState<TicketItem[]>(initialBoard.tickets || []);
  const [activeTicket, setActiveTicket] = useState<TicketItem | null>(null);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketItem | null>(null);
  const [defaultColumnState, setDefaultColumnState] = useState<WorkflowState>('STORY');

  // Mobile active column tab
  const [mobileActiveState, setMobileActiveState] = useState<WorkflowState>('STORY');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');

  // Setup sensors with activation constraints for mobile touch and desktop pointer
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200,
      tolerance: 5,
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(pointerSensor, touchSensor, keyboardSensor);

  // Poll for live real-time multi-device sync every 4 seconds
  const fetchBoardData = useCallback(async () => {
    try {
      const res = await fetch(`/api/boards/${board.id}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.board) {
          setBoard(data.board);
          setTickets(data.board.tickets || []);
        }
      }
    } catch (e) {
      console.error('Failed to sync board', e);
    }
  }, [board.id]);

  useEffect(() => {
    const interval = setInterval(fetchBoardData, 4000);
    return () => clearInterval(interval);
  }, [fetchBoardData]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ticket.title.toLowerCase().includes(q);
        const matchDesc = ticket.description?.toLowerCase().includes(q) || false;
        const matchTags = ticket.tags?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchDesc && !matchTags) return false;
      }
      // Priority
      if (selectedPriority && ticket.priority !== selectedPriority) {
        return false;
      }
      // Assignee
      if (selectedAssignee) {
        if (selectedAssignee === 'unassigned') {
          if (ticket.assigneeId) return false;
        } else if (ticket.assigneeId !== selectedAssignee) {
          return false;
        }
      }
      return true;
    });
  }, [tickets, searchQuery, selectedPriority, selectedAssignee]);

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FDE047', '#38BDF8', '#4ADE80', '#F472B6', '#A78BFA'],
      });
    } catch {
      // fallback if canvas not available
    }
  };

  // DnD Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const ticket = tickets.find((t) => t.id === active.id);
    if (ticket) {
      setActiveTicket(ticket);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTicket = active.data.current?.type === 'Ticket';
    const isOverTicket = over.data.current?.type === 'Ticket';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTicket) return;

    // Moving ticket over another ticket in a different column
    if (isActiveTicket && isOverTicket) {
      setTickets((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const overIndex = prev.findIndex((t) => t.id === overId);

        if (prev[activeIndex].state !== prev[overIndex].state) {
          const updated = [...prev];
          updated[activeIndex] = {
            ...updated[activeIndex],
            state: prev[overIndex].state,
          };
          return arrayMove(updated, activeIndex, overIndex);
        }

        return arrayMove(prev, activeIndex, overIndex);
      });
    }

    // Moving ticket over an empty column
    if (isActiveTicket && isOverColumn) {
      const overState = over.data.current?.state as WorkflowState;
      setTickets((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        if (activeIndex === -1) return prev;

        if (prev[activeIndex].state !== overState) {
          const updated = [...prev];
          updated[activeIndex] = {
            ...updated[activeIndex],
            state: overState,
          };
          return arrayMove(updated, activeIndex, activeIndex);
        }
        return prev;
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTicket(null);

    if (!over) return;

    const activeId = active.id as string;
    const currentTicket = tickets.find((t) => t.id === activeId);
    if (!currentTicket) return;

    // Persist new state and order in database
    try {
      const targetState = currentTicket.state;
      const columnTickets = tickets.filter((t) => t.state === targetState);
      const newOrder = columnTickets.findIndex((t) => t.id === activeId);

      if (targetState === 'COMPLETED') {
        triggerConfetti();
      }

      await fetch(`/api/tickets/${activeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: targetState,
          order: newOrder,
        }),
      });
    } catch (error) {
      console.error('Failed to persist ticket move', error);
      fetchBoardData(); // Rollback to server state
    }
  };

  // Ticket CRUD operations
  const handleOpenAddModal = (state: WorkflowState) => {
    setEditingTicket(null);
    setDefaultColumnState(state);
    setModalOpen(true);
  };

  const handleOpenEditModal = (ticket: TicketItem) => {
    setEditingTicket(ticket);
    setModalOpen(true);
  };

  const handleSaveTicket = async (ticketData: Partial<TicketItem>) => {
    if (editingTicket) {
      // Optimistic update in clientStore
      const updated = await clientStore.updateTicket(editingTicket.id, ticketData);
      if (updated) {
        setTickets((prev) =>
          prev.map((t) => (t.id === editingTicket.id ? updated : t))
        );
      }
      if (ticketData.state === 'COMPLETED' && editingTicket.state !== 'COMPLETED') {
        triggerConfetti();
      }
      try {
        const res = await fetch(`/api/tickets/${editingTicket.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ticketData),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.ticket) {
            setTickets((prev) =>
              prev.map((t) => (t.id === editingTicket.id ? data.ticket : t))
            );
          }
        }
      } catch {
        //
      }
    } else {
      // Create
      const created = await clientStore.createTicket(board.id, ticketData);
      setTickets((prev) => [...prev, created]);
      if (ticketData.state === 'COMPLETED') {
        triggerConfetti();
      }
      try {
        const res = await fetch(`/api/boards/${board.id}/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ticketData),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.ticket) {
            setTickets((prev) =>
              prev.map((t) => (t.id === created.id ? data.ticket : t))
            );
          }
        }
      } catch {
        //
      }
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    await clientStore.deleteTicket(ticketId);
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    try {
      await fetch(`/api/tickets/${ticketId}`, { method: 'DELETE' });
    } catch {
      //
    }
  };

  const handleMoveState = async (ticketId: string, newState: WorkflowState) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || ticket.state === newState) return;

    // Optimistic update
    await clientStore.updateTicket(ticketId, { state: newState });
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, state: newState } : t))
    );

    if (newState === 'COMPLETED') {
      triggerConfetti();
    }

    try {
      await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: newState }),
      });
    } catch {
      //
    }
  };

  return (
    <div className="w-full">
      {/* Search & Filter Toolbar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        selectedAssignee={selectedAssignee}
        onAssigneeChange={setSelectedAssignee}
        members={board.members}
        onClearFilters={() => {
          setSearchQuery('');
          setSelectedPriority('');
          setSelectedAssignee('');
        }}
      />

      {/* Mobile / Tablet Column Navigation Switcher */}
      <div className="lg:hidden flex items-center gap-1.5 p-1.5 mb-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200 dark:border-stone-800 shadow-sm overflow-x-auto">
        {WORKFLOW_STATES.map((state) => {
          const count = filteredTickets.filter((t) => t.state === state.id).length;
          const isActive = mobileActiveState === state.id;
          return (
            <button
              key={state.id}
              onClick={() => setMobileActiveState(state.id)}
              className={`flex-1 min-w-[90px] py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'bg-amber-400 text-stone-950 shadow-md scale-[1.02]'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <span>{t(state.key as any)}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-stone-950 text-amber-300'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* DnD Context & Board Columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Desktop View: 4 Columns Grid (Equal 1fr width without collisions) */}
        <div className="hidden lg:grid grid-cols-4 gap-4 xl:gap-5 items-start w-full">
          {WORKFLOW_STATES.map((state) => {
            const columnTickets = filteredTickets.filter(
              (t) => t.state === state.id
            );
            return (
              <KanbanColumn
                key={state.id}
                id={state.id}
                titleKey={state.key}
                badgeBg={state.badgeBg}
                badgeText={state.badgeText}
                iconName={state.iconName}
                tickets={columnTickets}
                onAddTicket={handleOpenAddModal}
                onEditTicket={handleOpenEditModal}
                onDeleteTicket={handleDeleteTicket}
                onMoveState={handleMoveState}
              />
            );
          })}
        </div>

        {/* Mobile View: Single Column based on active tab */}
        <div className="lg:hidden">
          {(() => {
            const state = WORKFLOW_STATES.find(
              (s) => s.id === mobileActiveState
            )!;
            const columnTickets = filteredTickets.filter(
              (t) => t.state === state.id
            );
            return (
              <div className="w-full max-w-lg mx-auto">
                <KanbanColumn
                  id={state.id}
                  titleKey={state.key}
                  badgeBg={state.badgeBg}
                  badgeText={state.badgeText}
                  iconName={state.iconName}
                  tickets={columnTickets}
                  onAddTicket={handleOpenAddModal}
                  onEditTicket={handleOpenEditModal}
                  onDeleteTicket={handleDeleteTicket}
                  onMoveState={handleMoveState}
                />
              </div>
            );
          })()}
        </div>

        {/* Drag Overlay for smooth preview */}
        <DragOverlay>
          {activeTicket ? (
            <PostItCard
              ticket={activeTicket}
              isDragOverlay
              onEdit={() => {}}
              onDelete={() => {}}
              onMoveState={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Ticket Create/Edit Modal */}
      <TicketModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTicket(null);
        }}
        onSave={handleSaveTicket}
        onDelete={handleDeleteTicket}
        initialData={editingTicket}
        defaultState={defaultColumnState}
        members={board.members}
      />
    </div>
  );
}
