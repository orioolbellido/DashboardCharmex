/**
 * AV/IT Copilot Dashboard
 * Motor de Cálculo de Señal (Domain Engine Puro)
 * TypeScript Puro sin UI dependencies
 */

// --- 2.1 Cálculo de puertos NovaStar ---
export interface PortCalculationResult {
  totalPixels: number;
  portsRequired: number;
  bandwidthMbps: number;
  pixelsPerPort: number;
  utilizationPercent: number;
  isOverloaded: boolean;
  recommendation: string;
}

export function calculateNovaStarPorts(
  width: number,
  height: number,
  refreshRate: 60 | 120 | 144,
  bitDepth: 8 | 10 | 12,
  portType: '1G' | '5G_COEX' | '10G'
): PortCalculationResult {
  const totalPixels = width * height;
  let capacityPerPort = 0;

  // Base 60Hz capacities
  if (portType === '1G') {
    if (bitDepth === 8) capacityPerPort = 655360;
    else if (bitDepth === 10) capacityPerPort = 327680;
    else if (bitDepth === 12) capacityPerPort = 218453;
  } else if (portType === '5G_COEX') {
    // 5G COEX base is 5x 1G
    capacityPerPort = 655360 * 5;
    if (bitDepth === 10) capacityPerPort = 327680 * 5;
    if (bitDepth === 12) capacityPerPort = 218453 * 5;
  } else if (portType === '10G') {
    capacityPerPort = 655360 * 10;
    if (bitDepth === 10) capacityPerPort = 327680 * 10;
    if (bitDepth === 12) capacityPerPort = 218453 * 10;
  }

  // Adjust for refresh rate
  capacityPerPort = Math.floor(capacityPerPort * (60 / refreshRate));

  const portsRequired = Math.ceil(totalPixels / capacityPerPort);
  const pixelsPerPort = portsRequired > 0 ? totalPixels / portsRequired : 0;
  const utilizationPercent = (pixelsPerPort / capacityPerPort) * 100;
  
  // Calculate Bandwidth (Mbps)
  // Pixels * bits per pixel * 3 colors * refresh rate / 1_000_000
  const bandwidthMbps = (totalPixels * bitDepth * 3 * refreshRate) / 1_000_000;

  const isOverloaded = utilizationPercent > 98;
  const recommendation = isOverloaded
    ? 'PELIGRO: Capacidad máxima del puerto excedida. Añadir procesador o reducir Hz/bit-depth.'
    : utilizationPercent > 80
    ? 'ADVERTENCIA: Alta carga por puerto. Considere distribuir la carga para mayor seguridad.'
    : 'OK: Configuración dentro de márgenes operativos.';

  return {
    totalPixels,
    portsRequired,
    bandwidthMbps,
    pixelsPerPort,
    utilizationPercent,
    isOverloaded,
    recommendation
  };
}

// --- 2.2 Cálculo de tarjetas Pixelhue ---
export interface PixelhueCardResult {
  inputCardsRequired: number;
  outputCardsRequired: number;
  totalSlots: number;
  chassisRequired: number;
  layerBudget: number;
  isQ8Compatible: boolean;
}

export function calculatePixelhueCards(
  inputs4K: number,
  outputs4K: number,
  layerCount: number,
  targetModel: 'Q8' | 'P20' | 'P10'
): PixelhueCardResult {
  let inputCardsRequired = 0;
  let outputCardsRequired = 0;
  let layerBudget = 0;
  let totalSlots = 0;
  let chassisRequired = 1;
  let isQ8Compatible = false;

  // Assuming standard 4K cards for Q8 have 4 ports per card
  if (targetModel === 'Q8') {
    inputCardsRequired = Math.ceil(inputs4K / 4);
    outputCardsRequired = Math.ceil(outputs4K / 4);
    totalSlots = inputCardsRequired + outputCardsRequired;
    layerBudget = 32; // 4K layers
    isQ8Compatible = inputCardsRequired <= 12 && outputCardsRequired <= 4 && layerCount <= layerBudget;
  } else if (targetModel === 'P20') {
    // P20 is fixed chassis: 4 inputs 4K, 4 outputs (2 main + 2 aux)
    inputCardsRequired = inputs4K > 0 ? 1 : 0; // fixed
    outputCardsRequired = outputs4K > 0 ? 1 : 0; // fixed
    layerBudget = 7;
    isQ8Compatible = false;
  } else if (targetModel === 'P10') {
    inputCardsRequired = 1;
    outputCardsRequired = 1;
    layerBudget = 3;
    isQ8Compatible = false;
  }

  return {
    inputCardsRequired,
    outputCardsRequired,
    totalSlots,
    chassisRequired,
    layerBudget,
    isQ8Compatible
  };
}

// --- 2.3 Cálculo eléctrico y térmico ---
export function calculateTotalPower(
  processors: Array<{ model: string; watts: number; quantity: number }>,
  ledCabinets: number,
  wattsPerCabinet: number
): { totalWatts: number; processorWatts: number; ledWatts: number } {
  const processorWatts = processors.reduce((acc, curr) => acc + (curr.watts * curr.quantity), 0);
  const ledWatts = ledCabinets * wattsPerCabinet;
  const totalWatts = processorWatts + ledWatts;
  
  return { totalWatts, processorWatts, ledWatts };
}

export function calculateThermalBTU(totalWatts: number): number {
  return totalWatts * 3.41214;
}

// --- 2.4 Pérdida óptica de fibra ---
export interface FiberLossResult {
  totalLossdB: number;
  cableLossdB: number;
  connectorLossdB: number;
  safetyMarginOk: boolean;
  maxRecommendedLength: number;
}

export function calculateFiberLoss(
  lengthKm: number,
  connectorCount: number,
  fiberType: 'multimode_OM3' | 'multimode_OM4' | 'singlemode_OS2'
): FiberLossResult {
  let attenuationPerKm = 0;
  let connectorLoss = 0.75; // Default LC/PC
  let maxRecommendedLength = 0;

  if (fiberType === 'multimode_OM3' || fiberType === 'multimode_OM4') {
    attenuationPerKm = 3.5;
    maxRecommendedLength = fiberType === 'multimode_OM3' ? 0.3 : 0.4;
  } else if (fiberType === 'singlemode_OS2') {
    attenuationPerKm = 0.4;
    maxRecommendedLength = 10.0;
  }

  const cableLossdB = lengthKm * attenuationPerKm;
  const connectorLossdB = connectorCount * connectorLoss;
  const totalLossdB = cableLossdB + connectorLossdB;

  // Most standard transceivers have ~10dB budget, safety margin is 3dB, so acceptable total loss is < 7dB
  const safetyMarginOk = totalLossdB <= 7;

  return {
    totalLossdB,
    cableLossdB,
    connectorLossdB,
    safetyMarginOk,
    maxRecommendedLength
  };
}

// --- 2.5 Presupuesto de proyecto ---
export function estimateProjectCost(
  bom: Array<{ model: string; quantity: number; unitPrice: number }>,
  laborDays: number,
  laborRatePerDay: number,
  travelCosts: number
): { subtotal: number; labor: number; total: number; marginSuggested: number } {
  const hardwareSubtotal = bom.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const labor = laborDays * laborRatePerDay;
  const subtotal = hardwareSubtotal + labor + travelCosts;
  
  // Suggest a standard 30% margin over costs
  const marginSuggested = subtotal * 0.3;
  const total = subtotal + marginSuggested;

  return {
    subtotal,
    labor,
    total,
    marginSuggested
  };
}
