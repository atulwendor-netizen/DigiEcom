import { describe, it, expect } from 'vitest';
import { formatINR, paiseToRupees } from '../src/utils/currency';

describe('Currency Utility (INR integer paise representations)', () => {
  it('formats round hundreds of paise without decimals by default', () => {
    expect(formatINR(79900)).toBe('₹799');
    expect(formatINR(99900)).toBe('₹999');
    expect(formatINR(149900)).toBe('₹1,499');
    expect(formatINR(29900)).toBe('₹299');
  });

  it('formats sub-rupee paise with two decimals', () => {
    expect(formatINR(79950)).toBe('₹799.50');
    expect(formatINR(50)).toBe('₹0.50');
  });

  it('handles zero and negative/invalid inputs safely', () => {
    expect(formatINR(0)).toBe('₹0');
    expect(formatINR(-500)).toBe('₹0');
    expect(formatINR(NaN)).toBe('₹0');
  });

  it('supports explicit includeDecimalsIfZero option', () => {
    expect(formatINR(79900, { includeDecimalsIfZero: true })).toBe('₹799.00');
  });

  it('converts paise to decimal rupees accurately', () => {
    expect(paiseToRupees(79900)).toBe(799);
    expect(paiseToRupees(79950)).toBe(799.5);
    expect(paiseToRupees(0)).toBe(0);
    expect(paiseToRupees(NaN)).toBe(0);
  });
});
