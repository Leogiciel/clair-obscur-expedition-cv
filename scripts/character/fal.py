"""Minimal fal.ai queue client: local files are sent as data URIs, results are downloaded next to the request.
Reads FAL_KEY from .env.local. Usage from other scripts: `run(model, args, out_dir, name)`.
"""
import base64
import json
import mimetypes
import os
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def key():
    if 'FAL_KEY' in os.environ:
        return os.environ['FAL_KEY']
    for line in (ROOT / '.env.local').read_text().splitlines():
        if line.startswith('FAL_KEY='):
            return line.split('=', 1)[1].strip()
    raise SystemExit('FAL_KEY missing from .env.local')


def data_uri(path):
    mime = mimetypes.guess_type(str(path))[0] or 'application/octet-stream'
    return f'data:{mime};base64,' + base64.b64encode(Path(path).read_bytes()).decode()


def call(method, url, body=None, attempts=4):
    data = json.dumps(body).encode() if body is not None else None
    for attempt in range(attempts):
        req = urllib.request.Request(url, method=method, data=data,
                                     headers={'Authorization': f'Key {key()}', 'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            raise RuntimeError(f'{e.code} {url}: {e.read().decode()[:800]}') from None
        except (urllib.error.URLError, TimeoutError):
            if attempt == attempts - 1:
                raise
            time.sleep(2 ** attempt * 3)


def media_urls(result):
    """Every downloadable URL in a result, whatever the model's output shape."""
    found = []
    def walk(v):
        if isinstance(v, dict):
            if isinstance(v.get('url'), str) and v['url'].startswith('http'):
                found.append(v['url'])
            for x in v.values():
                walk(x)
        elif isinstance(v, list):
            for x in v:
                walk(x)
    walk(result)
    return found


def run(model, args, out_dir, name, poll=5):
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    job = call('POST', f'https://queue.fal.run/{model}', args)
    started = time.time()
    while True:
        status = call('GET', job['status_url'])
        if status['status'] == 'COMPLETED':
            break
        if status['status'] not in ('IN_QUEUE', 'IN_PROGRESS'):
            raise RuntimeError(f'{model}: {status}')
        time.sleep(poll)
    result = call('GET', job['response_url'])
    def shorten(v):
        if isinstance(v, str) and v.startswith('data:'):
            return v[:40] + '…'
        if isinstance(v, list):
            return [shorten(x) for x in v]
        return v
    logged = {k: shorten(v) for k, v in args.items()}
    (out_dir / f'{name}.json').write_text(json.dumps({'model': model, 'args': logged, 'result': result,
                                                     'seconds': round(time.time() - started)}, indent=2))
    files = []
    for i, url in enumerate(media_urls(result)):
        ext = Path(url.split('?')[0]).suffix or '.bin'
        dest = out_dir / f'{name}{"" if i == 0 else f"-{i}"}{ext}'
        urllib.request.urlretrieve(url, dest)
        files.append(dest)
    return files
