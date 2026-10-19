import { vi } from 'vitest';

// The data modules read the date when they load (today's month, the owner's age): each test loads them afresh at a
// fixed date.
export const at = async <T>(date: string, load: () => Promise<T>) => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(date));
  vi.resetModules();
  try {
    return await load();
  } finally {
    vi.useRealTimers();
  }
};
