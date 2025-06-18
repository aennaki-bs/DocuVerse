import React from "react";
import { useMultiStepForm } from "@/context/form";
import { motion } from "framer-motion";
import { User, Building2, ArrowRight, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

const UserTypeSelectionStep = () => {
  const { setFormData, nextStep } = useMultiStepForm();

  const handleSelectUserType = (type: "personal" | "company") => {
    setFormData({ userType: type });
    nextStep();
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
      <div className="flex-1">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Choose Account Type
          </h1>
          <p className="text-gray-300">
            Select the type of account you want to create
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group cursor-pointer"
            onClick={() => handleSelectUserType("personal")}
          >
            <div className="h-full bg-[#0d1528]/80 backdrop-blur-sm border border-blue-900/30 hover:border-blue-500/50 rounded-xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
              <div className="w-20 h-20 bg-blue-900/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600/20 transition-colors">
                <User className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Personal Account
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                For individual users who want to manage their personal documents
              </p>
              <div className="mt-auto flex items-center text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                <span>Select</span>
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group cursor-pointer"
            onClick={() => handleSelectUserType("company")}
          >
            <div className="h-full bg-[#0d1528]/80 backdrop-blur-sm border border-blue-900/30 hover:border-blue-500/50 rounded-xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
              <div className="w-20 h-20 bg-blue-900/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600/20 transition-colors">
                <Building2 className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Company Account
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                For businesses that need to manage company documents and
                collaborate
              </p>
              <div className="mt-auto flex items-center text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                <span>Select</span>
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-8">
          <button
            onClick={() => nextStep()}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center justify-center transition-all duration-200 shadow-lg shadow-blue-500/20"
          >
            <span>Continue</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Sign in link at bottom */}
      <div className="flex items-center justify-center mt-8">
        <span className="text-sm text-gray-400 mr-2">
          Already have an account?
        </span>
        <Link
          to="/login"
          className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors"
        >
          <LogIn className="h-4 w-4" />
          <span className="font-medium">Sign in</span>
        </Link>
      </div>
    </div>
  );
};

export default UserTypeSelectionStep;
