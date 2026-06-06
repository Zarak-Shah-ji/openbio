function escapeCsv(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Serialize captured leads to CSV text (for the dashboard export button). */
export function leadsToCsv(
  leads: { email: string; created_at: string }[],
): string {
  const header = "email,created_at";
  const rows = leads.map(
    (l) => `${escapeCsv(l.email)},${escapeCsv(l.created_at)}`,
  );
  return [header, ...rows].join("\n");
}
