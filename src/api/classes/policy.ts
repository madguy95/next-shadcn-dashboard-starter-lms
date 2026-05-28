import type { ClassLifecycleAction, ClassLifecycleStatus, ClassRow, ClassStatus } from './types';

// Field identifiers — keep in sync with BE ClassLifecyclePolicy.F_*.
export type ClassEditableField =
  | 'label'
  | 'description'
  | 'cover'
  | 'courseId'
  | 'teacherId'
  | 'location'
  | 'room'
  | 'capacity'
  | 'daySchedules'
  | 'startDate'
  | 'endDate'
  | 'visibility';

const ONGOING_EDITABLE: ReadonlySet<ClassEditableField> = new Set([
  'description',
  'cover',
  'teacherId',
  'location',
  'room',
  'visibility',
  'endDate'
]);

const PUBLISHED_HAS_ENROLL_EDITABLE: ReadonlySet<ClassEditableField> = new Set([
  'description',
  'cover',
  'teacherId',
  'location',
  'room',
  'capacity',
  'daySchedules',
  'startDate',
  'endDate',
  'visibility'
]);

/**
 * Client-side mirror of BE ClassLifecyclePolicy.canEdit. The BE is the source
 * of truth (it 409s on illegal writes), this only drives UI affordances —
 * graying out a field, hiding a button — so the user gets immediate feedback.
 *
 * Important: derive both `lifecycleStatus` and dates from the same `ClassRow`
 * the server returned. Don't recompute display status here; the BE already
 * provides `cls.status` for that.
 */
export function canEditClassField(field: ClassEditableField, cls: ClassRow): boolean {
  const life = cls.lifecycleStatus;

  if (life === 'cancelled') return false;
  if (life === 'draft') return true;

  // Derived status drives the rest of the matrix.
  if (cls.status === 'completed') return field === 'visibility';
  if (cls.status === 'ongoing') return ONGOING_EDITABLE.has(field);

  const hasEnroll = (cls.enrolled ?? 0) > 0;

  // UNPUBLISHED behaves like DRAFT when no enrolment exists — admin still has
  // a clean slate to fix mistakes before re-publishing. If students were
  // enrolled before unpublishing, treat the same as PUBLISHED+hasEnroll.
  if (life === 'unpublished' && !hasEnroll) return true;

  return hasEnroll ? PUBLISHED_HAS_ENROLL_EDITABLE.has(field) : true;
}

/** Which lifecycle actions are legal from this state? Mirrors BE resolveTransition. */
export function availableLifecycleActions(cls: ClassRow): ClassLifecycleAction[] {
  const life = cls.lifecycleStatus;
  const display = cls.status;
  const actions: ClassLifecycleAction[] = [];

  if (life === 'draft') {
    actions.push('publish', 'cancel');
  } else if (life === 'published') {
    if (display !== 'ongoing' && display !== 'completed') actions.push('unpublish');
    if (display !== 'completed') actions.push('cancel');
  } else if (life === 'unpublished') {
    if (display !== 'completed') actions.push('publish');
    actions.push('cancel');
  }
  // cancelled is terminal
  return actions;
}

/** Human-readable rationale why a field is locked — useful for tooltips. */
export function lockReason(
  field: ClassEditableField,
  cls: ClassRow
): 'completed' | 'cancelled' | 'ongoing' | 'hasEnrollments' | null {
  if (canEditClassField(field, cls)) return null;
  if (cls.lifecycleStatus === 'cancelled') return 'cancelled';
  if (cls.status === 'completed') return 'completed';
  if (cls.status === 'ongoing') return 'ongoing';
  return 'hasEnrollments';
}

// Re-export the source types so consumers can `import from '@/api/classes/policy'`.
export type { ClassLifecycleAction, ClassLifecycleStatus, ClassRow, ClassStatus };
