const SESSION_KEY = "carebridge.portal.session";

function browserStorage() {
  try {
    return globalThis?.localStorage || null;
  } catch {
    return null;
  }
}

function safeUser(user) {
  if (!user) return null;
  const { password, passwordHash, ...publicUser } = user;
  return publicUser;
}

export function saveSession(user, token = "") {
  const storage = browserStorage();
  if (!storage || !user) return;

  storage.setItem(
    SESSION_KEY,
    JSON.stringify({
      user: safeUser(user),
      token,
      savedAt: new Date().toISOString()
    })
  );
}

export function restoreSession() {
  const storage = browserStorage();
  if (!storage) return null;

  try {
    const session = JSON.parse(storage.getItem(SESSION_KEY) || "null");
    if (!session?.user) return null;
    return {
      user: session.user,
      token: session.token || ""
    };
  } catch {
    storage.removeItem(SESSION_KEY);
    return null;
  }
}

export function clearSession() {
  const storage = browserStorage();
  if (storage) storage.removeItem(SESSION_KEY);
}
