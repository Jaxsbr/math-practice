const PROFILES_KEY = 'math-practice:profiles'

export interface Profile {
  id: string
  name: string
  avatarId: number
  createdAt: string
  lastPlayedAt: string
}

export function loadProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    if (raw) return JSON.parse(raw) as Profile[]
  } catch { /* corrupted data — return default */ }
  return []
}

function saveProfiles(profiles: Profile[]): void {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}

export function saveProfile(profile: Profile): void {
  const profiles = loadProfiles()
  const idx = profiles.findIndex(p => p.id === profile.id)
  if (idx >= 0) {
    profiles[idx] = profile
  } else {
    profiles.push(profile)
  }
  saveProfiles(profiles)
}

export function deleteProfile(profileId: string): void {
  const profiles = loadProfiles().filter(p => p.id !== profileId)
  saveProfiles(profiles)
}

export function getLastActiveProfileId(): string | null {
  const profiles = loadProfiles()
  if (profiles.length === 0) return null
  const sorted = [...profiles].sort(
    (a, b) => new Date(b.lastPlayedAt).getTime() - new Date(a.lastPlayedAt).getTime(),
  )
  return sorted[0].id
}

export function validateProfileName(name: string): string | null {
  const trimmed = name.trim()
  if (trimmed.length === 0) return 'Name cannot be empty'
  if (trimmed.length > 12) return 'Name must be 12 characters or less'
  return null
}

export function createProfileId(): string {
  return crypto.randomUUID()
}
