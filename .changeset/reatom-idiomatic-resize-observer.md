---
"create-karkas": patch
---

Make `withResizeObserver` idiomatic Reatom: expose plain `Size` state (`{ width, height }`) instead of the live `ResizeObserverEntry` platform object, keep state serializable, and rename the derived atom from `sizeEntry` to `size`.
