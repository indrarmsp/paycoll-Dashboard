export function getSheetIdFromUrl(url: string | undefined): string {
  if (!url) {
    return '';
  }

  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match?.[1] || '';
}

export function resolveSpreadsheetId(
  primaryValue: string | undefined,
  fallbackUrl?: string
): string {
  const trimmed = primaryValue?.trim() || '';
  if (trimmed) {
    return getSheetIdFromUrl(trimmed) || trimmed;
  }

  return getSheetIdFromUrl(fallbackUrl);
}
