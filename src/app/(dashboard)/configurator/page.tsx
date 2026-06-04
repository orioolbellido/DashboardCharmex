"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { SignalMatrixCanvas } from "@/components/canvas/SignalMatrixCanvas";
import type { PDFReportData } from "@/components/reports/EngineReportPDF";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Download, MonitorPlay, Zap, Thermometer, Box, Plus, Trash2 } from "lucide-react";

const Rack3DVisualizer = dynamic(
  () => import("@/components/canvas/Rack3DVisualizer").then(mod => mod.Rack3DVisualizer),
  { ssr: false }
);

export type RackItem = {
  id: string;
  model: string;
  brand: "NovaStar" | "Pixelhue" | "Other";
  ru: number;
  positionIndex: number;
  status: "ONLINE" | "ERROR" | "WARN";
  ports: number;
  watts: number;
  btu: number;
};

// Catálogo de productos disponibles para el configurador interactivo
const catalogProducts = [
  { id: "cat-1", model: "MX40 Pro", brand: "NovaStar", ru: 2, ports: 20, watts: 95, btu: 324 },
  { id: "cat-2", model: "MX30", brand: "NovaStar", ru: 2, ports: 10, watts: 70, btu: 239 },
  { id: "cat-3", model: "MX20", brand: "NovaStar", ru: 2, ports: 6, watts: 50, btu: 170 },
  { id: "cat-4", model: "KU20", brand: "NovaStar", ru: 1, ports: 6, watts: 35, btu: 119 },
  { id: "cat-5", model: "Q8", brand: "Pixelhue", ru: 4, ports: 64, watts: 800, btu: 2730 },
  { id: "cat-6", model: "X400", brand: "Pixelhue", ru: 4, ports: 30, watts: 1200, btu: 4095 },
];

export default function ConfiguratorPage() {
  const [rackItems, setRackItems] = useState<RackItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Cálculos dinámicos
  const totalWatts = rackItems.reduce((acc, item) => acc + item.watts, 0);
  const totalBTU = rackItems.reduce((acc, item) => acc + item.btu, 0);
  const totalRU = rackItems.reduce((acc, item) => acc + item.ru, 0);
  const selectedItem = rackItems.find(i => i.id === selectedItemId);

  const handleAddToRack = (product: typeof catalogProducts[0]) => {
    // Buscar el primer hueco disponible (Bottom-Up)
    let nextPos = 1;
    const sorted = [...rackItems].sort((a, b) => a.positionIndex - b.positionIndex);
    for (const item of sorted) {
      if (nextPos + product.ru <= item.positionIndex) {
        break; // Encontramos un hueco
      }
      nextPos = item.positionIndex + item.ru;
    }

    if (nextPos + product.ru > 42) {
      alert("No hay suficiente espacio en el Rack de 42U.");
      return;
    }

    const newItem: RackItem = {
      id: `${product.id}-${Date.now()}`,
      model: product.model,
      brand: product.brand as "NovaStar" | "Pixelhue",
      ru: product.ru,
      positionIndex: nextPos,
      status: "ONLINE",
      ports: product.ports,
      watts: product.watts,
      btu: product.btu,
    };

    setRackItems([...rackItems, newItem]);
    setSelectedItemId(newItem.id);
  };

  const handleRemoveFromRack = (id: string) => {
    setRackItems(rackItems.filter(i => i.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  };

  const generateAndDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { EngineReportPDF } = await import("@/components/reports/EngineReportPDF");
      
      const mockPDFData: PDFReportData = {
        projectName: "Configuración Personalizada",
        clientName: "Dashboard Charmex",
        location: "Laboratorio Técnico",
        technician: "Ing. Sistema",
        date: new Date().toLocaleDateString(),
        totalResolution: "Custom",
        totalPixels: 0,
        processorModel: "Varios",
        portsRequired: rackItems.reduce((acc, i) => acc + i.ports, 0),
        bandwidthMbps: 0,
        totalWatts,
        thermalBTU: totalBTU,
        bom: rackItems.map(i => ({ ref: i.id, item: i.model, qty: 1, total: 0 }))
      };

      const blob = await pdf(<EngineReportPDF data={mockPDFData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Reporte_Rack_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generando PDF", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900 p-4 border border-zinc-800 rounded-lg">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <MonitorPlay className="w-6 h-6 text-brand-novastar" />
            Ingeniería de Rack Interactivo
          </h1>
          <p className="text-slate-400 text-sm mt-1">Arrastra equipos, mide consumos y valida tu diseño.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-4 mr-4">
            <div className="text-center">
              <div className="text-xs text-slate-500 flex items-center gap-1 justify-center"><Zap className="w-3 h-3 text-amber-500" /> Potencia</div>
              <div className="font-mono text-slate-200 font-bold">{totalWatts} W</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 flex items-center gap-1 justify-center"><Thermometer className="w-3 h-3 text-red-500" /> Calor</div>
              <div className="font-mono text-slate-200 font-bold">{totalBTU} BTU/h</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 flex items-center gap-1 justify-center"><Box className="w-3 h-3 text-blue-500" /> Rack</div>
              <div className="font-mono text-slate-200 font-bold">{totalRU}/42 U</div>
            </div>
          </div>
          <Button onClick={generateAndDownloadPDF} disabled={isGeneratingPDF} className="bg-brand-novastar hover:bg-red-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingPDF ? "Generando..." : "Descargar Oferta PDF"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="rack" className="flex-1 flex flex-col">
        <TabsList className="bg-zinc-900 border border-zinc-800 w-full sm:w-auto self-start">
          <TabsTrigger value="rack">Rack 3D (Ensamblaje)</TabsTrigger>
          <TabsTrigger value="matrix">Matriz 2D (Ruteo)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rack" className="flex-1 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[700px]">
            {/* CATÁLOGO (Izquierda) */}
            <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto">
              <Card className="bg-zinc-900 border-zinc-800 h-full flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-200">Catálogo de Equipos</CardTitle>
                  <CardDescription>Haz clic para añadir al rack</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto flex flex-col gap-3">
                  {catalogProducts.map(prod => (
                    <div key={prod.id} className="p-3 border border-zinc-800 rounded-md bg-zinc-950 hover:border-slate-700 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge variant="outline" className={prod.brand === 'NovaStar' ? 'text-brand-novastar border-brand-novastar/30' : 'text-brand-pixelhue border-brand-pixelhue/30'}>
                            {prod.brand}
                          </Badge>
                          <h4 className="text-slate-200 font-semibold mt-2">{prod.model}</h4>
                        </div>
                        <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">{prod.ru}U</Badge>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-xs text-zinc-500 font-mono">{prod.watts}W</div>
                        <Button size="sm" variant="outline" className="h-7 text-xs border-zinc-700 hover:bg-zinc-800 hover:text-slate-200" onClick={() => handleAddToRack(prod)}>
                          <Plus className="w-3 h-3 mr-1" /> Añadir
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* VISOR 3D (Centro) */}
            <div className="lg:col-span-6 bg-zinc-950 border border-zinc-800 rounded-lg relative overflow-hidden">
              <Rack3DVisualizer 
                items={rackItems}
                onSelectItem={setSelectedItemId}
                selectedItemId={selectedItemId}
                showCables={false}
              />
              {rackItems.length === 0 && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <span className="text-zinc-600 font-mono">El rack de 42U está vacío. Añade equipos desde el catálogo.</span>
                </div>
              )}
            </div>

            {/* PROPIEDADES (Derecha) */}
            <div className="lg:col-span-3">
              <Card className="bg-zinc-900 border-zinc-800 h-full">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-200">Propiedades</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedItem ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">Modelo</span>
                        <span className="text-lg text-slate-200 font-semibold">{selectedItem.model}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">Posición en Rack</span>
                        <span className="text-sm text-slate-300 font-mono">U{selectedItem.positionIndex} a U{selectedItem.positionIndex + selectedItem.ru - 1} ({selectedItem.ru}U)</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">Consumo de Energía</span>
                        <span className="text-sm text-amber-500 font-mono">{selectedItem.watts} W / {selectedItem.btu} BTU/h</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">Conectividad</span>
                        <span className="text-sm text-slate-300 font-mono">{selectedItem.ports} Puertos Activos</span>
                      </div>
                      
                      <div className="border-t border-zinc-800 my-2 pt-4">
                        <Button variant="destructive" className="w-full bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-900" onClick={() => handleRemoveFromRack(selectedItem.id)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Eliminar del Rack
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-zinc-500 text-center mt-10">
                      Selecciona un equipo en el Rack 3D para ver y modificar sus propiedades.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="matrix" className="mt-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-slate-100">Distribución de Señal (Ruteo Lógico)</CardTitle>
            </CardHeader>
            <CardContent>
              <SignalMatrixCanvas />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
