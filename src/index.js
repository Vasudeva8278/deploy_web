import React from 'react';
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from 'react-query';
import './index.css';
import App from './App';
import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient();

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
);
