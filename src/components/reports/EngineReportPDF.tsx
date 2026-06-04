"use client";

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Registrar fuentes estándar para el PDF si es necesario (opcional para estilo técnico)
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#dc2626', // NovaStar red
    paddingBottom: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#171717',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#52525b',
    marginTop: 4,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: '#f4f4f5',
    padding: 6,
    marginBottom: 10,
    color: '#18181b',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    width: 150,
    fontSize: 10,
    color: '#52525b',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 10,
    color: '#18181b',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    marginTop: 10,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#f4f4f5',
    padding: 5,
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e4e4e7',
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#a1a1aa',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#e4e4e7',
    paddingTop: 10,
  }
});

export interface PDFReportData {
  projectName: string;
  clientName: string;
  location: string;
  technician: string;
  date: string;
  totalResolution: string;
  totalPixels: number;
  processorModel: string;
  portsRequired: number;
  bandwidthMbps: number;
  totalWatts: number;
  thermalBTU: number;
  fiberLossdB?: number;
  bom: Array<{ ref: string; item: string; qty: number; total: number }>;
}

export const EngineReportPDF = ({ data }: { data: PDFReportData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* PORTADA Y HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>REPORTE DE INGENIERÍA AV</Text>
          <Text style={styles.headerSubtitle}>Charmex Internacional · División de Gestión de Señal</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold' }}>CONFIDENCIAL</Text>
          <Text style={{ fontSize: 10, color: '#52525b', marginTop: 4 }}>Rev 1.0</Text>
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <View style={styles.row}>
          <Text style={styles.label}>PROYECTO:</Text>
          <Text style={styles.value}>{data.projectName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>CLIENTE:</Text>
          <Text style={styles.value}>{data.clientName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>UBICACIÓN:</Text>
          <Text style={styles.value}>{data.location}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>TÉCNICO / FECHA:</Text>
          <Text style={styles.value}>{data.technician} | {data.date}</Text>
        </View>
      </View>

      {/* SECCIÓN 1 — Especificaciones */}
      <View>
        <Text style={styles.sectionTitle}>1. ESPECIFICACIONES DE LA MATRIZ LED</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Resolución Total:</Text>
          <Text style={styles.value}>{data.totalResolution}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Píxeles Totales:</Text>
          <Text style={styles.value}>{data.totalPixels.toLocaleString()} px</Text>
        </View>
      </View>

      {/* SECCIÓN 2 — Análisis de Procesamiento */}
      <View style={{ marginTop: 15 }}>
        <Text style={styles.sectionTitle}>2. ANÁLISIS DE PROCESAMIENTO Y SEÑAL</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Procesador Principal:</Text>
          <Text style={styles.value}>{data.processorModel}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Puertos Requeridos:</Text>
          <Text style={styles.value}>{data.portsRequired}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Ancho de Banda (Red):</Text>
          <Text style={styles.value}>{data.bandwidthMbps.toFixed(2)} Mbps</Text>
        </View>
      </View>

      {/* SECCIÓN 4 — Infraestructura eléctrica */}
      <View style={{ marginTop: 15 }}>
        <Text style={styles.sectionTitle}>3. INFRAESTRUCTURA ELÉCTRICA Y TÉRMICA</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Potencia Total Estimada:</Text>
          <Text style={styles.value}>{data.totalWatts} W</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Disipación Térmica:</Text>
          <Text style={styles.value}>{data.thermalBTU.toFixed(2)} BTU/h</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Nota de Ingeniería:</Text>
          <Text style={{ fontSize: 10, color: '#dc2626' }}>Requiere ventilación mínima 1U entre procesadores de alta densidad.</Text>
        </View>
      </View>

      {/* SECCIÓN 6 — BOM */}
      <View style={{ marginTop: 15 }}>
        <Text style={styles.sectionTitle}>4. BILL OF MATERIALS (BOM) HARDWARE</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Referencia</Text></View>
            <View style={{...styles.tableColHeader, width: '40%'}}><Text style={styles.tableCellHeader}>Equipo</Text></View>
            <View style={{...styles.tableColHeader, width: '15%'}}><Text style={styles.tableCellHeader}>Cant.</Text></View>
            <View style={{...styles.tableColHeader, width: '20%'}}><Text style={styles.tableCellHeader}>Total (€)</Text></View>
          </View>
          {data.bom.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{item.ref}</Text></View>
              <View style={{...styles.tableCol, width: '40%'}}><Text style={styles.tableCell}>{item.item}</Text></View>
              <View style={{...styles.tableCol, width: '15%'}}><Text style={styles.tableCell}>{item.qty}</Text></View>
              <View style={{...styles.tableCol, width: '20%'}}><Text style={styles.tableCell}>{item.total}</Text></View>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
        `Documento generado automáticamente por AV/IT Copilot Dashboard - Página ${pageNumber} de ${totalPages}`
      )} fixed />
    </Page>
  </Document>
);
