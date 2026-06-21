// Mongo initDB seed — runs ONCE when a fresh local Docker Mongo volume is created
// (mounted at /docker-entrypoint-initdb.d via docker-compose.yml). It gives a brand-new
// local database the baseline rows the app reads DB-only: the clinic-settings document
// and the 7 weekly-schedule days. LOCAL DEV ONLY — prod uses Atlas (no Mongo container),
// so this never runs there; prod is provisioned by the migration scripts.
//
// Keep these values in sync with:
//   - server/src/common/constants/clinic-settings.constants.ts  (settings seed)
//   - server/migrations/v2/seed-weekly-schedule.ts               (schedule seed)

db = db.getSiblingDB('keren-clinic');

// clinic settings (booking horizon + daily reminder hour)
if (db.clinicsettings.countDocuments() === 0) {
  db.clinicsettings.insertOne({ bookingAheadDays: 183, reminderHour: 9 });
}

// base weekly schedule (0=Sunday … 6=Saturday). Empty = clinic closed that day.
if (db.weeklyscheduledays.countDocuments() === 0) {
  var MON_WED = ['09:00', '10:15', '11:45', '14:30', '15:45', '17:00', '18:15'];
  var TUE_THU = ['08:50', '10:00', '11:30'];
  db.weeklyscheduledays.insertMany([
    { weekday: 0, times: [] },
    { weekday: 1, times: MON_WED },
    { weekday: 2, times: TUE_THU },
    { weekday: 3, times: MON_WED },
    { weekday: 4, times: TUE_THU },
    { weekday: 5, times: ['08:50', '10:00', '11:30', '12:45'] },
    { weekday: 6, times: [] },
  ]);
}

print('[initDB] keren-clinic baseline seeded (clinic settings + weekly schedule)');
