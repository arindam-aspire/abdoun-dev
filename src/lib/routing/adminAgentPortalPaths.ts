/**
 * When an admin hits legacy agent URLs for listings / favourites / saved searches,
 * redirect them to the matching `admin-dashboard/*` routes.
 */
export function getAdminRedirectPathForLegacyAgentPortal(
  pathname: string,
  locale: string,
): string | null {
  const prefix = `/${locale}/`;
  if (!pathname.startsWith(prefix)) return null;
  const rest = pathname.slice(prefix.length);

  const listingsPrefix = "agent-dashboard/listings";
  if (rest === listingsPrefix || rest.startsWith(`${listingsPrefix}/`)) {
    const suffix = rest.slice(listingsPrefix.length);
    return `${prefix}admin-dashboard/listings${suffix}`;
  }

  const favPrefix = "agent-favourite-properties";
  if (rest === favPrefix || rest.startsWith(`${favPrefix}/`)) {
    const suffix = rest.slice(favPrefix.length);
    return `${prefix}admin-dashboard/favourite-properties${suffix}`;
  }

  const savedPrefix = "agent-saved-searches";
  if (rest === savedPrefix || rest.startsWith(`${savedPrefix}/`)) {
    const suffix = rest.slice(savedPrefix.length);
    return `${prefix}admin-dashboard/saved-searches${suffix}`;
  }

  return null;
}
