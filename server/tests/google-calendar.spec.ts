import { Test, TestingModule } from '@nestjs/testing';
import { GoogleCalendarService } from '../src/integrations/google-calendar/google-calendar.service';
import { AppointmentDocument } from '../src/appointments/appointment.schema';
import { AppointmentStatus } from '../src/common/enums/appointment-status.enum';
import { CALENDAR_EVENT_SUMMARY, CALENDAR_EVENT_SUMMARY_PENDING } from '../src/common/constants/defaults.constants';

// mock @googleapis/calendar so no real HTTP calls are made.
// The fns are defined inside the factory (jest.mock is hoisted above const declarations)
// and retrieved from the mock module below.
jest.mock('@googleapis/calendar', () => ({
  auth: {
    GoogleAuth: jest.fn().mockImplementation(() => ({})),
  },
  calendar: jest.fn().mockReturnValue({
    events: {
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  }),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const calendarMock = require('@googleapis/calendar').calendar();
const mockEventsInsert: jest.Mock = calendarMock.events.insert;
const mockEventsUpdate: jest.Mock = calendarMock.events.update;
const mockEventsDelete: jest.Mock = calendarMock.events.delete;

const VALID_CREDENTIALS = JSON.stringify({ type: 'service_account', project_id: 'test' });
const CALENDAR_ID = 'test-calendar@example.com';

const makeAppt = (overrides = {}) => ({
  _id: 'a1',
  name: 'Alice Smith',
  phone: '0501111111',
  date: '2026-07-15',
  time: '09:00',
  treatment: 'טיפול',
  concern: 'כאב גב',
  notes: '',
  status: AppointmentStatus.SCHEDULED,
  ...overrides,
} as unknown as AppointmentDocument);

describe('GoogleCalendarService', () => {
  let service: GoogleCalendarService;

  beforeEach(async () => {
    process.env.GOOGLE_CALENDAR_CREDENTIALS = VALID_CREDENTIALS;
    process.env.GOOGLE_CALENDAR_ID = CALENDAR_ID;

    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleCalendarService],
    }).compile();

    service = module.get<GoogleCalendarService>(GoogleCalendarService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.GOOGLE_CALENDAR_CREDENTIALS;
    delete process.env.GOOGLE_CALENDAR_ID;
  });

  describe('createEvent', () => {
    it('inserts an event and returns its id', async () => {
      mockEventsInsert.mockResolvedValueOnce({ data: { id: 'evt-123' } });
      const eventId = await service.createEvent(makeAppt());
      expect(eventId).toBe('evt-123');
      expect(mockEventsInsert).toHaveBeenCalledWith(
        expect.objectContaining({ calendarId: CALENDAR_ID }),
      );
    });

    it('event body contains the appointment name and date', async () => {
      mockEventsInsert.mockResolvedValueOnce({ data: { id: 'evt-1' } });
      await service.createEvent(makeAppt());
      const { requestBody } = mockEventsInsert.mock.calls[0][0];
      expect(requestBody.description).toContain('Alice Smith');
      expect(requestBody.start.dateTime).toContain('2026-07-15');
      expect(requestBody.start.dateTime).toContain('09:00');
    });

    it('end time is CALENDAR_EVENT_DURATION_MINUTES after the start', async () => {
      mockEventsInsert.mockResolvedValueOnce({ data: { id: 'evt-1' } });
      await service.createEvent(makeAppt({ time: '09:00' }));
      const { requestBody } = mockEventsInsert.mock.calls[0][0];
      // 09:00 + 50 min = 09:50
      expect(requestBody.end.dateTime).toContain('09:50');
    });

    it('uses the normal summary for a scheduled appointment', async () => {
      mockEventsInsert.mockResolvedValueOnce({ data: { id: 'evt-1' } });
      await service.createEvent(makeAppt({ status: AppointmentStatus.SCHEDULED }));
      const { requestBody } = mockEventsInsert.mock.calls[0][0];
      expect(requestBody.summary).toBe(CALENDAR_EVENT_SUMMARY);
    });

    it('uses the pending summary for a pending appointment', async () => {
      mockEventsInsert.mockResolvedValueOnce({ data: { id: 'evt-1' } });
      await service.createEvent(makeAppt({ status: AppointmentStatus.PENDING }));
      const { requestBody } = mockEventsInsert.mock.calls[0][0];
      expect(requestBody.summary).toBe(CALENDAR_EVENT_SUMMARY_PENDING);
    });

    it('returns null and does not throw when the API call fails', async () => {
      mockEventsInsert.mockRejectedValueOnce(new Error('API error'));
      await expect(service.createEvent(makeAppt())).resolves.toBeNull();
    });

    it('returns null and skips the API call when credentials are not configured', async () => {
      delete process.env.GOOGLE_CALENDAR_CREDENTIALS;
      const result = await service.createEvent(makeAppt());
      expect(result).toBeNull();
      expect(mockEventsInsert).not.toHaveBeenCalled();
    });
  });

  describe('updateEvent', () => {
    it('calls events.update with the correct eventId and calendarId', async () => {
      mockEventsUpdate.mockResolvedValueOnce({});
      await service.updateEvent('evt-999', makeAppt({ time: '10:00' }));
      expect(mockEventsUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ calendarId: CALENDAR_ID, eventId: 'evt-999' }),
      );
    });

    it('does not throw when the API call fails', async () => {
      mockEventsUpdate.mockRejectedValueOnce(new Error('not found'));
      await expect(service.updateEvent('evt-x', makeAppt())).resolves.toBeUndefined();
    });

    it('skips the API call when credentials are not configured', async () => {
      delete process.env.GOOGLE_CALENDAR_CREDENTIALS;
      await service.updateEvent('evt-1', makeAppt());
      expect(mockEventsUpdate).not.toHaveBeenCalled();
    });

    it('skips the API call when eventId is empty', async () => {
      await service.updateEvent('', makeAppt());
      expect(mockEventsUpdate).not.toHaveBeenCalled();
    });
  });

  describe('deleteEvent', () => {
    it('calls events.delete with the correct eventId and calendarId', async () => {
      mockEventsDelete.mockResolvedValueOnce({});
      await service.deleteEvent('evt-del');
      expect(mockEventsDelete).toHaveBeenCalledWith(
        expect.objectContaining({ calendarId: CALENDAR_ID, eventId: 'evt-del' }),
      );
    });

    it('does not throw when the API call fails', async () => {
      mockEventsDelete.mockRejectedValueOnce(new Error('gone'));
      await expect(service.deleteEvent('evt-x')).resolves.toBeUndefined();
    });

    it('skips the API call when credentials are not configured', async () => {
      delete process.env.GOOGLE_CALENDAR_CREDENTIALS;
      await service.deleteEvent('evt-1');
      expect(mockEventsDelete).not.toHaveBeenCalled();
    });

    it('skips the API call when eventId is empty', async () => {
      await service.deleteEvent('');
      expect(mockEventsDelete).not.toHaveBeenCalled();
    });
  });
});
