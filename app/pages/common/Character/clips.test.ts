import { beforeEach, describe, expect, it, vi } from 'vitest';

const load = async () => {
  vi.resetModules();
  return import('./clips');
};

const ok = (_url?: string) => Promise.resolve(new Response(new Blob(['x'])));

beforeEach(() => {
  let n = 0;
  vi.spyOn(URL, 'createObjectURL').mockImplementation(() => `blob:clip-${++n}`);
});

describe('preloadClips', () => {
  it('keeps every clip in memory, in the order asked', async () => {
    const fetch = vi.fn(ok);
    vi.stubGlobal('fetch', fetch);
    const clips = await load();
    clips.preloadClips(['/a.mp4', '/b.mp4']);
    await vi.waitFor(() => expect(clips.clipsProgress()).toBe(1));
    expect(fetch.mock.calls.map(([url]) => url)).toEqual(['/a.mp4', '/b.mp4']);
    expect(clips.clipUrl('/a.mp4')).toMatch(/^blob:/);
  });

  it('reports the share downloaded so far', async () => {
    let finish = () => {};
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        url === '/slow.mp4'
          ? new Promise<Response>((resolve) => (finish = () => resolve(new Response(new Blob(['x'])))))
          : ok()
      )
    );
    const clips = await load();
    expect(clips.clipsProgress()).toBe(0);
    clips.preloadClips(['/fast.mp4', '/slow.mp4']);
    await vi.waitFor(() => expect(clips.clipsProgress()).toBe(0.5));
    expect(clips.clipUrl('/slow.mp4')).toBeUndefined();
    finish();
    await vi.waitFor(() => expect(clips.clipsProgress()).toBe(1));
  });

  it('fetches a clip once, however often it is asked for', async () => {
    const fetch = vi.fn(ok);
    vi.stubGlobal('fetch', fetch);
    const clips = await load();
    clips.preloadClips(['/a.mp4']);
    clips.preloadClips(['/a.mp4', '/a.mp4']);
    await vi.waitFor(() => expect(clips.clipsProgress()).toBe(1));
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('falls back to streaming a clip it could not download', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(null, { status: 404 })))
    );
    const clips = await load();
    clips.preloadClips(['/missing.mp4']);
    await vi.waitFor(() => expect(clips.clipUrl('/missing.mp4')).toBe('/missing.mp4'));
  });

  it('tells subscribers when a clip is ready', async () => {
    vi.stubGlobal('fetch', vi.fn(ok));
    const clips = await load();
    const listener = vi.fn();
    const unsubscribe = clips.subscribeClips(listener);
    const before = clips.clipsVersion();
    clips.preloadClips(['/a.mp4']);
    await vi.waitFor(() => expect(listener).toHaveBeenCalled());
    expect(clips.clipsVersion()).toBeGreaterThan(before);
    unsubscribe();
  });
});
