export type RoomActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};
