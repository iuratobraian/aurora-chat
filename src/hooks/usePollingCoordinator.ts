import { useState, useEffect, useRef, useCallback } from 'react';

type PollingTask = {
  id: string;
  fn: () => void;
  interval: number;
  lastRun: number;
  enabled: boolean;
};

const tasks = new Map<string, PollingTask>();
let masterInterval: ReturnType<typeof setInterval> | null = null;
const TICK_MS = 100;

function startMasterLoop(): void {
  if (masterInterval) return;
  masterInterval = setInterval(() => {
    const now = Date.now();
    for (const [id, task] of tasks) {
      if (!task.enabled) continue;
      if (now - task.lastRun >= task.interval) {
        task.lastRun = now;
        try {
          task.fn();
        } catch (e) {
          console.error(`[PollingCoordinator] Task ${id} error:`, e);
        }
      }
    }
  }, TICK_MS);
}

function stopMasterLoop(): void {
  if (masterInterval) {
    clearInterval(masterInterval);
    masterInterval = null;
  }
}

function registerTask(task: PollingTask): void {
  tasks.set(task.id, task);
  if (tasks.size > 0) startMasterLoop();
}

function unregisterTask(id: string): void {
  tasks.delete(id);
  if (tasks.size === 0) stopMasterLoop();
}

export function usePollingCoordinator(
  id: string,
  fn: () => void,
  interval: number,
  enabled = true
): void {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const stableFn = useCallback(() => fnRef.current(), []);

  useEffect(() => {
    if (!enabled) return;

    registerTask({
      id,
      fn: stableFn,
      interval,
      lastRun: 0,
      enabled: true,
    });

    return () => {
      unregisterTask(id);
    };
  }, [id, interval, enabled, stableFn]);
}

export function useVisibilityAwarePolling(
  id: string,
  fn: () => void,
  interval: number,
  enabled = true
): void {
  const [isVisible, setIsVisible] = useState(document.visibilityState === 'visible');

  useEffect(() => {
    const handleVisibility = () => {
      setIsVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  usePollingCoordinator(
    id,
    fn,
    interval,
    enabled && isVisible
  );
}

export function getActivePollingTasks(): string[] {
  return [...tasks.entries()]
    .filter(([, task]) => task.enabled)
    .map(([id]) => id);
}

export function getPollingStats(): { active: number; total: number } {
  return {
    active: [...tasks.values()].filter(t => t.enabled).length,
    total: tasks.size,
  };
}
