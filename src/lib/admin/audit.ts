import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

interface WriteAuditLogParams {
  staffId: string | null;
  action: string;
  resource: string;
  resourceId: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  req?: NextRequest;
  metadata?: Record<string, unknown>;
}

export async function writeAuditLog(params: WriteAuditLogParams): Promise<void> {
  try {
    const ipAddress = params.req
      ? (params.req.headers.get("x-forwarded-for") ?? params.req.headers.get("x-real-ip") ?? null)
      : null;

    const userAgent = params.req
      ? (params.req.headers.get("user-agent") ?? null)
      : null;

    await prisma.auditLog.create({
      data: {
        staff_id: params.staffId,
        action: params.action,
        resource: params.resource,
        resource_id: params.resourceId,
        old_value: (params.oldValue ?? undefined) as Prisma.InputJsonValue | undefined,
        new_value: (params.newValue ?? undefined) as Prisma.InputJsonValue | undefined,
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: (params.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (err) {
    console.error("[AuditLog] Kayıt yazılamadı:", err);
  }
}
