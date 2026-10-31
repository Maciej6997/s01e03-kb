// What #4471 actually holds: one problem per fix. Counted the desk's way: causes.ts places each
// report by tenant (parser or hint), and the desk's one-day moves (desk-notes.json) stay counted
// where they are filed. They are also a problem of their own, so they get a row too.
import { groupByCause, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day' | 'unplaced';

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  // For one-day: the cause these reports are filed under.
  filedUnder?: string[];
};

function summary(problem: Problem, rs: Report[]): ProblemGroup {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return { problem, reports: rs, tenants: new Set(rs.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1] };
}

// Unique reports merged into the ticket, one row per problem.
export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: Report[]; groups: ProblemGroup[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const groups: ProblemGroup[] = groupByCause(merged, tenantOf).map((g) => summary(g.cause, g.reports));
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  if (moved.length) {
    const filedUnder = groups.filter((g) => g.reports.some((r) => oneDayMove.includes(r.id))).map((g) => g.problem);
    groups.push({ ...summary('one-day', moved), filedUnder });
  }
  return { merged, groups };
}
