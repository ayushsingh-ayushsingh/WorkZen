// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./components/ui/theme-provider.tsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { store } from "@/store/store.ts";
import { Provider } from "react-redux";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <Provider store={store}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  </Provider>
  // </StrictMode>
);
