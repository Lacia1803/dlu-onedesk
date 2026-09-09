"use client";

import { useSession } from "next-auth/react";
import { Role, hasRole } from "@/lib/permissions";
import React from "react";

interface PermissionWrapperProps {
  roles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionWrapper({ roles, children, fallback = null }: PermissionWrapperProps) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  if (!hasRole(userRole, ...roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
