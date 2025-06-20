using DocManagementBackend.Data;
using DocManagementBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace DocManagementBackend.Utils
{
    public static class LigneCalculations
    {
        /// <summary>
        /// Calculates all amounts for a ligne including unit conversion logic
        /// </summary>
        public static async Task<LigneCalculationResult> CalculateAmountsAsync(
            ApplicationDbContext context,
            decimal quantity,
            decimal priceHT,
            decimal discountPercentage,
            decimal? discountAmount,
            decimal vatPercentage,
            string? unitCode = null,
            string? elementCode = null,
            int? lignesElementTypeId = null)
        {
            // Step 1: Apply unit conversion to get the adjusted price
            decimal adjustedPriceHT = await ApplyUnitConversionAsync(
                context, priceHT, unitCode, elementCode, lignesElementTypeId);

            // Step 2: Calculate subtotal with adjusted price
            decimal subtotal = quantity * adjustedPriceHT;

            // Step 3: Calculate discount amount
            decimal calculatedDiscountAmount;
            if (discountAmount.HasValue && discountAmount.Value > 0)
            {
                calculatedDiscountAmount = discountAmount.Value;
            }
            else
            {
                calculatedDiscountAmount = subtotal * discountPercentage;
            }

            // Step 4: Calculate final amounts
            decimal amountHT = subtotal - calculatedDiscountAmount;
            decimal amountVAT = amountHT * vatPercentage;
            decimal amountTTC = amountHT + amountVAT;

            return new LigneCalculationResult
            {
                AdjustedPriceHT = adjustedPriceHT,
                Subtotal = subtotal,
                DiscountAmount = calculatedDiscountAmount,
                AmountHT = amountHT,
                AmountVAT = amountVAT,
                AmountTTC = amountTTC,
                UnitConversionFactor = adjustedPriceHT / priceHT
            };
        }

        /// <summary>
        /// Applies unit conversion to the price for Item types
        /// </summary>
        private static async Task<decimal> ApplyUnitConversionAsync(
            ApplicationDbContext context,
            decimal priceHT,
            string? unitCode,
            string? elementCode,
            int? lignesElementTypeId)
        {
            // No conversion needed if unit or element info is missing
            if (string.IsNullOrEmpty(unitCode) || 
                string.IsNullOrEmpty(elementCode) || 
                !lignesElementTypeId.HasValue)
            {
                return priceHT;
            }

            // Get the element type with item details
            var elementType = await context.LignesElementTypes
                .Include(let => let.Item)
                .FirstOrDefaultAsync(let => let.Id == lignesElementTypeId.Value);

            // Only apply conversion for Item types
            if (elementType?.TypeElement != ElementType.Item || elementType.Item == null)
            {
                return priceHT;
            }

            // Get the item's default unit
            var defaultUnitCode = elementType.Item.Unite;
            
            // No conversion needed if using default unit
            if (string.IsNullOrEmpty(defaultUnitCode) || unitCode == defaultUnitCode)
            {
                return priceHT;
            }

            // Get the unit conversion factor
            var itemUnit = await context.ItemUnitOfMeasures
                .FirstOrDefaultAsync(ium => ium.ItemCode == elementCode && 
                                           ium.UnitOfMeasureCode == unitCode);

            if (itemUnit == null)
            {
                return priceHT; // No conversion data available
            }

            // Apply the conversion factor
            return priceHT * itemUnit.QtyPerUnitOfMeasure;
        }

        /// <summary>
        /// Calculates amounts for an existing ligne using its current properties
        /// </summary>
        public static async Task<LigneCalculationResult> CalculateAmountsForLigneAsync(
            ApplicationDbContext context,
            Ligne ligne)
        {
            return await CalculateAmountsAsync(
                context,
                ligne.Quantity,
                ligne.PriceHT,
                ligne.DiscountPercentage,
                ligne.DiscountAmount,
                ligne.VatPercentage,
                ligne.UnitCode,
                ligne.ElementId,
                ligne.LignesElementTypeId);
        }
    }

    /// <summary>
    /// Result of ligne calculation operations
    /// </summary>
    public class LigneCalculationResult
    {
        public decimal AdjustedPriceHT { get; set; }
        public decimal Subtotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal AmountHT { get; set; }
        public decimal AmountVAT { get; set; }
        public decimal AmountTTC { get; set; }
        public decimal UnitConversionFactor { get; set; }
    }
} 