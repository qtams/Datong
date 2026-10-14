import { Toaster } from "react-hot-toast";

/* =========================================================
   GLOBAL TOAST DESIGN

   Centralized here so App.jsx stays clean.

   Header height: 72px
   Toast offset: 88px
========================================================= */

function AppToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      containerStyle={{
        top: "88px",
        right: "18px",
        zIndex: 99999,
      }}
      toastOptions={{
        duration: 2800,

        style: {
          minWidth: "220px",
          maxWidth: "340px",

          background: "#111111",
          color: "#ffffff",

          border: "1px solid rgba(255,255,255,0.08)",

          borderRadius: "12px",

          padding: "11px 14px",

          fontSize: "11px",
          fontWeight: "500",
          lineHeight: "1.45",

          boxShadow: "0 14px 36px rgba(0,0,0,0.18)",
        },

        /* =================================================
           SUCCESS
        ================================================= */

        success: {
          duration: 2600,

          iconTheme: {
            primary: "#ffffff",
            secondary: "#111111",
          },

          style: {
            background: "#111111",
            color: "#ffffff",
          },
        },

        /* =================================================
           ERROR
        ================================================= */

        error: {
          duration: 3800,

          iconTheme: {
            primary: "#ffffff",
            secondary: "#991b1b",
          },

          style: {
            background: "#991b1b",
            color: "#ffffff",

            border: "1px solid rgba(255,255,255,0.10)",
          },
        },

        /* =================================================
           LOADING
        ================================================= */

        loading: {
          duration: Infinity,

          style: {
            background: "#111111",
            color: "#ffffff",
          },
        },
      }}
    />
  );
}

export default AppToaster;
