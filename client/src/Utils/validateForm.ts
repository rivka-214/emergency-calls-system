export function areAllFieldsFilled(obj: Record<string, string>) {
  return Object.values(obj).every(value => value.trim() !== "");
}
