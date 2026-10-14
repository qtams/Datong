import Swal from "sweetalert2";

/* =========================================================
   BASE SWEETALERT CONFIGURATION
========================================================= */

const baseConfig = {
  width: 390,

  background: "#ffffff",
  color: "#111827",

  buttonsStyling: false,

  reverseButtons: true,

  focusCancel: true,

  allowOutsideClick: false,

  showClass: {
    popup: `
      animate-none
    `,
  },

  hideClass: {
    popup: `
      animate-none
    `,
  },

  customClass: {
    popup: `
      rounded-2xl
      border
      border-gray-200
      shadow-[0_24px_70px_rgba(0,0,0,0.18)]
    `,

    icon: `
      mt-6
      mb-1
    `,

    title: `
      px-6
      pt-2
      text-[16px]
      font-semibold
      tracking-[-0.02em]
      text-gray-950
    `,

    htmlContainer: `
      px-6
      text-[11px]
      leading-5
      text-gray-500
    `,

    actions: `
      w-full
      gap-2
      border-t
      border-gray-100
      px-6
      py-4
    `,

    confirmButton: `
      h-9
      rounded-lg
      bg-black
      px-4
      text-[11px]
      font-medium
      text-white
      transition-colors
      hover:bg-gray-800
      focus:outline-none
    `,

    cancelButton: `
      h-9
      rounded-lg
      border
      border-gray-200
      bg-white
      px-4
      text-[11px]
      font-medium
      text-gray-600
      transition-colors
      hover:border-gray-300
      hover:bg-gray-50
      hover:text-gray-900
      focus:outline-none
    `,
  },
};

/* =========================================================
   GENERIC CONFIRMATION

   Example:

   const confirmed = await confirmAction({
     title: "Update user?",
     text: "Save these changes?",
     confirmText: "Save changes",
   });
========================================================= */

export async function confirmAction({
  title = "Are you sure?",
  text = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
}) {
  const result = await Swal.fire({
    ...baseConfig,

    icon: "question",
    iconColor: "#111111",

    title,
    text,

    showCancelButton: true,

    confirmButtonText: confirmText,

    cancelButtonText: cancelText,
  });

  return result.isConfirmed;
}

/* =========================================================
   DELETE CONFIRMATION

   Example:

   const confirmed = await confirmDelete({
     title: "Delete user?",
     text: "This action cannot be undone.",
   });
========================================================= */

export async function confirmDelete({
  title = "Delete item?",
  text = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
}) {
  const result = await Swal.fire({
    ...baseConfig,

    icon: "warning",
    iconColor: "#111111",

    title,
    text,

    showCancelButton: true,

    confirmButtonText: confirmText,

    cancelButtonText: cancelText,

    customClass: {
      ...baseConfig.customClass,

      confirmButton: `
          h-9
          rounded-lg
          bg-black
          px-4
          text-[11px]
          font-medium
          text-white
          transition-colors
          hover:bg-gray-800
          focus:outline-none
        `,
    },
  });

  return result.isConfirmed;
}

/* =========================================================
   INFORMATION ALERT
========================================================= */

export async function showAlert({ title, text = "", confirmText = "Okay" }) {
  return Swal.fire({
    ...baseConfig,

    icon: "info",
    iconColor: "#111111",

    title,
    text,

    confirmButtonText: confirmText,

    customClass: {
      ...baseConfig.customClass,

      actions: `
        w-full
        justify-end
        border-t
        border-gray-100
        px-6
        py-4
      `,
    },
  });
}
