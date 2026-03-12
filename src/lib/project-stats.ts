import statsData from "@/data/projects/stats.json";

export interface ProjectStats {
  order: number;
  stars: number;
  npmDownloads: number;
  lastActivity: string | null;
}

const stats: Record<string, ProjectStats> = statsData;

const defaultStats: ProjectStats = {
  order: 0,
  stars: 0,
  npmDownloads: 0,
  lastActivity: null,
};

export function getProjectStats(slug: string): ProjectStats {
  return stats[slug] ?? defaultStats;
}

export function getProjectOrder(slug: string): number {
  return (stats[slug]?.order ?? 0);
}
