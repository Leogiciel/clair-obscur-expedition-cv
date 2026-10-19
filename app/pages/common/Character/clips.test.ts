import { beforeEach, describe, expect, it, vi } from 'vitest';

const load = async () => {
  vi.resetModules();
  return import('./clips');
};

beforeEach(() => {
  let n = 0;
  vi.spyOn(URL, 'createObjectURL').mockImplementation(() => `blob:clip-${++n}`);
});

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('preloadClips', () => {
  it('keeps every clip in memory and reports the progress', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(new Blob(['x'])))
    );
    const clips = await load();
    expect(clips.clipsProgress()).toBe(0);
    clips.preloadClips(['/a.mp4', '/b.mp4']);
    await flush();
    expect(clips.clipsProgress()).toBe(1);
    expect(clips.clipUrl('/a.mp4')).toMatch(/^blob:/);
  });

  it('fetches a clip once, however often it is asked for', async () => {
    const fetch = vi.fn(async () => new Response(new Blob(['x'])));
    vi.stubGlobal('fetch', fetch);
    const clips = await load();
    clips.preloadClips(['/a.mp4']);
    clips.preloadClips(['/a.mp4', '/a.mp4']);
    await flush();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('falls back to streaming a clip it could not download', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 404 }))
    );
    const clips = await load();
    clips.preloadClips(['/missing.mp4']);
    await flush();
    expect(clips.clipUrl('/missing.mp4')).toBe('/missing.mp4');
    expect(clips.clipsProgress()).toBe(1);
  });

  it('tells subscribers when a clip is ready', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(new Blob(['x'])))
    );
    const clips = await load();
    const listener = vi.fn();
    const unsubscribe = clips.subscribeClips(listener);
    const before = clips.clipsVersion();
    clips.preloadClips(['/a.mp4']);
    await flush();
    expect(listener).toHaveBeenCalled();
    expect(clips.clipsVersion()).toBeGreaterThan(before);
    unsubscribe();
  });
});
