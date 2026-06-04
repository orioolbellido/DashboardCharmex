"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Flag } from "lucide-react";

export default function ChecklistPage() {
  const steps = [
    { id: 1, title: "Verificación de energía", status: "DONE" },
    { id: 2, title: "Ruteo de fibra óptica", status: "DONE" },
    { id: 3, title: "Configuración de mapping NovaStar/Pixelhue", status: "IN_PROGRESS" },
    { id: 4, title: "Ajuste de colorimetría (HDR/SDR)", status: "PENDING" },
    { id: 5, title: "Test de latencia", status: "PENDING" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Flag className="w-6 h-6 text-brand-pixelhue" />
            Checklist de Proyecto
          </h1>
          <p className="text-slate-400 text-sm mt-1">Gala Premios Nacionales - IFEMA</p>
        </div>
        <Badge variant="outline" className="border-amber-500/50 text-amber-500 bg-amber-500/10">
          EN PROGRESO
        </Badge>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-slate-100">Fases de Despliegue Técnico</CardTitle>
          <CardDescription className="text-slate-400">Marca las tareas como completadas una vez validadas in situ.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {steps.map(step => (
              <div key={step.id} className="flex items-center justify-between p-4 border border-zinc-800 rounded-lg hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  {step.status === "DONE" ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : step.status === "IN_PROGRESS" ? (
                    <Circle className="w-6 h-6 text-amber-500 animate-pulse" />
                  ) : (
                    <Circle className="w-6 h-6 text-zinc-600" />
                  )}
                  <div>
                    <h3 className={`font-medium ${step.status === 'DONE' ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                      {step.title}
                    </h3>
                  </div>
                </div>
                {step.status !== "DONE" && (
                  <Button variant="outline" size="sm" className="border-zinc-700 text-slate-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-colors">
                    Validar
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
