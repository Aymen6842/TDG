import { Test, TestingModule } from '@nestjs/testing';
import { TimeService } from './time.service';
import * as moment from 'moment-timezone';

describe('TimeService', () => {
  let service: TimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimeService],
    }).compile();

    service = module.get<TimeService>(TimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentTime', () => {
    it('should return the current UTC time in ISO format', () => {
      const result = TimeService.getCurrentTime();
      expect(moment.utc(result).isValid()).toBe(true);
    });
  });

  describe('getPastDateByDays', () => {
    it('should return the date in the past by the given number of days', () => {
      const days = 5;
      const result = TimeService.getPastDateByDays(days);
      const expected = moment().subtract(days, 'days').utc(true).format();
      expect(result).toBe(expected);
    });
  });

  describe('getPastDateByDaysInYearMonthDays', () => {
    it('should return the date in the past by the given number of days in YYYY-MM-DD format', () => {
      const days = 10;
      const result = TimeService.getPastDateByDaysInYearMonthDays(days);
      const expected = moment()
        .subtract(days, 'days')
        .utc()
        .format('YYYY-MM-DD');
      expect(result).toBe(expected);
    });
  });

  describe('getTimeByZoneFromUtcTime', () => {
    it('should convert UTC time to the specified timezone', () => {
      const time = '2025-04-07T12:00:00Z';
      const zone = 'America/New_York';
      const result = TimeService.getTimeByZoneFromUtcTime(time, zone);
      const expected = moment.utc(time).tz(zone).format('YYYY-MM-DD HH:mm:ss');
      expect(result).toBe(expected);
    });
  });

  describe('isSameOrBeforeCurrentUTCTime', () => {
    it('should return true if the given time is the same or before the current UTC time', () => {
      const time = moment.utc().subtract(1, 'minute').toDate();
      const result = TimeService.isSameOrBeforeCurrentUTCTime(time);
      expect(result).toBe(true);
    });

    it('should return false if the given time is after the current UTC time', () => {
      const time = moment.utc().add(1, 'minute').toDate();
      const result = TimeService.isSameOrBeforeCurrentUTCTime(time);
      expect(result).toBe(false);
    });
  });

  describe('isSameOrAfterCurrentUTCTime', () => {
    it('should return true if the given time is the same or after the current UTC time', () => {
      const time = moment.utc().add(1, 'minute').toDate();
      const result = TimeService.isSameOrAfterCurrentUTCTime(time);
      expect(result).toBe(true);
    });

    it('should return false if the given time is before the current UTC time', () => {
      const time = moment.utc().subtract(1, 'minute').toDate();
      const result = TimeService.isSameOrAfterCurrentUTCTime(time);
      expect(result).toBe(false);
    });
  });

  describe('isAfterCurrentUTCTime', () => {
    it('should return true if the given time is after the current UTC time', () => {
      const time = moment.utc().add(1, 'minute').toDate();
      const result = TimeService.isAfterCurrentUTCTime(time);
      expect(result).toBe(true);
    });

    it('should return false if the given time is the same or before the current UTC time', () => {
      const time = moment.utc().subtract(1, 'minute').toDate();
      const result = TimeService.isAfterCurrentUTCTime(time);
      expect(result).toBe(false);
    });
  });

  describe('getExpirationTimeForResetPasswordCode', () => {
    it('should return the expiration time 10 minutes from now in UTC', () => {
      const result = TimeService.getExpirationTimeForResetPasswordCode();
      const expected = moment.tz('utc').add(10, 'minutes').utc(true).format();
      expect(result).toBe(expected);
    });
  });

  describe('isBeforeCurrentUTCTime', () => {
    it('should return true if the given time is before the current UTC time', () => {
      const time = moment.utc().subtract(1, 'minute').toDate();
      const result = TimeService.isBeforeCurrentUTCTime(time);
      expect(result).toBe(true);
    });

    it('should return false if the given time is the same or after the current UTC time', () => {
      const time = moment.utc().add(1, 'minute').toDate();
      const result = TimeService.isBeforeCurrentUTCTime(time);
      expect(result).toBe(false);
    });
  });
});
