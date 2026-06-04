"use client";

import React, { useRef } from "react";
import { useCanvasStore } from "@/lib/store/useCanvasStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Download } from "lucide-react";

export function SignalMatrixCanvas() {
  const {
    ports,
    cabinets,
    mappings,
    activePortId,
    setActivePort,
    assignCabinet,
    unassignCabinet,
    autoDistribute,
    getPortUsage,
  } = useCanvasStore();

  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCabinetClick = (cabId: string) => {
    const existingMapping = mappings.find(m => m.cabinetId === cabId);
    
    if (existingMapping && existingMapping.portId === activePortId) {
      // Toggle off if already assigned to current port
      unassignCabinet(cabId);
    } else if (activePortId) {
      assignCabinet(cabId, activePortId);
    }
  };

  const activeColor = ports.find(p => p.id === activePortId)?.color || "#ffffff";

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full bg-zinc-950 border border-zinc-800 rounded-lg p-6">
      
      {/* Panel Lateral de Puertos */}
      <div className="w-full md:w-64 flex flex-col gap-4">
        <h3 className="text-slate-100 font-bold mb-2">Procesador (Tx)</h3>
        
        <div className="flex flex-col gap-2">
          {ports.map(port => {
            const usage = getPortUsage(port.id);
            const isSelected = activePortId === port.id;
            
            // Color de carga
            let loadColor = "text-emerald-500 bg-emerald-500/10";
            if (usage.percent > 90) loadColor = "text-red-500 bg-red-500/10";
            else if (usage.percent > 70) loadColor = "text-amber-500 bg-amber-500/10";

            return (
              <div 
                key={port.id}
                onClick={() => setActivePort(port.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors flex flex-col gap-2 ${
                  isSelected ? 'border-slate-400 bg-zinc-800' : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: port.color }} />
                    <span className="font-mono text-sm text-slate-200">{port.label}</span>
                  </div>
                  <Badge variant="outline" className={`font-mono text-xs ${loadColor} border-0`}>
                    {Math.round(usage.percent)}%
                  </Badge>
                </div>
                <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(usage.percent, 100)}%`, 
                      backgroundColor: usage.isOverloaded ? '#ef4444' : port.color 
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Button 
            variant="outline" 
            className="w-full border-zinc-800 hover:bg-zinc-800 text-slate-300"
            onClick={autoDistribute}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Auto-Distribuir
          </Button>
          <Button 
            variant="default" 
            className="w-full bg-brand-pixelhue hover:bg-blue-600 text-white"
            onClick={() => alert("Función para exportar a PNG en desarrollo")}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar PNG
          </Button>
        </div>
      </div>

      {/* Grid de Gabinetes LED */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-slate-100 font-bold mb-4 flex items-center justify-between">
          Muro LED (Rx)
          <span className="text-xs font-mono text-slate-400">Click para asignar al {ports.find(p => p.id === activePortId)?.label}</span>
        </h3>

        <div 
          ref={canvasRef}
          className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 flex items-center justify-center min-h-[400px] overflow-auto"
        >
          {/* Asumimos un grid de 5x5 para este mock */}
          <div className="grid grid-cols-5 gap-1">
            {cabinets.map(cab => {
              const mapping = mappings.find(m => m.cabinetId === cab.id);
              const portColor = mapping ? ports.find(p => p.id === mapping.portId)?.color : "#27272a";
              
              return (
                <div
                  key={cab.id}
                  onClick={() => handleCabinetClick(cab.id)}
                  className="w-16 h-16 sm:w-20 sm:h-20 border border-zinc-800 flex items-center justify-center cursor-pointer transition-colors relative group"
                  style={{ backgroundColor: portColor }}
                >
                  {/* Overlay hover effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity"
                    style={{ backgroundColor: activeColor }}
                  />
                  <span className="text-[10px] font-mono text-white/50 pointer-events-none">
                    {cab.x},{cab.y}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
