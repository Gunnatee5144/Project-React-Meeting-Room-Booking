export type AuthActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
  /** Safe same-site path the client should navigate to after success. */
  redirectTo?: string;
};
