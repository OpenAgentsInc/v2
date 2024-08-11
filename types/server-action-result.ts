export type ServerActionResult<T> =
    | { success: true; data: T }
    | { success: false; error: string }
