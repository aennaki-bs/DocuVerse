import React from "react";
import ReactDOM, { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import "./styles/document-flow.css";

// Using more explicit DOM element finding and error handling
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "Root element not found. Make sure there is a div with id 'root' in the HTML."
  );
}

createRoot(rootElement).render(<App />);
