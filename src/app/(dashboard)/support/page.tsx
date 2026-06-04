"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, AlertCircle, CheckCircle2 } from "lucide-react";

type Ticket = {
  id: string;
  title: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "KNOWLEDGE_BASE";
  priority: "HIGH" | "MEDIUM" | "LOW";
  date: string;
};

const mockTickets: Ticket[] = [
  { id: "T-1029", title: "Pérdida de señal en fibra puerto 2", status: "OPEN", priority: "HIGH", date: "Hace 2 horas" },
  { id: "T-1028", title: "Error de Genlock en MX40 Pro", status: "IN_PROGRESS", priority: "MEDIUM", date: "Hace 5 horas" },
  { id: "KB-045", title: "Resolución de latencia en cascada", status: "KNOWLEDGE_BASE", priority: "LOW", date: "12 May 2026" },
  { id: "T-1020", title: "Fallo de fuente redundante", status: "RESOLVED", priority: "HIGH", date: "10 May 2026" },
];

export default function SupportPage() {
  const [search, setSearch] = useState("");

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "HIGH": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "MEDIUM": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "LOW": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      default: return "text-slate-500 bg-slate-500/10 border-slate-500/20";
    }
  };

  const filteredTickets = mockTickets.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-pixelhue" />
            Soporte y Knowledge Base
          </h1>
          <p className="text-slate-400 text-sm mt-1">Gestión de incidencias y base de conocimiento técnico</p>
        </div>
        <Button className="bg-brand-pixelhue hover:bg-blue-600 text-white">
          Nuevo Ticket
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
        <Input 
          type="text" 
          placeholder="Buscar incidencias, códigos de error o artículos KB..." 
          className="pl-10 bg-zinc-900 border-zinc-800 text-slate-200 h-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna: Abiertos */}
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-slate-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            En Curso
          </h3>
          {filteredTickets.filter(t => t.status === "OPEN" || t.status === "IN_PROGRESS").map(ticket => (
            <Card key={ticket.id} className="bg-zinc-900 border-zinc-800 hover:border-slate-700 transition-colors cursor-pointer">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="font-mono text-xs border-zinc-700 text-slate-400">{ticket.id}</Badge>
                  <Badge variant="outline" className={`font-mono text-[10px] ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</Badge>
                </div>
                <CardTitle className="text-sm font-medium text-slate-200 mt-2">{ticket.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xs text-slate-500 mt-2">{ticket.date}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Columna: Base de Conocimiento */}
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-slate-200 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-pixelhue" />
            Knowledge Base
          </h3>
          {filteredTickets.filter(t => t.status === "KNOWLEDGE_BASE").map(ticket => (
            <Card key={ticket.id} className="bg-zinc-950 border-brand-pixelhue/30 hover:border-brand-pixelhue/60 transition-colors cursor-pointer">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="font-mono text-xs border-brand-pixelhue/30 text-brand-pixelhue bg-brand-pixelhue/10">{ticket.id}</Badge>
                </div>
                <CardTitle className="text-sm font-medium text-slate-200 mt-2">{ticket.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xs text-slate-500 mt-2">Artículo Técnico - {ticket.date}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Columna: Resueltos */}
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Resueltos
          </h3>
          {filteredTickets.filter(t => t.status === "RESOLVED").map(ticket => (
            <Card key={ticket.id} className="bg-zinc-950 border-zinc-800 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="font-mono text-xs border-zinc-700 text-slate-500">{ticket.id}</Badge>
                </div>
                <CardTitle className="text-sm font-medium text-slate-400 mt-2 line-through decoration-slate-600">{ticket.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xs text-slate-600 mt-2">Cerrado el {ticket.date}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
