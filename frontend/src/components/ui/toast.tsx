"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport> & {
  ref?: React.RefObject<React.ElementRef<
    typeof ToastPrimitives.Viewport
  > | null>;
}) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-4 left-4 flex w-full max-w-sm flex-col gap-2 z-[100] outline-none",
      className,
    )}
    {...props}
  />
);
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group relative grid w-full max-w-sm items-center gap-2 overflow-hidden rounded-md border border-border bg-background p-4 pr-6 shadow-lg transition-all data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:duration-200 data-[swipe=end]:animate-out data-[swipe=end]:fade-out-80 data-[swipe=end]:slide-out-to-right-full data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "",
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-[0_14px_28px_rgba(16,185,129,0.18)]",
        info: "border-sky-200 bg-sky-50 text-sky-700 shadow-[0_14px_28px_rgba(56,189,248,0.18)]",
        warning:
          "border-amber-200 bg-amber-50 text-amber-800 shadow-[0_14px_28px_rgba(251,191,36,0.18)]",
        destructive:
          "border-destructive/50 bg-rose-50 text-destructive shadow-[0_14px_28px_rgba(248,113,113,0.18)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type ToastVariant = NonNullable<
  VariantProps<typeof toastVariants>["variant"]
>;

const Toast = ({
  ref,
  className,
  variant,
  ...props
}: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
  VariantProps<typeof toastVariants> & {
    ref?: React.RefObject<React.ElementRef<typeof ToastPrimitives.Root> | null>;
  }) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
};
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action> & {
  ref?: React.RefObject<React.ElementRef<typeof ToastPrimitives.Action> | null>;
}) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-input bg-transparent px-3 text-sm font-medium transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
);
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close> & {
  ref?: React.RefObject<React.ElementRef<typeof ToastPrimitives.Close> | null>;
}) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-sm text-muted-foreground/80 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
);
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title> & {
  ref?: React.RefObject<React.ElementRef<typeof ToastPrimitives.Title> | null>;
}) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
);
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description> & {
  ref?: React.RefObject<React.ElementRef<
    typeof ToastPrimitives.Description
  > | null>;
}) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
);
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  toastVariants,
};
