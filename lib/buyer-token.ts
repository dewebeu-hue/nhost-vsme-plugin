export function extractSupplierToken(input: string) {
  const value = input.trim();

  if (!value) {
    return null;
  }

  const fromPath = (pathname: string) => {
    const segments = pathname.split("/").filter(Boolean);
    const passportIndex = segments.indexOf("passport");
    const suppliersIndex = segments.indexOf("suppliers");
    const token =
      passportIndex >= 0
        ? segments[passportIndex + 1]
        : suppliersIndex >= 0
          ? segments[suppliersIndex + 1]
          : null;

    return token ? normalizeSupplierToken(token) : null;
  };

  try {
    const url = new URL(value);
    const token = fromPath(url.pathname);
    if (token) {
      return token;
    }
  } catch {
    if (value.startsWith("/")) {
      try {
        const url = new URL(value, "https://supplier-passport.local");
        const token = fromPath(url.pathname);
        if (token) {
          return token;
        }
      } catch {
        return null;
      }
    }
  }

  return normalizeSupplierToken(value);
}

export function normalizeSupplierToken(token: string) {
  try {
    const trimmed = decodeURIComponent(token).trim();

    if (!/^[A-Za-z0-9._~-]{4,512}$/.test(trimmed)) {
      return null;
    }

    return trimmed;
  } catch {
    return null;
  }
}
