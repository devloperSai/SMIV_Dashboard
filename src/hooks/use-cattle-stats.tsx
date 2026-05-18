import { useState, useEffect } from 'react';
import { getHerdSummary } from '../data/data';
import { HerdSummary } from '@/types/cattle';

export const useCattleStats = () => {
  const [stats, setStats] = useState<HerdSummary>(getHerdSummary());

  useEffect(() => {
    // Poll for updates every 3 seconds if not using a callback pattern
    const interval = setInterval(() => {
      setStats(getHerdSummary());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return stats;
};