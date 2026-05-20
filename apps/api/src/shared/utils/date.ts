import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { startOfWeek, endOfWeek, addDays, parseISO } from 'date-fns';

/**
 * Devuelve el lunes de la semana que contiene `date` en la timezone dada.
 */
export function getWeekStart(date: Date, timezone: string): Date {
  const zoned = toZonedTime(date, timezone);
  const monday = startOfWeek(zoned, { weekStartsOn: 1 });
  return monday;
}

/**
 * Devuelve el domingo de la semana que contiene `date` en la timezone dada.
 */
export function getWeekEnd(date: Date, timezone: string): Date {
  const zoned = toZonedTime(date, timezone);
  const sunday = endOfWeek(zoned, { weekStartsOn: 1 });
  return sunday;
}

/**
 * Convierte un string ISO de fecha (YYYY-MM-DD) a Date UTC medianoche.
 */
export function parseDateString(dateStr: string): Date {
  return parseISO(dateStr);
}

/**
 * Formatea un Date como 'YYYY-MM-DD' en la timezone dada.
 */
export function formatDate(date: Date, timezone: string): string {
  return formatInTimeZone(date, timezone, 'yyyy-MM-dd');
}

/**
 * Devuelve la fecha de "hoy" en la timezone del usuario.
 */
export function todayInTimezone(timezone: string): Date {
  return toZonedTime(new Date(), timezone);
}

/**
 * Agrega N días a una fecha.
 */
export function addDaysToDate(date: Date, days: number): Date {
  return addDays(date, days);
}

/**
 * Calcula la diferencia en segundos entre dos fechas.
 */
export function diffInSeconds(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / 1000);
}
