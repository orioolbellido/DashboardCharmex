import { 
  calculateNovaStarPorts, 
  calculatePixelhueCards, 
  calculateTotalPower, 
  calculateThermalBTU, 
  calculateFiberLoss, 
  estimateProjectCost 
} from '../src/lib/engine/calculators';

describe('Calculators Engine', () => {
  describe('calculateNovaStarPorts', () => {
    it('should calculate ports for 4K 60Hz 8-bit on 1G', () => {
      // 4K is 3840 x 2160 = 8294400 pixels
      // 1G 8-bit 60Hz capacity is 655360
      // 8294400 / 655360 = 12.6 -> 13 ports
      const result = calculateNovaStarPorts(3840, 2160, 60, 8, '1G');
      expect(result.totalPixels).toBe(8294400);
      expect(result.portsRequired).toBe(13);
      expect(result.bandwidthMbps).toBeCloseTo(11943.936, 1);
    });

    it('should calculate ports for 10G', () => {
      const result = calculateNovaStarPorts(3840, 2160, 60, 8, '10G');
      expect(result.portsRequired).toBe(2); // 8.2M / 6.5M -> 2 ports
    });
  });

  describe('calculatePixelhueCards', () => {
    it('should calculate Q8 cards properly', () => {
      const result = calculatePixelhueCards(10, 2, 10, 'Q8');
      expect(result.inputCardsRequired).toBe(3); // 10 inputs / 4 per card -> 3
      expect(result.outputCardsRequired).toBe(1); // 2 outputs / 4 per card -> 1
      expect(result.isQ8Compatible).toBe(true);
    });
  });

  describe('Power and Thermal', () => {
    it('should calculate total power', () => {
      const processors = [{ model: 'MX40 Pro', watts: 100, quantity: 2 }];
      const result = calculateTotalPower(processors, 10, 150); // 10 cabinets * 150W
      expect(result.totalWatts).toBe(200 + 1500);
      expect(result.processorWatts).toBe(200);
      expect(result.ledWatts).toBe(1500);
    });

    it('should calculate thermal BTU', () => {
      const btu = calculateThermalBTU(1000);
      expect(btu).toBe(3412.14);
    });
  });

  describe('calculateFiberLoss', () => {
    it('should calculate loss for singlemode', () => {
      const result = calculateFiberLoss(2.0, 4, 'singlemode_OS2');
      // 2km * 0.4 = 0.8dB
      // 4 * 0.75 = 3.0dB
      // Total = 3.8dB
      expect(result.totalLossdB).toBe(3.8);
      expect(result.safetyMarginOk).toBe(true);
    });
  });

  describe('estimateProjectCost', () => {
    it('should estimate cost with 30% margin', () => {
      const bom = [{ model: 'Processor', quantity: 2, unitPrice: 5000 }]; // 10000
      const result = estimateProjectCost(bom, 3, 500, 1000); // labor = 1500, travel = 1000. Subtotal = 12500
      expect(result.subtotal).toBe(12500);
      expect(result.marginSuggested).toBe(12500 * 0.3); // 3750
      expect(result.total).toBe(16250);
    });
  });
});
