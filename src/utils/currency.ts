/**
 * Currency Utility for Safe INR Representations
 *
 * All monetary amounts in DigiEcom are stored as integer paise (1 INR = 100 paise)
 * to eliminate binary floating point representation inaccuracies.
 */

/**
 * Converts integer paise to a formatted Indian Rupee (INR) string.
 * Examples:
 *   formatINR(79900) -> "₹799"
 *   formatINR(79950) -> "₹799.50"
 *   formatINR(149900) -> "₹1,499"
 *   formatINR(0) -> "₹0"
 */
export function formatINR(amountInPaise: number, options: { includeDecimalsIfZero?: boolean } = {}): string {
  if (typeof amountInPaise !== 'number' || isNaN(amountInPaise) || amountInPaise < 0) {
    return '₹0';
  }

  const rupees = amountInPaise / 100;
  const hasSubRupee = amountInPaise % 100 !== 0;
  const showDecimals = hasSubRupee || options.includeDecimalsIfZero;

  const formattedNumber = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rupees);

  return `₹${formattedNumber}`;
}

/**
 * Converts integer paise to a raw decimal rupee number.
 */
export function paiseToRupees(amountInPaise: number): number {
  if (typeof amountInPaise !== 'number' || isNaN(amountInPaise)) {
    return 0;
  }
  return amountInPaise / 100;
}
