import { format, formatDistanceToNowStrict, isValid } from 'date-fns';
import { enUS } from 'date-fns/locale';

/*
const locales = {
  en: enUS,
  fr,
};

const locale = locales[currentLanguage] ?? enUS;
*/

const DEFAULT_LOCALE = enUS;

function toDate(date: string | Date): Date {
  return date instanceof Date ? date : new Date(date);
}

export function formatDate(
  date: string | Date,
  pattern = 'dd MMM yyyy',
): string {
  const parsedDate = toDate(date);

  if (!isValid(parsedDate)) {
    return '';
  }

  return format(parsedDate, pattern, {
    locale: DEFAULT_LOCALE,
  });
}

export function formatRelativeTime(date: string | Date): string {
  const parsedDate = toDate(date);

  if (!isValid(parsedDate)) {
    return '';
  }

  return formatDistanceToNowStrict(parsedDate, {
    addSuffix: true,
    locale: DEFAULT_LOCALE,
  });
}

export function truncate(value: string, maxLength: number): string {
  return value.length <= maxLength
    ? value
    : `${value.slice(0, maxLength).trimEnd()}…`;
}
