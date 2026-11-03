const date = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
const number = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

export const formatDate = (iso: string) => date.format(new Date(iso));
export const formatCount = (n: number) => n.toLocaleString("pt-BR");

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${number.format(bytes / 1024)} KB`;
  return `${number.format(bytes / (1024 * 1024))} MB`;
}
