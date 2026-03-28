import { apiFetch } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
  const period = url.searchParams.get('period') || '30d';
  
  try {
    const stats = await apiFetch(`/admin/stats?period=${period}`, {}, fetch);
    return {
      stats,
      period
    };
  } catch (error) {
    return {
      stats: null,
      error: (error as Error).message,
      period
    };
  }
};
