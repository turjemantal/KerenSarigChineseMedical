import { computeAvailableSlots } from '../src/appointments/availability.util';
import { oneAppointmentAfter, justInsideWindow } from './helpers/time';

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
    })).toEqual(['11:30', '12:45']); // 10:00 starts inside the block; 08:50 runs into it
  });

  // A slot occupies APPOINTMENT_DURATION_MINUTES, so a block closes every slot whose
  // WINDOW overlaps it — not only one whose start time falls inside it.
  it('removes a slot that starts before a block but runs into it', () => {
    expect(computeAvailableSlots({
      ...base, date: DATE, baseTimes: ['09:00'], blocks: [{ startDate: DATE, endDate: DATE, startTime: '09:30', endTime: '11:00' }],
    })).toEqual([]);
  });

  it('keeps a slot that ends exactly when a block starts', () => {
    expect(computeAvailableSlots({
      ...base, date: DATE, baseTimes: ['09:00'], blocks: [{ startDate: DATE, endDate: DATE, startTime: oneAppointmentAfter('09:00'), endTime: '11:00' }],
    })).toEqual(['09:00']);
  });

  it('removes a slot that runs one minute into a block', () => {
    expect(computeAvailableSlots({
      ...base, date: DATE, baseTimes: ['09:00'], blocks: [{ startDate: DATE, endDate: DATE, startTime: justInsideWindow('09:00'), endTime: '11:00' }],
    })).toEqual([]);
  });

  it('keeps a slot that starts exactly when a block ends', () => {
    expect(computeAvailableSlots({
      ...base, date: DATE, baseTimes: ['11:00'], blocks: [{ startDate: DATE, endDate: DATE, startTime: '09:00', endTime: '11:00' }],
    })).toEqual(['11:00']);
  });

  it('removes an extra slot whose window overlaps a block', () => {
    expect(computeAvailableSlots({
      ...base, date: DATE, baseTimes: [], extraTimes: ['13:00'], blocks: [{ startDate: DATE, endDate: DATE, startTime: '13:15', endTime: '14:00' }],
    })).toEqual([]);
  });

  it('applies the overlap rule on every date of a multi-day timed block', () => {
    const block = { startDate: '2099-05-01', endDate: '2099-05-03', startTime: '09:30', endTime: '11:00' };
    for (const date of ['2099-05-01', '2099-05-02', '2099-05-03']) {
      expect(computeAvailableSlots({ ...base, date, baseTimes: ['09:00'], blocks: [block] })).toEqual([]);
    }
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

  it('hides candidates within one appointment of a taken time on either side', () => {
    const free = oneAppointmentAfter('18:00');
    expect(computeAvailableSlots({
      ...base, date: DATE, baseTimes: ['17:30', '18:00', '18:15', free], takenTimes: ['18:00'],
    })).toEqual([free]); // 17:30 and 18:15 both sit inside 18:00's window
  });

  it('keeps a candidate exactly one appointment away from a taken time (strict <)', () => {
    const free = oneAppointmentAfter('18:00');
    expect(computeAvailableSlots({
      ...base, date: DATE, baseTimes: ['18:00', free], takenTimes: ['18:00'],
    })).toEqual([free]);
  });

  it('hides a candidate one minute inside a taken time’s window', () => {
    expect(computeAvailableSlots({
      ...base, date: DATE, baseTimes: ['18:00', justInsideWindow('18:00')], takenTimes: ['18:00'],
    })).toEqual([]);
  });

  it('hides a shifted extra slot too close to a taken base time', () => {
    expect(computeAvailableSlots({
      ...base, date: DATE, baseTimes: ['18:00'], extraTimes: ['18:20'], takenTimes: ['18:00'],
    })).toEqual([]);
  });
});
