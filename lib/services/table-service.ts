import type { MainRow } from '../types';

export type SortOrder = 'DEFAULT' | 'LOWEST' | 'HIGHEST';

export interface TableState {
  page: number;
  limit: number;
  sortOrder: SortOrder;
  total: number;
}

export class TableService {
  static getTotalPages(total: number, limit: number): number {
    return Math.ceil(total / limit);
  }

  static hasNextPage(page: number, total: number, limit: number): boolean {
    return page < this.getTotalPages(total, limit);
  }

  static hasPreviousPage(page: number): boolean {
    return page > 1;
  }

  static getPageRange(page: number, limit: number): { start: number; end: number } {
    const start = (page - 1) * limit;
    const end = start + limit;
    return { start, end };
  }

  static sortBySaldo(rows: MainRow[], order: SortOrder): MainRow[] {
    if (order === 'DEFAULT') {
      return [...rows];
    }

    const sorted = [...rows].sort((a, b) => {
      const aVal = a.saldo ?? 0;
      const bVal = b.saldo ?? 0;
      return order === 'LOWEST' ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  }

  static paginate<T>(items: T[], page: number, limit: number): T[] {
    const { start, end } = this.getPageRange(page, limit);
    return items.slice(start, end);
  }

  static validatePage(page: number, maxPage: number): number {
    if (page < 1) return 1;
    if (page > maxPage && maxPage > 0) return maxPage;
    return page;
  }

  static validateLimit(limit: number): number {
    const MIN_LIMIT = 10;
    const MAX_LIMIT = 100;

    if (limit < MIN_LIMIT) return MIN_LIMIT;
    if (limit > MAX_LIMIT) return MAX_LIMIT;
    return limit;
  }
}
