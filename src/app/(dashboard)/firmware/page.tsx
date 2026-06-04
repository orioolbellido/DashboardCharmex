"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Cpu, AlertCircle, DownloadCloud } from "lucide-react";

const supabase = createClient();

type FirmwareVersion = {
  id: string;
  version_string: string;
  is_certified: boolean;
  release_date: string;
  release_notes: string;
  download_url: string;
  product: { model: string; brand: { name: string } };
};

export default function FirmwarePage() {
  const [firmware, setFirmware] = useState<FirmwareVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFirmware() {
      const { data, error } = await supabase
        .from('firmware_versions')
        .select(`
          id,
          version_string,
          is_certified,
          release_date,
          release_notes,
          download_url,
          product:products (
            model,
            brand:brands (name)
          )
        `)
        .order('release_date', { ascending: false });
      
      if (!error && data) {
        setFirmware(data as unknown as FirmwareVersion[]);
      }
      setLoading(false);
    }
    fetchFirmware();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Cpu className="w-6 h-6 text-emerald-500" />
          Centro de Firmware
        </h1>
        <p className="text-slate-400 text-sm mt-1">Gestión de versiones certificadas e históricos de release</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Versiones Disponibles</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Equipo</TableHead>
                  <TableHead className="text-slate-400">Versión</TableHead>
                  <TableHead className="text-slate-400">Estado</TableHead>
                  <TableHead className="text-slate-400">Fecha</TableHead>
                  <TableHead className="text-slate-400 text-right">Descarga</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-32 text-slate-500 font-mono text-sm">
                      LOADING_FIRMWARE_DATA...
                    </TableCell>
                  </TableRow>
                ) : firmware.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-32 text-slate-500 font-mono text-sm">
                      NO_VERSIONS_FOUND
                    </TableCell>
                  </TableRow>
                ) : (
                  firmware.map((fw) => (
                    <TableRow key={fw.id} className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableCell className="font-medium text-slate-200">
                        {fw.product?.brand?.name} {fw.product?.model}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-300">{fw.version_string}</TableCell>
                      <TableCell>
                        {fw.is_certified ? (
                          <Badge variant="outline" className="text-emerald-500 border-emerald-500/50">CERTIFICADA</Badge>
                        ) : (
                          <Badge variant="outline" className="text-zinc-500 border-zinc-500/50">BETA/OLD</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {fw.release_date ? new Date(fw.release_date).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {fw.download_url && (
                          <a href={fw.download_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-brand-pixelhue hover:text-blue-400 text-sm font-mono transition-colors">
                            <DownloadCloud className="w-4 h-4" /> ZIP
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Alertas de Actualización
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-zinc-800 rounded-lg">
              <span className="text-slate-500 text-sm">
                Cruzando datos de inventario con versiones certificadas...
              </span>
              <Badge variant="outline" className="mt-4 border-emerald-500/50 text-emerald-500">
                0 EQUIPOS DESACTUALIZADOS
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
