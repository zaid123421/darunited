export function resolveNotificationHref(page: string | null): string | null {
  if (!page) {
    return null;
  }

  if (page.startsWith("/dashboard")) {
    return page;
  }

  if (page.startsWith("/contact-messages/")) {
    const id = page.slice("/contact-messages/".length);
    return id ? `/dashboard/messages/${id}` : null;
  }

  if (page.startsWith("/")) {
    return `/dashboard${page}`;
  }

  return `/dashboard/${page}`;
}
