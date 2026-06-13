import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUserIdFromRequest } from "@/lib/auth";

// GET /api/analytics - Get analytics data for current user
export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Total views
    const totalViews = await db.pageView.count({
      where: { userId },
    });

    // Views last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const viewsLast30Days = await db.pageView.count({
      where: {
        userId,
        viewedAt: { gte: thirtyDaysAgo },
      },
    });

    // Total clicks
    const userLinkIds = await db.link.findMany({
      where: { userId },
      select: { id: true },
    });
    const linkIds = userLinkIds.map((l) => l.id);

    const totalClicks = await db.linkClick.count({
      where: { linkId: { in: linkIds } },
    });

    // CTR
    const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    // Daily views for last 30 days (PostgreSQL syntax)
    const dailyViews = await db.$queryRaw<
      Array<{ date: string; views: bigint }>
    >`
      SELECT DATE("viewedAt") as date, COUNT(*) as views
      FROM "PageView"
      WHERE "userId" = ${userId}
        AND "viewedAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("viewedAt")
      ORDER BY date ASC
    `;

    // Fill in missing days
    const dailyViewsMap = new Map(
      dailyViews.map((d) => [d.date, Number(d.views)]),
    );
    const filledDailyViews: { date: string; views: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      filledDailyViews.push({
        date: dateStr,
        views: dailyViewsMap.get(dateStr) || 0,
      });
    }

    // Top links by clicks
    const topLinksRaw = await db.link.findMany({
      where: { userId },
      select: {
        title: true,
        _count: { select: { linkClicks: true } },
      },
      orderBy: { linkClicks: { _count: "desc" } },
      take: 10,
    });

    const topLinks = topLinksRaw.map((l) => ({
      title: l.title,
      clicks: l._count.linkClicks,
    }));

    return NextResponse.json({
      totalViews,
      viewsLast30Days,
      totalClicks,
      ctr: Math.round(ctr * 10) / 10,
      dailyViews: filledDailyViews,
      topLinks,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
