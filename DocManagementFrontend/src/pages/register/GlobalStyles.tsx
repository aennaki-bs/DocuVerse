import React, { useEffect } from "react";

const GlobalStyles: React.FC = () => {
  useEffect(() => {
    // Create style element
    const style = document.createElement("style");
    style.textContent = `
      body {
        background: linear-gradient(to bottom, #0a1033, #040714);
        color: #e2e8f0;
        min-height: 100vh;
      }
      
      /* Custom scrollbar styling */
      ::-webkit-scrollbar {
        width: 6px;
      }
      
      ::-webkit-scrollbar-track {
        background: rgba(15, 23, 42, 0.3);
        border-radius: 10px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: rgba(59, 130, 246, 0.4);
        border-radius: 10px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(59, 130, 246, 0.6);
      }
      
      /* Custom animations */
      @keyframes pulse-blue {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
        }
        50% {
          box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
        }
      }
      
      .pulse-animation {
        animation: pulse-blue 2s infinite;
      }
      
      /* Input field focus styles */
      input:focus, select:focus, textarea:focus {
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        border-color: rgba(59, 130, 246, 0.5) !important;
      }
    `;

    document.head.appendChild(style);

    // Set document background as well
    document.body.style.background =
      "linear-gradient(to bottom, #0a1033, #040714)";
    document.body.style.color = "#e2e8f0";

    // Cleanup function to remove the style when component unmounts
    return () => {
      document.head.removeChild(style);
      document.body.style.background = "";
      document.body.style.color = "";
    };
  }, []);

  return null;
};

export default GlobalStyles;
