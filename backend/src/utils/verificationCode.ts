// Generate a random 6-character verification code
export function generateVerificationCode(): string {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excludes confusing chars (0, O, I, 1)
  let code = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
}

// Format code for display (e.g., ABC-123)
export function formatVerificationCode(code: string): string {
  if (code.length !== 6) return code;
  return `${code.substring(0, 3)}-${code.substring(3)}`;
}

// Normalize code for comparison (remove hyphens, uppercase)
export function normalizeVerificationCode(code: string): string {
  return code.replace(/[-\s]/g, "").toUpperCase();
}
