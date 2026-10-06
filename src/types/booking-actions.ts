export type BookingActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
  bookingId?: string;
};
