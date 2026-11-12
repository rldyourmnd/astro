---
'create-astro': patch
---

Fixes the generated `package.json` name for projects created in a nested or absolute directory (e.g. `apps/web` or `/tmp/my-site`), so it uses the last path segment instead of joining the whole path with dashes.
