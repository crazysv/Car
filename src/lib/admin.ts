export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  
  const adminEmailsStr = process.env.ADMIN_EMAILS;
  if (!adminEmailsStr || adminEmailsStr.trim() === "") {
    // Fail closed if not configured
    return false;
  }

  const allowedEmails = adminEmailsStr
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return allowedEmails.includes(email.trim().toLowerCase());
}
