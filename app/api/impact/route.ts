import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-static';

export async function GET() {
  // Mock data for static export
  const metrics = [
    { label: "Students Trained", value: 500 },
    { label: "Projects Completed", value: 120 },
    { label: "Awards Won", value: 15 },
    { label: "Partners", value: 10 },
  ];

  return NextResponse.json({
    metrics,
  });
}
