export function useDailyPin(): string {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  let hash = 0;
  const secret = "SIGIZI-MBG-2026";
  const str = `${dateStr}-${secret}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return String(Math.abs(hash)).slice(0, 4);
}

export function verifyPin(input: string, correctPin: string): boolean {
  return input.trim() === correctPin;
}
