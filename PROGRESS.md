## Class detail — session dates không khớp lịch lớp

**Problem:** V23 seed dùng `CURRENT_DATE ± N×7` thay vì `class_day_schedules`, khiến session date rơi sai thứ, time_label hardcode "18:00–19:00", day_label thiếu prefix "T2/T3/…".

**Solution:**
- V24 migration: xóa sessions sai, tái tạo từ `class_day_schedules` (đúng thứ, đúng giờ, đúng day_label "T2 · dd/MM/yyyy · HH:mm–HH:mm")
- `SessionGeneratorService`: sinh sessions cho lớp mới tạo qua API
- `ClassServiceImpl.createClass()`: gọi `generateSessions()` sau khi save

---

## Pagination bar — button width + page size select

**Problem:** Prev/next buttons used `h-7 w-7` to override `size-9` from `buttonVariants`; tailwind-merge can't resolve the conflict in Tailwind 4, causing incorrect button dimensions.

**Solution:**
- Changed override to `size-7` (same utility group as `size-9` — tailwind-merge resolves correctly)
- Added `PaginationPageSize` component to `pagination.tsx`, exported alongside other `Pagination*` components
- Both `classes-view` and `enrollments-view` now use `PaginationPageSize` from `@/components/ui/pagination`

---

## CourseView — pagination

**Problem:** Admin course list loaded all records at once (`page=1&size=100` hardcoded), no UI to page through results.

**Solution:**
- Added `page`/`size` to `CourseListParams`; `buildListQuery` now reads them instead of hardcoding
- `courses-view` uses nuqs `page`/`perPage` URL state (defaults: 1 / 10); resets to page 1 on tool/search change
- Pagination bar (Page X of Y + page size select + Prev/Next) rendered below the card grid

---

## Enrollment screen — class filter bug

**Problem:** Class list in enrollment detail showed all open classes regardless of selected course.

**Solution:**
- Added `courseId` param to `ClassListRequest`, `ClassRepository.search()`, and `ClassServiceImpl`
- Added `courseId?` to `ClassListParams` and `buildListQuery` on FE
- `classesQuery` in `enrollments-view` now passes `selected?.requestedCourse?.id` as `courseId`
- FE also filters client-side: keep only `open` or `ongoing && enrolled < capacity`

---

## SSR → Client-side refactor (Admin + Teacher pages)

**Problem:** Hooks (`useState`, `useMemo`) were declared after an early `if (!data) return <Skeleton />`, violating React's Rules of Hooks.

**Fix:** Move all hooks before the early return; use optional chaining (`data?.classes ?? []`) in memos so they're safe when data is undefined.