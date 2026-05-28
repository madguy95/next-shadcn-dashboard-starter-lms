import { redirect } from 'next/navigation';

// /parent/enrollment was moved to /courses (role-aware: public, admin, teacher, parent).
// Keep this redirect so old bookmarks / external links still land in the right place.
type SearchParams = Record<string, string | string[] | undefined>;

export default async function ParentEnrollmentRedirect({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') qs.set(key, value);
    else if (Array.isArray(value)) value.forEach((v) => qs.append(key, v));
  }
  const target = qs.toString() ? `/courses?${qs}` : '/courses';
  redirect(target);
}
