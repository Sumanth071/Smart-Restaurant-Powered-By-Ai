import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ConfirmDialogProvider } from "./context/ConfirmDialogContext";
import { QueryClientProvider } from "./context/QueryClientContext";
import { ToastProvider } from "./context/ToastContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <ConfirmDialogProvider>
          <QueryClientProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </QueryClientProvider>
        </ConfirmDialogProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
