"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useDashboardStore } from "@/lib/store/useDashboardStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, AlertTriangle, CalendarDays, Server, Ticket, Plus, Calculator, TerminalSquare } from "lucide-react";

export default function DashboardPage() {
  const [time, setTime] = useState<Date>(new Date());
  
  const { 
    realtimeStatus, 
    activeProjects, 
    openTickets, 
    unitsInField, 
    daysToNextEvent,
    initializeRealtime,
    cleanupRealtime,
    fetchInitialKPIs
  } = useDashboardStore();

  useEffect(() => {
    fetchInitialKPIs();
    initializeRealtime();
    
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
      cleanupRealtime();
    };
  }, [fetchInitialKPIs, initializeRealtime, cleanupRealtime]);

  return (
    <div className="flex flex-col gap-6">
      {/* A. Barra de estado global */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${realtimeStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : realtimeStatus === 'error' ? 'bg-red-500' : 'bg-amber-500'}`} />
            <span className="text-sm font-mono text-slate-400">
              {realtimeStatus === 'connected' ? 'REALTIME_SYNC_OK' : realtimeStatus === 'error' ? 'SYNC_ERROR' : 'CONNECTING...'}
            </span>
          </div>
          <Badge variant="outline" className="font-mono border-zinc-800 text-amber-500 bg-amber-500/10">
            {openTickets} TICKETS AVISOS
          </Badge>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="font-mono text-slate-100 text-lg tracking-wider">
            {format(time, 'dd-MM-yyyy HH:mm:ss')}
          </span>
        </div>
      </div>

      {/* B. Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Proyectos Activos</CardTitle>
            <Activity className="w-4 h-4 text-brand-pixelhue" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-slate-100">{activeProjects}</div>
            <p className="text-xs text-slate-500 mt-1">En campo o confirmados</p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Tickets Abiertos</CardTitle>
            <Ticket className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-slate-100">{openTickets}</div>
            <p className="text-xs text-slate-500 mt-1">Requieren atención</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Equipos en Campo</CardTitle>
            <Server className="w-4 h-4 text-brand-novastar" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-slate-100">{unitsInField}</div>
            <p className="text-xs text-slate-500 mt-1">Unidades desplegadas</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Próximo Evento</CardTitle>
            <CalendarDays className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-slate-100">
              {daysToNextEvent !== null ? `${daysToNextEvent}d` : '--'}
            </div>
            <p className="text-xs text-slate-500 mt-1">Días para el despliegue</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* C. Timeline de proyectos activos */}
        <Card className="col-span-1 lg:col-span-2 bg-zinc-900 border-zinc-800 flex flex-col min-h-[400px]">
          <CardHeader>
            <CardTitle className="text-slate-100">Timeline Operativo</CardTitle>
            <CardDescription className="text-slate-400">Proyectos en curso y próximos eventos</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            {activeProjects > 0 ? (
              <div className="text-slate-500 font-mono text-sm">Cargando timeline interactivo...</div>
            ) : (
              <div className="text-slate-500 font-mono text-sm border border-dashed border-zinc-800 p-8 rounded-lg">
                NO_ACTIVE_PROJECTS
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          {/* D. Panel de alertas inteligentes */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Alertas del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="text-slate-300">2 procesadores MX40 Pro detectados con firmware desactualizado.</span>
                </li>
                <li className="flex gap-3 text-sm">
                  <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  <span className="text-slate-300">Proyecto "Gala Premios" en 48h sin checklist completado.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* E. Accesos rápidos */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-slate-100">Accesos Rápidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button variant="outline" className="h-20 flex flex-col gap-2 border-zinc-800 bg-zinc-950 hover:bg-zinc-800 hover:text-slate-100">
                  <Calculator className="w-5 h-5 text-brand-pixelhue" />
                  <span className="text-xs">Calculadora</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2 border-zinc-800 bg-zinc-950 hover:bg-zinc-800 hover:text-slate-100">
                  <Plus className="w-5 h-5 text-emerald-500" />
                  <span className="text-xs">Nuevo Proyecto</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2 border-zinc-800 bg-zinc-950 hover:bg-zinc-800 hover:text-slate-100">
                  <Ticket className="w-5 h-5 text-amber-500" />
                  <span className="text-xs">Crear Ticket</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
