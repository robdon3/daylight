#!/usr/bin/env python3
"""Give the next release a new number, in the four places that carry it. Run before every push that changes the app."""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def edit(name, pattern, make):
    path = os.path.join(ROOT, name)
    text = open(path, encoding='utf-8').read()
    new, n = re.subn(pattern, make, text)
    assert n, f'{name}: nothing matched {pattern}'
    open(path, 'w', encoding='utf-8').write(new)


v = int(re.search(r'const APP_V = (\d+);', open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read()).group(1)) + 1
edit('app.js', r'const APP_V = \d+;', f'const APP_V = {v};')
edit('index.html', r'(style\.css|app\.js)\?v=\d+', lambda m: f'{m.group(1)}?v={v}')
edit('sw.js', r"const CACHE = 'daylight-v\d+';", f"const CACHE = 'daylight-v{v}';")
edit('version.json', r'"v": \d+', f'"v": {v}')
print(f'Daylight is now version {v}')
