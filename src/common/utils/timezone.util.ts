import * as moment from 'moment-timezone';

// São Paulo timezone
const TIMEZONE = 'America/Sao_Paulo';

/**
 * Get current date and time in São Paulo timezone
 */
export function getCurrentDateTime(): Date {
	return moment().tz(TIMEZONE).toDate();
}

/**
 * Get current date (start of day) in São Paulo timezone
 */
export function getCurrentDate(): Date {
	return moment().tz(TIMEZONE).startOf('day').toDate();
}

/**
 * Get start of day for a given date in São Paulo timezone
 */
export function getStartOfDay(date: Date): Date {
	return moment.tz(date, TIMEZONE).startOf('day').toDate();
}

/**
 * Get end of day for a given date in São Paulo timezone
 */
export function getEndOfDay(date: Date): Date {
	return moment.tz(date, TIMEZONE).endOf('day').toDate();
}

/**
 * Format date to YYYY-MM-DD string in São Paulo timezone
 */
export function formatDateString(date: Date): string {
	return moment(date).tz(TIMEZONE).format('YYYY-MM-DD');
}

/**
 * Get start and end of minute for a given date in São Paulo timezone
 */
export function getMinuteBounds(date: Date): { start: Date; end: Date } {
	const momentDate = moment.tz(date, TIMEZONE);
	return {
		start: momentDate.startOf('minute').toDate(),
		end: momentDate.endOf('minute').toDate(),
	};
}

/**
 * Convert a date string or Date to São Paulo timezone
 */
export function toSaoPauloTime(date: string | Date): Date {
	return moment.tz(date, TIMEZONE).toDate();
}

/**
 * Check if a date is before today in São Paulo timezone
 */
export function isBeforeToday(date: Date): boolean {
	const today = getCurrentDate();
	const dateInSaoPaulo = moment.tz(date, TIMEZONE).startOf('day');
	const todayInSaoPaulo = moment.tz(today, TIMEZONE).startOf('day');
	
	return dateInSaoPaulo.isBefore(todayInSaoPaulo);
}
