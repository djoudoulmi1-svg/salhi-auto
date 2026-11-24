export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function isValidUsername(username: string) {
  return /^[a-z0-9][a-z0-9._-]{2,31}$/.test(username);
}

export function usernameLoginEmail(username: string) {
  return `${normalizeUsername(username)}@staff.salhiauto.invalid`;
}
