import type { MainRow, ARRow, FilterOptions, DashboardStats } from '../types';
import { CacheService } from './cache-service';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface DataFetchOptions {
  page?: number;
  limit?: number;
  search?: string;
  filters?: Record<string, string[]>;
  sort?: string;
  forceRefresh?: boolean;
}

const CACHE_KEYS = {
  MAIN_DASHBOARD: 'pcMainDashboard',
  AR_DASHBOARD: 'pcARDashboard',
  FILTER_OPTIONS: 'pcFilterOptions'
} as const;

export class DataService {
  static async fetchMainDashboard(
    options: DataFetchOptions = {}
  ): Promise<PaginatedResponse<MainRow>> {
    const { page = 1, limit = 20, search, filters, sort, forceRefresh } = options;

    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);
    if (filters) {
      Object.entries(filters).forEach(([key, values]) => {
        if (Array.isArray(values) && values.length > 0) {
          params.append(`filter_${key}`, values.join(','));
        }
      });
    }

    try {
      const response = await fetch(`/api/sheets/main/paginated?${params.toString()}`, {
        cache: forceRefresh ? 'no-store' : 'default'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return (await response.json()) as PaginatedResponse<MainRow>;
    } catch (error) {
      console.error('Failed to fetch main dashboard:', error);
      return {
        items: [],
        total: 0,
        page,
        limit,
        hasMore: false
      };
    }
  }

  static async fetchFilterOptions(forceRefresh: boolean = false): Promise<FilterOptions> {
    const cacheKey = CACHE_KEYS.FILTER_OPTIONS;

    if (!forceRefresh) {
      const cached = CacheService.read<FilterOptions>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await fetch('/api/sheets/main/filters', {
        cache: forceRefresh ? 'no-store' : 'default'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as FilterOptions;
      CacheService.write(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
      return { datel: [], billCategory: [], umurCustomer: [] };
    }
  }

  static async fetchDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch('/api/sheets/main/stats');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return (await response.json()) as DashboardStats;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      return {
        categoryStats: {},
        paidCount: 0,
        unpaidCount: 0
      };
    }
  }

  static async fetchARDashboard(
    options: DataFetchOptions = {}
  ): Promise<PaginatedResponse<ARRow>> {
    const { page = 1, limit = 20, search, filters, forceRefresh } = options;

    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    if (search) params.append('search', search);
    if (filters) {
      Object.entries(filters).forEach(([key, values]) => {
        if (Array.isArray(values) && values.length > 0) {
          params.append(`filter_${key}`, values.join(','));
        }
      });
    }

    try {
      const response = await fetch(`/api/sheets/ar/paginated?${params.toString()}`, {
        cache: forceRefresh ? 'no-store' : 'default'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return (await response.json()) as PaginatedResponse<ARRow>;
    } catch (error) {
      console.error('Failed to fetch AR dashboard:', error);
      return {
        items: [],
        total: 0,
        page,
        limit,
        hasMore: false
      };
    }
  }
}
