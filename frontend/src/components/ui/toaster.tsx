"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export const Toaster = () => {
  const { toasts, dismiss } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, dismissible, variant }) => (
        <Toast
          key={id}
          variant={variant}
          onOpenChange={(open) => !open && dismiss(id)}
        >
          <div className="grid gap-1">
            {title ? <ToastTitle>{title}</ToastTitle> : null}
            {description ? (
              <ToastDescription>{description}</ToastDescription>
            ) : null}
          </div>
          {action}
          {dismissible ? <ToastClose /> : null}
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
};
