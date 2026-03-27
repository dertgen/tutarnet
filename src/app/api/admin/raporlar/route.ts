import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth } from "@/lib/admin/auth-guard";
import { writeAuditLog } from "@/lib/admin/audit";
import type { ReportListResponse, CreateReportBody, ReportAdminView } from "@/types/admin";
import type { ReportStatus, ReportType, ReportSeverity } from "@/types/admin";
import { $Enums } from "@prisma/client";

export async function GET(req: NextRequest): Promise<NextResponse<ReportListResponse | { error: string }>> {
  const guard = await requireAdminAuth(req, "reports", "read");
  if (!guard.ok) return guard.response as NextResponse<{ error: string }>;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "20", 10));
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const severity = searchParams.get("severity");

  const where = {
    ...(status ? { status: status as $Enums.ReportStatus } : {}),
    ...(type ? { type: type as $Enums.ReportType } : {}),
    ...(severity ? { severity: severity as $Enums.ReportSeverity } : {}),
  };

  const [reports, total, countsPending, countsReviewed, countsResolved, countsDismissed] =
    await prisma.$transaction([
      prisma.report.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          reported_by: { select: { id: true, name: true, email: true } },
          resolved_by: { select: { display_name: true } },
        },
      }),
      prisma.report.count({ where }),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.report.count({ where: { status: "REVIEWED" } }),
      prisma.report.count({ where: { status: "RESOLVED" } }),
      prisma.report.count({ where: { status: "DISMISSED" } }),
    ]);

  return NextResponse.json({
    reports: reports as unknown as ReportAdminView[],
    total,
    counts: {
      PENDING: countsPending,
      REVIEWED: countsReviewed,
      RESOLVED: countsResolved,
      DISMISSED: countsDismissed,
    },
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const guard = await requireAdminAuth(req, "reports", "write");
  if (!guard.ok) return guard.response;

  const body = (await req.json()) as CreateReportBody;
  if (!body.type || !body.reason || !body.description || !body.target_type || !body.target_id) {
    return NextResponse.json({ error: "Zorunlu alanlar eksik" }, { status: 400 });
  }

  const report = await prisma.report.create({
    data: {
      type: body.type,
      reason: body.reason,
      description: body.description,
      severity: body.severity ?? "LOW",
      reported_by_id: guard.staff.user_id,
      target_type: body.target_type,
      target_id: body.target_id,
      target_label: body.target_label,
    },
  });

  await writeAuditLog({
    staffId: guard.staff.id,
    action: "CREATE",
    resource: "Report",
    resourceId: report.id,
    newValue: { type: report.type, target_type: report.target_type, target_id: report.target_id },
    req,
  });

  return NextResponse.json(report, { status: 201 });
}
