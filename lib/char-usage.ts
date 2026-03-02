import fs from 'fs';
import path from 'path';

const USAGE_FILE = path.join(process.cwd(), 'data', 'el-usage.json');
export const MONTHLY_LIMIT = 100_000;

function getMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function readUsage(): Record<string, number> {
  try {
    return JSON.parse(fs.readFileSync(USAGE_FILE, 'utf-8')) as Record<string, number>;
  } catch {
    return {};
  }
}

function writeUsage(data: Record<string, number>): void {
  const dir = path.dirname(USAGE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function getMonthlyUsage(): { used: number; remaining: number; limit: number; month: string } {
  const key = getMonthKey();
  const data = readUsage();
  const used = data[key] ?? 0;
  return { used, remaining: Math.max(0, MONTHLY_LIMIT - used), limit: MONTHLY_LIMIT, month: key };
}

export function recordUsage(chars: number): void {
  const key = getMonthKey();
  const data = readUsage();
  data[key] = (data[key] ?? 0) + chars;
  writeUsage(data);
}

export function hasCapacity(chars: number): boolean {
  return chars <= getMonthlyUsage().remaining;
}
