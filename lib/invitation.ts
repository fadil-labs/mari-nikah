export function generateInvitationSlug(groomName: string, brideName: string): string {
  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const groom = slugify(groomName);
  const bride = slugify(brideName);

  const base = `${groom}-${bride}`;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);

  return `${base}-${randomSuffix}`;
}
