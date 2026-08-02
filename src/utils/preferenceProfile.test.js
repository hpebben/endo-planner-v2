import {
  PREFERENCE_PROFILE_STORAGE_KEY,
  clearPreferenceProfile,
  loadPreferenceProfile,
  savePreferenceProfile,
  snapshotPreferenceProfile,
} from './preferenceProfile';

describe('versioned local preference profile', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie = 'planner_local_prefs=; max-age=0; path=/';
  });

  test('stores structured preferences with schema and revision metadata', () => {
    const first = savePreferenceProfile({ wire: [{ value: { product: 'Wire A' } }] }, null, '1.6.167');
    const second = savePreferenceProfile(first.preferences, first, '1.6.167');

    expect(first).toMatchObject({ schemaVersion: 1, revision: 1, applicationVersion: '1.6.167' });
    expect(second).toMatchObject({ profileId: first.profileId, revision: 2 });
    expect(loadPreferenceProfile('1.6.167')).toEqual(second);
  });

  test('creates a case-safe snapshot without coupling the case to mutable storage', () => {
    const profile = savePreferenceProfile({ sheath: [{ value: { frSize: '6 Fr' } }] }, null, '1.6.167');
    const snapshot = snapshotPreferenceProfile(profile);
    expect(snapshot).toMatchObject({
      profileId: profile.profileId,
      schemaVersion: 1,
      revision: 1,
      preferences: profile.preferences,
    });
    expect(snapshot.appliedAt).toBeTruthy();
  });

  test('clears the active local profile', () => {
    savePreferenceProfile({ wire: [] }, null, '1.6.167');
    clearPreferenceProfile();
    expect(window.localStorage.getItem(PREFERENCE_PROFILE_STORAGE_KEY)).toBeNull();
  });

  test('migrates the legacy preference cookie once and removes it', () => {
    const legacy = { sheath: [{ value: { frSize: '5 Fr', length: '12 cm' } }] };
    document.cookie = `planner_local_prefs=${encodeURIComponent(JSON.stringify(legacy))}; path=/`;

    const migrated = loadPreferenceProfile('1.6.167');

    expect(migrated).toMatchObject({ schemaVersion: 1, revision: 1, preferences: legacy });
    expect(window.localStorage.getItem(PREFERENCE_PROFILE_STORAGE_KEY)).toBeTruthy();
    expect(document.cookie).not.toContain('planner_local_prefs=');
  });
});
