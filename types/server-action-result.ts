export type ServerActionResult<T> =
  | { success: true; data: T }
  | { success: boolean; error?: string }
