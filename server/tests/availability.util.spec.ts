import { computeAvailableSlots } from '../src/appointments/availability.util';

// 2099-05-01 = Friday (base: 08:50, 10:00, 11:30, 12:45)
// 2099-05-02 = Saturday (closed), 2099-05-03 = Sunday (closed)
// 2099-05-04 = Monday (base: 09:00, 10:15, 11:45, 14:30, 15:45, 17:00, 18:15)
const FRIDAY = '2099-05-01';
const SATURDAY = '2099-05-02';
const MONDAY = '2099-05-04';
const base = { extraTimes: [], takenTimes: [], blocks: [], today: '2026-06-12', nowTime: '12:00', maxDate: '2099-12-31' };

describe('computeAvailableSlots', () => {
  it('returns the base weekly schedule for a working day', () => {
    expect(computeAvailableSlots({ ...base, date: MONDAY }))
      .toEqual(['09:00', '10:15', '11:45', '14:30', '15:45', '17:00', '18:15']);
  });

  it('returns nothing for a closed weekday', () => {
    expect(computeAvailableSlots({ ...base, date: SATURDAY })).toEqual([]);
  });

  it('opens a closed day when an extra slot is added', () => {
    expect(computeAvailableSlots({ ...base, date: SATURDAY, extraTimes: ['16:00'] })).toEqual(['16:00']);
  });

  it('merges and sorts extra slots with the base schedule', () => {
    const slots = computeAvailableSlots({ ...base, date: FRIDAY, extraTimes: ['09:30'] });
    expect(slots).toEqual(['08:50', '09:30', '10:00', '11:30', '12:45']);
  });

  it('removes taken times', () => {
    expect(computeAvailableSlots({ ...base, date: FRIDAY, takenTimes: ['10:00'] }))
      .toEqual(['08:50', '11:30', '12:45']);
  });

  it('removes a full-day blocked date', () => {
    expect(computeAvailableSlots({
      ...base, date: FRIDAY, blocks: [{ startDate: FRIDAY, endDate: FRIDAY }],
    })).toEqual([]);
  });

  it('removes times inside a blocked hour range only', () => {
    expect(computeAvailableSlots({
      ...base, date: FRIDAY, blocks: [{ startDate: FRIDAY, endDate: FRIDAY, startTime: '09:00', endTime: '11:00' }],
    })).toEqual(['08:50', '11:30', '12:45']); // 10:00 removed
  });

  it('returns nothing for a past date', () => {
    expect(computeAvailableSlots({ ...base, date: '2020-01-01' })).toEqual([]);
  });

  it('returns nothing for a date beyond the booking horizon', () => {
    expect(computeAvailableSlots({ ...base, date: MONDAY, maxDate: '2026-07-12' })).toEqual([]);
  });

  it('removes times that already passed today', () => {
    const slots = computeAvailableSlots({ ...base, date: MONDAY, today: MONDAY, nowTime: '15:00' });
    expect(slots).toEqual(['15:45', '17:00', '18:15']); // earlier ones dropped
  });

  it('de-duplicates an extra slot that equals a base slot', () => {
    const slots = computeAvailableSlots({ ...base, date: FRIDAY, extraTimes: ['10:00'] });
    expect(slots).toEqual(['08:50', '10:00', '11:30', '12:45']);
  });
});
