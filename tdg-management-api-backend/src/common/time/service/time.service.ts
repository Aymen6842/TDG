import { Injectable } from '@nestjs/common';
import * as moment from 'moment-timezone';

@Injectable()
export class TimeService {
  static getCurrentTime() {
    return moment.utc().format();
  }

  // End time must be 16:15 UTC, the same day as the start time
  static getEndTimeOfShiftFromStartTime(startTime: Date | string) {
    const start = moment.utc(startTime);
    const isSaturday = start.day() === 6; // 0 = Sunday, 6 = Saturday

    return start
      .clone()
      .set({
        hour: isSaturday ? 12 : 16,
        minute: isSaturday ? 30 : 15,
        second: 0,
        millisecond: 0,
      })
      .utc()
      .format();
  }

  static getDefaultEndTimeOfShift() {
    return moment
      .utc()
      .startOf('day')
      .add(1, 'day') // next day
      .add(59, 'minutes')
      .add(59, 'seconds')
      .add(999, 'milliseconds') // 00:59:59.999
      .toDate();
  }

  static getStartOfBusinessDayUTC() {
    return moment
      .utc()
      .startOf('day')
      .add(3, 'hour') // 03:00:00
      .toDate();
  }

  static getEndOfBusinessDayUTC() {
    return moment
      .utc()
      .startOf('day')
      .add(1, 'day') // next day
      .add(2, 'hour') // 02:00:00
      .add(59, 'minutes')
      .add(59, 'seconds')
      .add(999, 'milliseconds') // 02:59:59.999
      .toDate();
  }

  static isAfterMorningMaxLateTime(date: Date | string): boolean {
    const MORNING_MAX_LATE_HOUR = 8; // 08:00
    const MORNING_MAX_LATE_MINUTE = 45; // 08:45

    const morningMaxLateTimeUTC = moment
      .utc(date)
      .startOf('day')
      .add(MORNING_MAX_LATE_HOUR, 'hours') // 08:00 UTC
      .add(MORNING_MAX_LATE_MINUTE, 'minutes') // 08:45 UTC
      .toDate();

    return moment.utc(date).isAfter(morningMaxLateTimeUTC);
  }

  static isBeforeEndMorningTime(date: Date | string): boolean {
    const END_MORNING_HOUR = 11; // 11:30
    const END_MORNING_MINUTE = 30; // 11:30

    const endMorningTimeUTC = moment
      .utc(date)
      .startOf('day')
      .add(END_MORNING_HOUR, 'hours') // 11:00 UTC
      .add(END_MORNING_MINUTE, 'minutes') // 11:30 UTC
      .toDate();

    return moment.utc(date).isBefore(endMorningTimeUTC);
  }

  static isAfterAfternoonMaxLateTime(date: Date | string): boolean {
    const AFTERNOON_MAX_LATE_HOUR = 12; // 12:00
    const AFTERNOON_MAX_LATE_MINUTE = 30; // 12:30

    const afternoonMaxLateTimeUTC = moment
      .utc(date)
      .startOf('day')
      .add(AFTERNOON_MAX_LATE_HOUR, 'hours') // 12:00 UTC
      .add(AFTERNOON_MAX_LATE_MINUTE, 'minutes') // 12:30 UTC
      .toDate();

    return moment.utc(date).isAfter(afternoonMaxLateTimeUTC);
  }

  static isBeforeEndAfternoonTime(date: Date | string): boolean {
    const END_AFTERNOON_HOUR = 16; // 16:15
    const END_AFTERNOON_MINUTE = 15; // 16:15

    const endAfternoonTimeUTC = moment
      .utc(date)
      .startOf('day')
      .add(END_AFTERNOON_HOUR, 'hours') // 16:00 UTC
      .add(END_AFTERNOON_MINUTE, 'minutes') // 16:15 UTC
      .toDate();

    return moment.utc(date).isBefore(endAfternoonTimeUTC);
  }

  static getFutureDateByDays(days: number) {
    return moment.utc().add(days, 'days').format();
  }

  static getFutureTimeBySeconds(seconds: number) {
    return moment.utc().add(seconds, 'seconds').toDate();
  }

  static calculateTimeDifferenceInMinutes(
    startTime: string | Date,
    endTime: string | Date,
  ) {
    const start = moment.utc(startTime);
    const end = moment.utc(endTime);

    return end.diff(start, 'minutes');
  }

  static calculateTimeDifferenceInDays(
    startTime: string | Date,
    endTime: string | Date,
  ) {
    const start = moment.utc(startTime);
    const end = moment.utc(endTime);

    return end.diff(start, 'days');
  }

  static getPastDateByDays(days: number) {
    return moment().subtract(days, 'days').utc(true).format();
  }

  static getPastDateByYears(years: number) {
    return moment().subtract(years, 'years').utc().format();
  }

  static getPastDateByHoursFromDate(date: Date | string, hours: number) {
    return moment.utc(date).subtract(hours, 'hours').utc().format();
  }

  static getPastDateByDaysFromDate(date: Date | string, days: number) {
    return moment.utc(date).subtract(days, 'days').utc().format();
  }

  static getPastDateByDaysInYearMonthDays(days: number) {
    return moment().subtract(days, 'days').utc().format('YYYY-MM-DD');
  }

  static getTimeByZoneFromUtcTime(time: string | Date, zone: string) {
    return moment.utc(time).tz(zone).format('YYYY-MM-DD HH:mm:ss');
  }

  static isSameOrBeforeCurrentUTCTime(otherTime: Date | string | null) {
    const currentUTCTime = moment.utc();
    const providedTime = moment.utc(otherTime);

    return providedTime.isSameOrBefore(currentUTCTime);
  }

  static isSameOrAfterCurrentUTCTime(otherTime: Date | string | null) {
    const currentUTCTime = moment.utc();
    const providedTime = moment.utc(otherTime);

    return providedTime.isSameOrAfter(currentUTCTime);
  }

  static isAfterCurrentUTCTime(otherTime: Date | string | null) {
    const currentUTCTime = moment.utc();
    const providedTime = moment.utc(otherTime);

    return providedTime.isAfter(currentUTCTime);
  }

  static getExpirationTimeForResetPasswordCode() {
    return moment.utc().add(15, 'minutes').format();
  }

  static getExpirationTimeForTwoFactorAuthCode() {
    return moment.utc().add(10, 'minutes').format();
  }

  static isBeforeCurrentUTCTime(otherTime: Date | string | null) {
    const currentUTCTime = moment.utc();
    const providedTime = moment.utc(otherTime);

    return providedTime.isBefore(currentUTCTime);
  }

  static convertToUTC(date: Date | string) {
    const m = moment.utc(date, moment.ISO_8601, true);
    return m.isValid() ? m.format() : undefined;
  }

  static isUTC(date: Date | string | null) {
    if (!date) return false;
    const m = moment.utc(date, moment.ISO_8601, true);
    return m.isValid() && m.utcOffset() === 0;
  }

  static getDateDifferenceInDays(
    startDate: Date | string,
    endDate: Date | string,
  ) {
    const start = moment.utc(startDate);
    const end = moment.utc(endDate);

    return end.diff(start, 'days');
  }
}
