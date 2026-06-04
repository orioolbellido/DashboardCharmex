import { create } from 'zustand';
import { createClient } from '../supabase/client';

interface DashboardState {
  realtimeStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  activeProjects: number;
  openTickets: number;
  unitsInField: number;
  daysToNextEvent: number | null;
  // Acciones
  setRealtimeStatus: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
  fetchInitialKPIs: () => Promise<void>;
  initializeRealtime: () => void;
  cleanupRealtime: () => void;
}

const supabase = createClient();
let subscriptionChannel: ReturnType<typeof supabase.channel> | null = null;
let realtimeTimeout: NodeJS.Timeout | null = null;

export const useDashboardStore = create<DashboardState>((set, get) => ({
  realtimeStatus: 'disconnected',
  activeProjects: 0,
  openTickets: 0,
  unitsInField: 0,
  daysToNextEvent: null,

  setRealtimeStatus: (status) => set({ realtimeStatus: status }),

  fetchInitialKPIs: async () => {
    try {
      // 1. Proyectos activos (en_campo + confirmado)
      const { count: projectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .in('status', ['EN_CAMPO', 'CONFIRMADO']);

      // 2. Tickets abiertos
      const { count: ticketsCount } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .in('status', ['OPEN', 'IN_PROGRESS']);

      // 3. Equipos en campo
      const { count: unitsCount } = await supabase
        .from('inventory_units')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'EN_CAMPO');

      // 4. Próximo evento en días
      const { data: nextProject } = await supabase
        .from('projects')
        .select('event_date')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(1)
        .single();

      let daysToNextEvent = null;
      if (nextProject?.event_date) {
        const eventDate = new Date(nextProject.event_date);
        const today = new Date();
        const diffTime = Math.abs(eventDate.getTime() - today.getTime());
        daysToNextEvent = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      set({
        activeProjects: projectsCount || 0,
        openTickets: ticketsCount || 0,
        unitsInField: unitsCount || 0,
        daysToNextEvent,
      });
    } catch (error) {
      console.error('Error fetching initial KPIs', error);
    }
  },

  initializeRealtime: () => {
    if (subscriptionChannel) return; // Already subscribed

    get().setRealtimeStatus('connecting');
    
    if (realtimeTimeout) clearTimeout(realtimeTimeout);
    realtimeTimeout = setTimeout(() => {
      if (get().realtimeStatus === 'connecting') {
        get().setRealtimeStatus('error');
        console.warn('Realtime subscription timed out. Falling back to offline/error state.');
      }
    }, 5000);

    subscriptionChannel = supabase
      .channel('dashboard-kpis')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          get().fetchInitialKPIs();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets' },
        () => {
          get().fetchInitialKPIs();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_units' },
        () => {
          get().fetchInitialKPIs();
        }
      )
      .subscribe((status) => {
        if (realtimeTimeout) clearTimeout(realtimeTimeout);
        if (status === 'SUBSCRIBED') {
          get().setRealtimeStatus('connected');
        } else if (status === 'CHANNEL_ERROR') {
          get().setRealtimeStatus('error');
        } else if (status === 'CLOSED') {
          get().setRealtimeStatus('disconnected');
        } else if (status === 'TIMED_OUT') {
          get().setRealtimeStatus('error');
        }
      });
  },

  cleanupRealtime: () => {
    if (subscriptionChannel) {
      supabase.removeChannel(subscriptionChannel);
      subscriptionChannel = null;
      set({ realtimeStatus: 'disconnected' });
    }
  },
}));
