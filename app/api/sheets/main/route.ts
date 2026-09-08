import { NextResponse } from 'next/server';
import {
  fetchGoogleSheetData,
  getMainDashboardBootstrap,
  MAIN_SHEET_URL,
  parseMainRows
} from '../../../../lib/sheets';

export async function GET(request: Request) {
  try {
    if (!MAIN_SHEET_URL) {
      return NextResponse.json(parseMainRows({}));
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const shouldRefresh = searchParams.get('refresh') === '1';

    const parsedLimit = Number(limit);
    if (limit && Number.isFinite(parsedLimit) && parsedLimit > 0) {
      const data = await fetchGoogleSheetData(MAIN_SHEET_URL, {
        query: `select * limit ${parsedLimit}`,
        forceRefresh: shouldRefresh
      });
      return NextResponse.json(parseMainRows(data.table || {}));
    }

    const payload = await getMainDashboardBootstrap({ forceRefresh: shouldRefresh });
    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
    return NextResponse.json({ message }, { status: 500 });
  }
}