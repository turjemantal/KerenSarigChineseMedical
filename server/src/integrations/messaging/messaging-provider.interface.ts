export interface IMessagingProvider {
  sendOtp(phone: string, code: string): Promise<void>;
  sendBookingConfirmation(phone: string, name: string, date: string, time: string): Promise<void>;
  sendAppointmentReminder(phone: string, time: string): Promise<void>;
}
