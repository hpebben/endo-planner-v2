export const PREFERENCE_PROFILE_STORAGE_KEY = 'endoplanner.preferenceProfile';
export const PREFERENCE_PROFILE_SCHEMA_VERSION = 1;
export const LEGACY_PREFERENCE_COOKIE = 'planner_local_prefs';

const now = () => new Date().toISOString();

const createId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `profile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const getStorage = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage || null;
};

const readCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const clearLegacyCookie = () => {
  if (typeof document === 'undefined') return;
  document.cookie = `${LEGACY_PREFERENCE_COOKIE}=; max-age=0; path=/; SameSite=Lax`;
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const hostname = window.location.hostname;
    document.cookie = `${LEGACY_PREFERENCE_COOKIE}=; max-age=0; path=/; domain=${hostname}; SameSite=Lax`;
    document.cookie = `${LEGACY_PREFERENCE_COOKIE}=; max-age=0; path=/; domain=.${hostname}; SameSite=Lax`;
  }
};

const isValidProfile = (value) => Boolean(
  value &&
  value.schemaVersion === PREFERENCE_PROFILE_SCHEMA_VERSION &&
  typeof value.profileId === 'string' &&
  Number.isInteger(value.revision) &&
  value.preferences &&
  typeof value.preferences === 'object' &&
  !Array.isArray(value.preferences),
);

const persist = (profile) => {
  const storage = getStorage();
  if (storage) storage.setItem(PREFERENCE_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  return profile;
};

export const savePreferenceProfile = (
  preferences,
  existingProfile = null,
  applicationVersion = '',
) => {
  const timestamp = now();
  const profile = {
    schemaVersion: PREFERENCE_PROFILE_SCHEMA_VERSION,
    profileId: existingProfile?.profileId || createId(),
    revision: (existingProfile?.revision || 0) + 1,
    name: existingProfile?.name || 'Local setup',
    applicationVersion,
    createdAt: existingProfile?.createdAt || timestamp,
    updatedAt: timestamp,
    preferences,
  };
  return persist(profile);
};

export const loadPreferenceProfile = (applicationVersion = '') => {
  const storage = getStorage();
  const saved = storage?.getItem(PREFERENCE_PROFILE_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (isValidProfile(parsed)) return parsed;
    } catch (error) {
      // Corrupt profiles are discarded below and do not affect the case draft.
    }
    storage?.removeItem(PREFERENCE_PROFILE_STORAGE_KEY);
  }

  const legacy = readCookie(LEGACY_PREFERENCE_COOKIE);
  if (!legacy) return null;

  try {
    const preferences = JSON.parse(legacy);
    if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences)) {
      clearLegacyCookie();
      return null;
    }
    const migrated = savePreferenceProfile(preferences, null, applicationVersion);
    clearLegacyCookie();
    return migrated;
  } catch (error) {
    clearLegacyCookie();
    return null;
  }
};

export const clearPreferenceProfile = () => {
  getStorage()?.removeItem(PREFERENCE_PROFILE_STORAGE_KEY);
  clearLegacyCookie();
};

export const snapshotPreferenceProfile = (profile) => {
  if (!isValidProfile(profile)) return null;
  return {
    profileId: profile.profileId,
    schemaVersion: profile.schemaVersion,
    revision: profile.revision,
    applicationVersion: profile.applicationVersion,
    appliedAt: now(),
    preferences: profile.preferences,
  };
};

export { isValidProfile };
