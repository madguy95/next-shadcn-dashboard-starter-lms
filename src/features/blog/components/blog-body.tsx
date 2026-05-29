// Render Tiptap-generated HTML using the shared `.blog-prose` typography.
//
// Sanitization note: posts are authored by admins only (enforced server-side in
// the page guards + service.ts). Once a real backend replaces the in-memory mock,
// HTML should be sanitized server-side on write (e.g. DOMPurify / a server-side
// HTML sanitizer) so we trust the stored value here at render time.

export function BlogBody({ body }: { body: string }) {
  return (
    <div
      className='blog-prose'
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
