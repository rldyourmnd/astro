---
'astro': patch
---

Fixes the content layer data store staying in memory for the rest of `astro build` and after `astro sync`, so loaded collection entries can be garbage collected once content sync finishes
