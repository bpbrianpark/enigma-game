import { NextResponse } from "next/server";
import { selectDailyCategory } from "../../../../lib/daily-category";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const slug = await selectDailyCategory();
    return NextResponse.json({ 
      success: true, 
      slug,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error("Error selecting daily category:", error);
    return NextResponse.json(
      { error: "Failed to select daily category", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
