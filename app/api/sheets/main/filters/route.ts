import { NextResponse } from 'next/server';
import type { FilterOptions } from '../../../../../lib/types';
import { getMainDashboardBootstrap, MAIN_SHEET_URL } from '../../../../../lib/sheets';

export async function GET(request: Request) {
  try {
    if (!MAIN_SHEET_URL) {
      return NextResponse.json({
        datel: [],
        billCategory: [],
        umurCustomer: []
      } as FilterOptions);
    }

    const { searchParams } = new URL(request.url);
    const shouldRefresh = searchParams.get('refresh') === '1';

    const payload = await getMainDashboardBootstrap({ forceRefresh: shouldRefresh });
    return NextResponse.json(payload.filterOptions);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch filter options';
    return NextResponse.json({ message }, { status: 500 });
  }
}
