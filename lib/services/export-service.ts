import type { MainRow } from '../types';

export interface ExportColumn {
  key: keyof MainRow | 'paidStatus';
  label: string;
  getValue: (row: MainRow) => string | number;
}

export interface ExportOptions {
  filename: string;
  sheetName: string;
  data: Record<string, string | number>[];
}

export class ExportService {
  static buildFilename(
    prefix: string,
    pageNumber?: number,
    currentPageOnly: boolean = false
  ): string {
    const now = new Date();
    const dateStr = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('');

    let filename = `${prefix}_${dateStr}`;
    if (currentPageOnly && pageNumber) {
      filename += `_page${pageNumber}`;
    }
    filename += '.xlsx';

    return filename;
  }

  static transformRowsForExport(
    rows: MainRow[],
    columns: ExportColumn[]
  ): Record<string, string | number>[] {
    return rows.map((row) => {
      const record: Record<string, string | number> = {};

      columns.forEach((column) => {
        const value = column.getValue(row);
        record[column.label] = value;
      });

      return record;
    });
  }

  static async downloadXlsx(options: ExportOptions): Promise<void> {
    const { filename, sheetName, data } = options;

    try {
      const response = await fetch('/api/export/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, sheetName, data })
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed';
      throw new Error(message);
    }
  }

  static getDefaultColumns(): ExportColumn[] {
    return [
      { key: 'snd', label: 'SND', getValue: (row) => row.snd },
      { key: 'sndGroup', label: 'SND Group', getValue: (row) => row.sndGroup },
      { key: 'nama', label: 'Name', getValue: (row) => row.nama },
      { key: 'alamat', label: 'Address', getValue: (row) => row.alamat },
      { key: 'datel', label: 'Datel', getValue: (row) => row.datel },
      { key: 'billCategory', label: 'Bill Category', getValue: (row) => row.billCategory },
      { key: 'saldo', label: 'Saldo', getValue: (row) => row.saldo },
      { key: 'umurCustomer', label: 'Customer Age', getValue: (row) => row.umurCustomer },
      { key: 'noHp', label: 'Phone Number', getValue: (row) => row.noHp },
      { key: 'email', label: 'Email', getValue: (row) => row.email },
      { key: 'paidStatus', label: 'Status', getValue: (row) => row.paidL11 || 'UNPAID' }
    ];
  }
}
