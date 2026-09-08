import { NextResponse } from 'next/server';
import type { MainRow } from '../../../../../lib/types';
import { getMainDashboardBootstrap, MAIN_SHEET_URL } from '../../../../../lib/sheets';

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export async function GET(request: Request) {
  try {
    if (!MAIN_SHEET_URL) {
      return NextResponse.json({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false
      } as PaginatedResponse<MainRow>);
    }

    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '20', 10)));
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const sort = searchParams.get('sort') || 'default';

    const filters: Record<string, string[]> = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('filter_') && value) {
        const filterKey = key.replace('filter_', '');
        filters[filterKey] = value.split(',').filter(Boolean);
      }
    }

    const shouldRefresh = searchParams.get('refresh') === '1';

    const payload = await getMainDashboardBootstrap({ forceRefresh: shouldRefresh });
    let rows = payload.rows || [];

    if (search) {
      rows = rows.filter((row: MainRow) => {
        const sndLower = String(row.snd || '').toLowerCase();
        const namaLower = String(row.nama || '').toLowerCase();
        return sndLower.includes(search) || namaLower.includes(search);
      });
    }

    const filterSets = Object.entries(filters).reduce<Record<string, Set<string>>>((acc, [k, v]) => {
      if (v.length > 0) acc[k] = new Set(v);
      return acc;
    }, {});

    if (Object.keys(filterSets).length > 0) {
      rows = rows.filter((row: MainRow) => {
        if (filterSets.datel && !filterSets.datel.has(row.datel)) return false;
        if (filterSets.billCategory && !filterSets.billCategory.has(row.billCategory)) return false;
        if (filterSets.umurCustomer && !filterSets.umurCustomer.has(row.umurCustomer)) return false;
        if (filterSets.status && !filterSets.status.has(row.paidL11 || 'UNPAID')) return false;
        return true;
      });
    }

    if (sort === 'lowest' || sort === 'highest') {
      rows.sort((a: MainRow, b: MainRow) => {
        const aVal = a.saldo ?? 0;
        const bVal = b.saldo ?? 0;
        return sort === 'lowest' ? aVal - bVal : bVal - aVal;
      });
    }

    const total = rows.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const items = rows.slice(start, end);
    const hasMore = end < total;

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      hasMore
    } as PaginatedResponse<MainRow>);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch paginated data';
    return NextResponse.json({ message }, { status: 500 });
  }
}
