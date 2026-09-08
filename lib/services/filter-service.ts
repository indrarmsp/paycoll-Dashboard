import type { MainRow } from '../types';

export interface FilterState {
  datel: string[];
  billCategory: string[];
  umurCustomer: string[];
  status: string[];
}

export class FilterService {
  static matchesFilters(row: MainRow, filters: FilterState): boolean {
    if (filters.datel.length > 0 && !filters.datel.includes(row.datel)) {
      return false;
    }

    if (filters.billCategory.length > 0 && !filters.billCategory.includes(row.billCategory)) {
      return false;
    }

    if (filters.umurCustomer.length > 0 && !filters.umurCustomer.includes(row.umurCustomer)) {
      return false;
    }

    if (filters.status.length > 0) {
      const status = row.paidL11 || 'UNPAID';
      if (!filters.status.includes(status)) {
        return false;
      }
    }

    return true;
  }

  static matchesSearch(row: MainRow, searchTerm: string): boolean {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return true;
    }

    const term = searchTerm.toLowerCase();
    const { _sndLower = '', _namaLower = '' } = row;

    return _sndLower.includes(term) || _namaLower.includes(term);
  }

  static filterRows(
    rows: MainRow[],
    filters: FilterState,
    searchTerm: string
  ): MainRow[] {
    return rows.filter(
      (row) => this.matchesFilters(row, filters) && this.matchesSearch(row, searchTerm)
    );
  }

  static getActiveFilterCount(filters: FilterState): number {
    return (
      filters.datel.length +
      filters.billCategory.length +
      filters.umurCustomer.length +
      filters.status.length
    );
  }

  static resetFilters(): FilterState {
    return {
      datel: [],
      billCategory: [],
      umurCustomer: [],
      status: []
    };
  }

  static toggleFilter(
    filters: FilterState,
    filterKey: keyof FilterState,
    value: string
  ): FilterState {
    const updated = { ...filters };
    const values = updated[filterKey];

    if (values.includes(value)) {
      updated[filterKey] = values.filter((v) => v !== value);
    } else {
      updated[filterKey] = [...values, value];
    }

    return updated;
  }
}
