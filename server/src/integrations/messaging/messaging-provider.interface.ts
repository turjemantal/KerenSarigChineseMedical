// Every method resolves to `true` when the message was handed off to the provider
// (or skipped in non-sending envs) and `false` when the send failed — so callers
// like the reminder job can decide whether to mark an appointment as reminded.
export interface IMessagingProvider {
  sendOtp(phone: string, code: string): Promise<boolean>;
  sendBookingRequestReceived(phone: string, name: string, date: string, time: string): Promise<boolean>;
  sendBookingConfirmation(phone: string, name: string, date: string, time: string): Promise<boolean>;
  sendBookingRejected(phone: string, name: string, date: string, time: string): Promise<boolean>;
  sendBookingCancelled(phone: string, name: string, date: string, time: string): Promise<boolean>;
  sendAppointmentReminder(phone: string, time: string): Promise<boolean>;
  sendNewBookingAlert(phone: string, name: string, date: string, time: string): Promise<boolean>;
  sendCancellationAlert(phone: string, name: string, date: string, time: string): Promise<boolean>;
  sendNewLeadAlert(phone: string, name: string, leadPhone: string, concern: string): Promise<boolean>;
}
