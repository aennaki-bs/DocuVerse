import { Minus, Calculator, Percent } from "lucide-react";
import { Ligne } from "@/models/document";
import { motion } from "framer-motion";

interface LigneSummaryFooterProps {
  lignes: Ligne[];
}

// Format price with MAD currency
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

const LigneSummaryFooter = ({ lignes }: LigneSummaryFooterProps) => {
  // Calculate totals using new fields
  const totalAmountHT = lignes.reduce((sum, ligne) => sum + ligne.amountHT, 0);
  const totalAmountVAT = lignes.reduce((sum, ligne) => sum + ligne.amountVAT, 0);
  const totalAmountTTC = lignes.reduce((sum, ligne) => sum + ligne.amountTTC, 0);
  
  // Calculate total discount
  const totalDiscount = lignes.reduce((sum, ligne) => {
    // If discount amount is specified, use it; otherwise calculate from percentage
    if (ligne.discountAmount && ligne.discountAmount > 0) {
      return sum + ligne.discountAmount;
    } else if (ligne.discountPercentage && ligne.discountPercentage > 0) {
      return sum + (ligne.priceHT * ligne.quantity * ligne.discountPercentage);
    }
    return sum;
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6 space-y-4"
    >
      {/* Main totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Discount - First */}
        <div className="bg-gradient-to-br from-red-900/30 to-rose-900/30 rounded-lg border border-red-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-300/60 text-sm font-medium mb-1">
                Total Discount
              </p>
              <p className="text-2xl font-bold text-white">
                {formatPrice(totalDiscount)}
              </p>
            </div>
            <div className="bg-red-500/10 p-2 rounded-lg">
              <Minus className="h-6 w-6 text-red-400" />
            </div>
          </div>
        </div>

        {/* Total HT - Second */}
        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-lg border border-green-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300/60 text-sm font-medium mb-1">
                Total HT
              </p>
              <p className="text-2xl font-bold text-white">
                {formatPrice(totalAmountHT)}
              </p>
            </div>
            <div className="bg-green-500/10 p-2 rounded-lg">
              <Calculator className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        {/* Total VAT - Third */}
        <div className="bg-gradient-to-br from-purple-900/30 to-violet-900/30 rounded-lg border border-purple-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300/60 text-sm font-medium mb-1">
                Total VAT
              </p>
              <p className="text-2xl font-bold text-white">
                {formatPrice(totalAmountVAT)}
              </p>
            </div>
            <div className="bg-purple-500/10 p-2 rounded-lg">
              <Percent className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Total TTC - Fourth */}
        <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-lg border border-blue-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300/60 text-sm font-medium mb-1">
                Total TTC
              </p>
              <p className="text-2xl font-bold text-white">
                {formatPrice(totalAmountTTC)}
              </p>
            </div>
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <div className="h-6 w-6 flex items-center justify-center text-blue-400 font-bold text-xs">
                TTC
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LigneSummaryFooter;
