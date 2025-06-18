import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface ReviewStepProps {
  data: {
    typeName: string;
    typeKey: string;
    typeAttr?: string;
  };
}

export const ReviewStep = ({ data }: ReviewStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="mb-4">
        <h3 className="text-lg font-medium text-white">Review</h3>
        <p className="text-sm text-blue-300 mt-1">
          Review your document type details before creation
        </p>
      </div>

      <div className="space-y-4">
        <ReviewItem label="Type Name" value={data.typeName} />
        <ReviewItem label="Type Code" value={data.typeKey} />
        {data.typeAttr && (
          <ReviewItem label="Description" value={data.typeAttr} />
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-blue-900/30 flex items-center">
        <Check className="h-4 w-4 text-blue-400 mr-2" />
        <p className="text-sm text-blue-300">
          Please review the information above before submitting
        </p>
      </div>
    </motion.div>
  );
};

const ReviewItem = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-[#111633] rounded-md p-4 border border-blue-900/30">
    <p className="text-sm text-blue-300 mb-1">{label}</p>
    <p className="text-base font-medium text-white">{value}</p>
  </div>
);
