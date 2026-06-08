#!/bin/bash
set -e

echo "🌱 Seeding database keren-clinic..."

docker exec keren-mongo mongosh keren-clinic --quiet --eval '
const now = new Date();
const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
const nextWeek = new Date(now); nextWeek.setDate(now.getDate() + 7);
const nextMonth = new Date(now); nextMonth.setDate(now.getDate() + 30);
const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);

// ── Clients ────────────────────────────────────────────────────────────────
db.clients.insertMany([
  { name: "דנה לוי",    phone: "0501111111", email: "dana@example.com",   createdAt: now },
  { name: "יוסי כהן",   phone: "0522222222", email: null,                 createdAt: now },
  { name: "מיכל אברהם", phone: "0543333333", email: "michal@example.com", createdAt: now },
]);

// ── Appointments ───────────────────────────────────────────────────────────
db.appointments.insertMany([
  {
    name: "דנה לוי", phone: "0501111111", email: "dana@example.com",
    date: tomorrow.toISOString().split("T")[0], time: "10:00",
    concern: "כאבי גב", treatment: "דיקור סיני",
    status: "scheduled", reminderSent: false,
  },
  {
    name: "יוסי כהן", phone: "0522222222", email: null,
    date: tomorrow.toISOString().split("T")[0], time: "11:30",
    concern: "עייפות כרונית", treatment: "דיקור וצמחי מרפא",
    status: "scheduled", reminderSent: false,
  },
  {
    name: "מיכל אברהם", phone: "0543333333", email: "michal@example.com",
    date: nextWeek.toISOString().split("T")[0], time: "09:00",
    concern: "כאבי ראש", treatment: "טיפול משולב",
    status: "pending", reminderSent: false,
  },
  {
    name: "דנה לוי", phone: "0501111111", email: "dana@example.com",
    date: nextMonth.toISOString().split("T")[0], time: "14:00",
    concern: "המשך טיפול", treatment: "דיקור סיני",
    status: "scheduled", reminderSent: false,
  },
  {
    name: "יוסי כהן", phone: "0522222222", email: null,
    date: yesterday.toISOString().split("T")[0], time: "10:30",
    concern: "כאבי מפרקים", treatment: "דיקור סיני",
    status: "completed", reminderSent: true,
  },
]);

// ── Leads ──────────────────────────────────────────────────────────────────
db.leads.insertMany([
  {
    name: "רון שמש", phone: "0554444444", email: "ron@example.com",
    concern: "כאבי גב תחתון", treatment: "ייעוץ ראשוני",
    preferredDate: nextWeek.toISOString().split("T")[0], preferredTime: "morning",
    status: "new", source: "אתר", createdAt: now,
  },
  {
    name: "שרה גולן", phone: "0505555555", email: null,
    concern: "בעיות שינה", treatment: "ייעוץ ראשוני",
    preferredDate: null, preferredTime: "afternoon",
    status: "contacted", source: "אתר", createdAt: now,
  },
  {
    name: "אמיר נחום", phone: "0526666666", email: "amir@example.com",
    concern: "חרדות וסטרס", treatment: "ייעוץ ראשוני",
    preferredDate: nextMonth.toISOString().split("T")[0], preferredTime: "morning",
    status: "booked", source: "אתר", createdAt: now,
  },
]);

print("Done.");
'

echo "✅ Seeded: 3 clients, 5 appointments, 3 leads."
