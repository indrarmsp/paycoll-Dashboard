import { NextResponse } from 'next/server';
import type { DashboardStats } from '../../../../../lib/types';
import { getMainDashboardBootstrap, MAIN_SHEET_URL } from '../../../../../lib/sheets';

export async function GET(request: Request) {
  try {
    if (!MAIN_SHEET_URL) {
      return NextResponse.json({
        categoryStats: {},
        paidCount: 0,
        unpaidCount: 0
      } as DashboardStats);
    }

    const { searchParams } = new URL(request.url);
    const shouldRefresh = searchParams.get('refresh') === '1';

    const payload = await getMainDashboardBootstrap({ forceRefresh: shouldRefresh });
    return NextResponse.json(payload.stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch statistics';
    return NextResponse.json({ message }, { status: 500 });
  }
}
