"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { SignalMatrixCanvas } from "@/components/canvas/SignalMatrixCanvas";
import type { PDFReportData } from "@/components/reports/EngineReportPDF";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, MonitorPlay } from "lucide-react";

// Para evitar problemas de SSR con canvas y react-three-fiber
const Rack3DVisualizer = dynamic(
  () => import("@/components/canvas/Rack3DVisualizer").then(mod => mod.Rack3DVisualizer),
  { ssr: false }
);

// We need the type for RackItem since we are using it
export type RackItem = {
  id: string;
  model: string;
  brand: "NovaStar" | "Pixelhue" | "Other";
  ru: number; // Rack Units (1U = 0.044m approx in our scale)
  positionIndex: number; // Position from bottom (1 to 42)
  status: "ONLINE" | "ERROR" | "WARN";
  ports: number;
};

const mockRackItems: RackItem[] = [
  { id: "mx40-1", model: "MX40 Pro", brand: "NovaStar", ru: 2, positionIndex: 10, status: "ONLINE", ports: 20 },
  { id: "mx40-2", model: "MX40 Pro", brand: "NovaStar", ru: 2, positionIndex: 12, status: "ONLINE", ports: 20 },
  { id: "q8-1", model: "Q8", brand: "Pixelhue", ru: 4, positionIndex: 15, status: "ONLINE", ports: 16 },
  { id: "p20-1", model: "P20", brand: "Pixelhue", ru: 2, positionIndex: 20, status: "WARN", ports: 4 },
];

const mockPDFData: PDFReportData = {
  projectName: "Gala Premios Nacionales",
  clientName: "Productora AV SA",
  location: "Madrid, IFEMA",
  technician: "Ing. Sistema",
  date: new Date().toLocaleDateString(),
  totalResolution: "7680 x 2160",
  totalPixels: 16588800,
  processorModel: "2x NovaStar MX40 Pro",
  portsRequired: 26,
  bandwidthMbps: 23887.87,
  totalWatts: 4500,
  thermalBTU: 15354.63,
  bom: [
    { ref: "NOV-MX40", item: "NovaStar MX40 Pro", qty: 2, total: 12000 },
    { ref: "PIX-Q8", item: "Pixelhue Q8", qty: 1, total: 18000 },
  ]
};

export default function ConfiguratorPage() {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generateAndDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { EngineReportPDF } = await import("@/components/reports/EngineReportPDF");
      const blob = await pdf(<EngineReportPDF data={mockPDFData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Reporte_Ingenieria_${mockPDFData.projectName.replace(/\s+/g, '_')}.pdf`;
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <MonitorPlay className="w-6 h-6 text-brand-novastar" />
            Configurador de Ingeniería
          </h1>
          <p className="text-slate-400 text-sm mt-1">Diseño de Rack 3D, Ruteo de Señal y Exportación Técnica</p>
        </div>
        <Button 
          onClick={generateAndDownloadPDF} 
          disabled={isGeneratingPDF}
          className="bg-brand-novastar hover:bg-red-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          {isGeneratingPDF ? "Generando..." : "Descargar Oferta PDF"}
        </Button>
      </div>

      <Tabs defaultValue="rack" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="rack" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
            Rack 3D Interactivo
          </TabsTrigger>
          <TabsTrigger value="matrix" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
            Matriz de Ruteo 2D
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="rack" className="mt-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-slate-100">Vista Frontal y Trasera del Rack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] w-full">
                <Rack3DVisualizer 
                  items={mockRackItems}
                  onSelectItem={setSelectedItemId}
                  selectedItemId={selectedItemId}
                  showCables={false}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix" className="mt-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-slate-100">Distribución de Señal (Canvas)</CardTitle>
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
