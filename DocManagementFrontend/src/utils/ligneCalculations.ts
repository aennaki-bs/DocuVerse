import { Item, ItemUnitOfMeasure } from '@/models/lineElements';

/**
 * Result of ligne calculation operations
 */
export interface LigneCalculationResult {
  adjustedPriceHT: number;
  subtotal: number;
  discountAmount: number;
  amountHT: number;
  amountVAT: number;
  amountTTC: number;
  unitConversionFactor: number;
}

/**
 * Calculates all amounts for a ligne including unit conversion logic
 */
export function calculateLigneAmounts(
  quantity: number,
  priceHT: number,
  discountPercentage: number,
  discountAmount: number | undefined,
  vatPercentage: number,
  useFixedDiscount: boolean,
  unitCode?: string,
  selectedItemDetails?: Item,
  itemUnits?: ItemUnitOfMeasure[]
): LigneCalculationResult {
  // Step 1: Apply unit conversion to get the adjusted price
  const unitConversionFactor = getUnitConversionFactor(
    unitCode,
    selectedItemDetails,
    itemUnits
  );
  
  const adjustedPriceHT = priceHT * unitConversionFactor;
  
  // Step 2: Calculate subtotal with adjusted price
  const subtotal = quantity * adjustedPriceHT;
  
  // Step 3: Calculate discount amount
  let calculatedDiscountAmount: number;
  if (useFixedDiscount && discountAmount) {
    calculatedDiscountAmount = discountAmount;
  } else {
    calculatedDiscountAmount = subtotal * discountPercentage;
  }
  
  // Step 4: Calculate final amounts
  const amountHT = subtotal - calculatedDiscountAmount;
  const amountVAT = amountHT * vatPercentage;
  const amountTTC = amountHT + amountVAT;
  
  return {
    adjustedPriceHT,
    subtotal,
    discountAmount: calculatedDiscountAmount,
    amountHT,
    amountVAT,
    amountTTC,
    unitConversionFactor,
  };
}

/**
 * Gets the unit conversion factor for Item types
 */
export function getUnitConversionFactor(
  unitCode?: string,
  selectedItemDetails?: Item,
  itemUnits?: ItemUnitOfMeasure[]
): number {
  // No conversion needed if unit or item info is missing
  if (!unitCode || !selectedItemDetails || !itemUnits) {
    return 1;
  }
  
  // Find the selected unit in the available units
  const selectedUnit = itemUnits.find(unit => unit.unitOfMeasureCode === unitCode);
  if (!selectedUnit) {
    return 1; // No conversion data available
  }
  
  // Check if using default unit (no conversion needed)
  const isDefaultUnit = selectedItemDetails.unite === unitCode;
  if (isDefaultUnit) {
    return 1;
  }
  
  // Apply the conversion factor
  return selectedUnit.qtyPerUnitOfMeasure;
}

/**
 * Gets the default unit from item units based on the item's default unit
 */
export function getDefaultUnit(
  selectedItemDetails?: Item,
  itemUnits?: ItemUnitOfMeasure[]
): ItemUnitOfMeasure | undefined {
  if (!selectedItemDetails || !itemUnits || itemUnits.length === 0) {
    return undefined;
  }
  
  // Find the unit that matches the item's default unit
  const defaultUnit = itemUnits.find(unit => unit.unitOfMeasureCode === selectedItemDetails.unite);
  
  // If no default unit found, return the first unit as fallback
  return defaultUnit || itemUnits[0];
}

/**
 * Formats a price with currency
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Formats a percentage
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
} 