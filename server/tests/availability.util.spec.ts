import { computeAvailableSlots } from '../src/appointments/availability.util';

const MON_BASE = ['09:00', '10:15', '11:45', '14:30', '15:45', '17:00', '18:15'];
const FRI_BASE = ['08:50', '10:00', '11:30', '12:45'];
const DATE = '2099-05-01'; // far-future, never past
const base = { baseTimes: [], extraTimes: [], takenTimes: [], blocks: [], today: '2026-06-12', nowTime: '12:00', maxDate: '2099-12-31' };

describe('computeAvailableSlots', () => {
  it('returns the base schedule for the day', () => {
    expect(computeAvailableSlots({ ...base, date: DATE, baseTimes: MON_BASE })).toEqual(MON_BASE);
  });

  it('returns nothing when the day has no base slots (closed)', () => {
    expect(computeAvailableSlots({ ...base, date: DATE, baseTimes: [] })).toEqual([]);
  });

  it('opens a closed day when an extra slot is added', () => {
    expect(computeAvailableSlots({ ...base, date: DATE, baseTimes: [], extraTimes: ['16:00'] })).toEqual(['16:00']);
  });

  it('merges and sorts extra slots with the base schedule', () => {
    expect(computeAvailableSlots({ ...base, date: DATE, baseTimes: FRI_BASE, extraTimes: ['09:30'] }))
      .toEqual(['08:50', '09:30', '10:00', '11:30', '12:45']);
  });

  it('removes taken times', () => {
    expect(computeAvailableSlots({ ...base, date: DATE, baseTimes: FRI_BASE, takenTimes: ['10:00'] }))
      .toEqual(['08:50', '11:30', '12:45']);
  });

  it('removes a full-day blocked date', () => {
    expect(computeAvailableSlots({
      ...base, date: DATE, baseTimes: FRI_BASE, blocks: [{ startDate: DATE, endDate: DATE }],
    })).toEqual([]);
  });

  it('removes times inside a blocked hour range only', () => {
    expect(computeAvailableSlots({
      ...base, date: DATE, baseTimes: FRI_BASE, blocks: [{ startDate: DATE, endDate: DATE, startTime: '09:00', endTime: '11:00' }],
    })).toEqual(['08:50', '11:30', '12:45']); // 10:00 removed
  });

  it('returns nothing for a past date', () => {
    expect(computeAvailableSlots({ ...base, date: '2020-01-01', baseTimes: MON_BASE })).toEqual([]);
  });

  it('returns nothing beyond the booking horizon', () => {
    expect(computeAvailableSlots({ ...base, date: DATE, baseTimes: MON_BASE, maxDate: '2026-07-12' })).toEqual([]);
  });

  it('removes times that already passed today', () => {
    expect(computeAvailableSlots({ ...base, date: '2026-06-12', baseTimes: MON_BASE, today: '2026-06-12', nowTime: '15:00' }))
      .toEqual(['15:45', '17:00', '18:15']);
  });

  it('de-duplicates an extra slot that equals a base slot', () => {
    expect(computeAvailableSlots({ ...base, date: DATE, baseTimes: FRI_BASE, extraTimes: ['10:00'] }))
      .toEqual(['08:50', '10:00', '11:30', '12:45']);
  });
});
