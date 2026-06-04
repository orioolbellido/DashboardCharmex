import { create } from 'zustand';

export interface Cabinet {
  id: string;
  x: number;
  y: number;
  pixels: number;
}

export interface Port {
  id: string;
  label: string;
  capacity: number;
  color: string;
}

export interface SignalMapping {
  cabinetId: string;
  portId: string;
}

interface CanvasState {
  ports: Port[];
  cabinets: Cabinet[];
  mappings: SignalMapping[];
  activePortId: string | null;
  // Actions
  setActivePort: (id: string | null) => void;
  assignCabinet: (cabinetId: string, portId: string) => void;
  unassignCabinet: (cabinetId: string) => void;
  autoDistribute: () => void;
  getPortUsage: (portId: string) => { usedPixels: number; percent: number; isOverloaded: boolean };
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  ports: [
    { id: 'p1', label: 'Port 1', capacity: 655360, color: '#ef4444' },
    { id: 'p2', label: 'Port 2', capacity: 655360, color: '#f97316' },
    { id: 'p3', label: 'Port 3', capacity: 655360, color: '#eab308' },
    { id: 'p4', label: 'Port 4', capacity: 655360, color: '#22c55e' },
    { id: 'p5', label: 'Port 5', capacity: 655360, color: '#3b82f6' },
    { id: 'p6', label: 'Port 6', capacity: 655360, color: '#a855f7' },
  ],
  // Mock grid 5x5 cabinets, each 104x104 pixels = 10816 pixels
  cabinets: Array.from({ length: 25 }, (_, i) => ({
    id: `cab-${i}`,
    x: i % 5,
    y: Math.floor(i / 5),
    pixels: 10816,
  })),
  mappings: [],
  activePortId: 'p1',

  setActivePort: (id) => set({ activePortId: id }),

  assignCabinet: (cabinetId, portId) => {
    const { getPortUsage, cabinets } = get();
    const cabinet = cabinets.find(c => c.id === cabinetId);
    if (!cabinet) return;

    const usage = getPortUsage(portId);
    const port = get().ports.find(p => p.id === portId);
    
    // Validar capacidad
    if (port && usage.usedPixels + cabinet.pixels > port.capacity) {
      console.warn("Port capacity exceeded!");
      return; // Bloquear si supera capacidad
    }

    set((state) => {
      const filtered = state.mappings.filter(m => m.cabinetId !== cabinetId);
      return { mappings: [...filtered, { cabinetId, portId }] };
    });
  },

  unassignCabinet: (cabinetId) => {
    set((state) => ({
      mappings: state.mappings.filter(m => m.cabinetId !== cabinetId)
    }));
  },

  autoDistribute: () => {
    // Algoritmo greedy simple
    const { cabinets, ports } = get();
    let currentPortIdx = 0;
    let currentUsage = 0;
    const newMappings: SignalMapping[] = [];

    cabinets.forEach((cab) => {
      let port = ports[currentPortIdx];
      if (currentUsage + cab.pixels > port.capacity) {
        currentPortIdx = (currentPortIdx + 1) % ports.length;
        port = ports[currentPortIdx];
        currentUsage = 0;
      }
      newMappings.push({ cabinetId: cab.id, portId: port.id });
      currentUsage += cab.pixels;
    });

    set({ mappings: newMappings });
  },

  getPortUsage: (portId) => {
    const state = get();
    const port = state.ports.find(p => p.id === portId);
    if (!port) return { usedPixels: 0, percent: 0, isOverloaded: false };

    const usedPixels = state.mappings
      .filter(m => m.portId === portId)
      .reduce((sum, map) => {
        const cab = state.cabinets.find(c => c.id === map.cabinetId);
        return sum + (cab?.pixels || 0);
      }, 0);

    const percent = (usedPixels / port.capacity) * 100;
    return {
      usedPixels,
      percent,
      isOverloaded: percent > 100
    };
  }
}));
