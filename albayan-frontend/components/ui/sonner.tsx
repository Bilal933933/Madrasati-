"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      dir="rtl"
      position="top-left"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "text-base",
        },
      }}
      {...props}
    />
  );
}
