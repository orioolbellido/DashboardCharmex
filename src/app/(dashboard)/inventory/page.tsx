"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, Search, Filter } from "lucide-react";
import { format } from "date-fns";

const supabase = createClient();

type InventoryUnit = {
  id: string;
  serial_number: string;
  status: 'STOCK' | 'RESERVADO' | 'EN_CAMPO' | 'EN_REPARACIÓN' | 'BAJA';
  firmware_version: string;
  warranty_expires: string;
  location_label: string;
  product: { model: string; brand: { name: string } };
};

export default function InventoryPage() {
  const [units, setUnits] = useState<InventoryUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchInventory() {
      const { data, error } = await supabase
        .from('inventory_units')
        .select(`
          id,
          serial_number,
          status,
          firmware_version,
          warranty_expires,
          location_label,
          product:products (
            model,
            brand:brands (name)
          )
        `);
      
      if (!error && data) {
        setUnits(data as unknown as InventoryUnit[]);
      }
      setLoading(false);
    }
    fetchInventory();
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'STOCK': return <Badge variant="outline" className="text-emerald-500 border-emerald-500/50">STOCK</Badge>;
      case 'EN_CAMPO': return <Badge variant="outline" className="text-amber-500 border-amber-500/50">EN CAMPO</Badge>;
      case 'RESERVADO': return <Badge variant="outline" className="text-blue-500 border-blue-500/50">RESERVADO</Badge>;
      case 'EN_REPARACIÓN': return <Badge variant="outline" className="text-red-500 border-red-500/50">REPARACIÓN</Badge>;
      default: return <Badge variant="outline" className="text-zinc-500 border-zinc-500/50">{status}</Badge>;
    }
  };

  const filteredUnits = units.filter(u => 
    u.serial_number?.toLowerCase().includes(search.toLowerCase()) || 
    u.product?.model?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-pixelhue" />
            Inventario
          </h1>
          <p className="text-slate-400 text-sm mt-1">Gestión de unidades físicas y control de stock</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input 
              type="text" 
              placeholder="Buscar S/N o modelo..." 
              className="pl-9 bg-zinc-950 border-zinc-800"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="border-zinc-800 bg-zinc-950 text-slate-400">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-950/50">
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Modelo</TableHead>
                <TableHead className="text-slate-400">S/N</TableHead>
                <TableHead className="text-slate-400">Estado</TableHead>
                <TableHead className="text-slate-400">Ubicación</TableHead>
                <TableHead className="text-slate-400">Firmware</TableHead>
                <TableHead className="text-slate-400">Garantía</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32 text-slate-500 font-mono text-sm">
                    CARGANDO_INVENTARIO...
                  </TableCell>
                </TableRow>
              ) : filteredUnits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32 text-slate-500 font-mono text-sm">
                    NO_DATA_FOUND
                  </TableCell>
                </TableRow>
              ) : (
                filteredUnits.map((unit) => (
                  <TableRow key={unit.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="font-medium text-slate-200">
                      <div className="flex flex-col">
                        <span>{unit.product?.model}</span>
                        <span className="text-xs text-slate-500">{unit.product?.brand?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-400">{unit.serial_number}</TableCell>
                    <TableCell>{getStatusBadge(unit.status)}</TableCell>
                    <TableCell className="text-slate-400 text-sm">{unit.location_label || '-'}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-400">{unit.firmware_version}</TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {unit.warranty_expires ? format(new Date(unit.warranty_expires), 'dd/MM/yyyy') : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
