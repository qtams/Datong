import { StrictMode } from "react";

import { createRoot } from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import AOS from "aos";

import "aos/dist/aos.css";

import "./index.css";

import App from "./App.jsx";

import { AuthProvider } from "./auth/AuthContext";

/* =========================================================
   AOS
========================================================= */

AOS.init({
  duration: 800,
  once: true,
  easing: "ease-out-cubic",
});

/* =========================================================
   APPLICATION
========================================================= */

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
