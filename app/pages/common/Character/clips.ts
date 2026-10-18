// Every clip is downloaded once into memory (a blob), which costs its file size and no decoder: only the clips a
// screen can play next are given to a <video> (Character), and a move then starts from memory at once instead of
// buffering over the network when the visitor picks a screen. The start screen waits on these downloads.
const ready = new Map<string, string>();
const requested = new Set<string>();
const listeners = new Set<() => void>();
let version = 0;

const notify = () => {
  version++;
  for (const listener of listeners) listener();
};

// The clips first in the list are fetched first: the ones the current screen needs, then the rest.
export const preloadClips = (urls: string[]) => {
  for (const url of urls) {
    if (requested.has(url)) continue;
    requested.add(url);
    fetch(url)
      .then((response) =>
        response.ok ? response.blob() : Promise.reject(new Error(String(response.status)))
      )
      .then((blob) => ready.set(url, URL.createObjectURL(blob)))
      // Offline or blocked: the video falls back to streaming the file.
      .catch(() => ready.set(url, url))
      .finally(notify);
  }
};

export const clipUrl = (url: string) => ready.get(url);

export const clipsProgress = () => (requested.size ? ready.size / requested.size : 0);

export const subscribeClips = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const clipsVersion = () => version;
