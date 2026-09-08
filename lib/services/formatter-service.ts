const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0
});

const idNumberFormatter = new Intl.NumberFormat('id-ID');

const idDateFormatter = new Intl.DateTimeFormat('id-ID', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

export class FormatterService {
  static formatCurrency(amount: number): string {
    return idrFormatter.format(amount);
  }

  static formatNumber(num: number): string {
    return idNumberFormatter.format(num);
  }

  static formatAbbreviatedNumber(num: number): string {
    if (num === 0) return '0K';
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(1)}B`;
    }
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`;
    }
    return String(num);
  }

  static normalize(text: string): string {
    return String(text ?? '').trim().toLowerCase();
  }

  static capitalize(text: string): string {
    const normalized = this.normalize(text);
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  static formatDate(date: Date | number | string): string {
    return idDateFormatter.format(new Date(date));
  }

  static truncate(text: string, maxLength: number = 50): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  static formatStatus(status: string): string {
    if (status === 'PAID') return 'Lunas';
    if (status === 'UNPAID') return 'Belum Lunas';
    return this.capitalize(status);
  }
}
