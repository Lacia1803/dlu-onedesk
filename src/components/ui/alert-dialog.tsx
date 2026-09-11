"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function AlertDialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  );
}

function AlertDialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <DialogContent showCloseButton={false} className={className}>
      {children}
    </DialogContent>
  );
}

function AlertDialogHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <DialogHeader className={className}>{children}</DialogHeader>;
}

function AlertDialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <DialogTitle className={className}>{children}</DialogTitle>;
}

function AlertDialogDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <DialogDescription className={className}>{children}</DialogDescription>;
}

function AlertDialogFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <DialogFooter className={className}>{children}</DialogFooter>;
}

function AlertDialogAction({
  onClick,
  children,
  className,
  variant = "default",
  disabled,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  disabled?: boolean;
}) {
  return (
    <Button variant={variant} onClick={onClick} className={className} disabled={disabled}>
      {children}
    </Button>
  );
}

function AlertDialogCancel({
  onClick,
  children,
  className,
  disabled,
}: {
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Button variant="outline" onClick={onClick} className={className} disabled={disabled}>
      {children || "Hủy bỏ"}
    </Button>
  );
}

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
};
