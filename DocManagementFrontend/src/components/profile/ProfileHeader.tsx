import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export function ProfileHeader() {
  const navigate = useNavigate();

  return (
    <>
      {/* Back to Dashboard Link */}
      <div className="max-w-6xl mx-auto mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="text-blue-300 hover:text-white hover:bg-blue-800/50 -ml-3"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center mb-8 sm:mb-12"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 text-center">
          Account Settings
        </h1>
        <p className="text-blue-200/80 text-center max-w-lg">
          Manage your personal information and account preferences
        </p>
      </motion.div>
    </>
  );
}
