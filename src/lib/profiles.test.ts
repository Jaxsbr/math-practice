import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadProfiles,
  saveProfile,
  deleteProfile,
  getLastActiveProfileId,
  validateProfileName,
  createProfileId,
} from './profiles'
import type { Profile } from './profiles'

describe('profiles', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  function makeProfile(overrides: Partial<Profile> = {}): Profile {
    return {
      id: overrides.id ?? createProfileId(),
      name: overrides.name ?? 'Luna',
      avatarId: overrides.avatarId ?? 0,
      createdAt: overrides.createdAt ?? '2026-01-01T00:00:00Z',
      lastPlayedAt: overrides.lastPlayedAt ?? '2026-01-01T00:00:00Z',
    }
  }

  describe('loadProfiles', () => {
    it('returns empty array when no profiles exist', () => {
      expect(loadProfiles()).toEqual([])
    })

    it('returns saved profiles', () => {
      const p = makeProfile({ name: 'Fox' })
      saveProfile(p)
      const loaded = loadProfiles()
      expect(loaded).toHaveLength(1)
      expect(loaded[0].name).toBe('Fox')
    })

    it('handles corrupted localStorage gracefully', () => {
      localStorage.setItem('math-practice:profiles', 'not-json')
      expect(loadProfiles()).toEqual([])
    })
  })

  describe('saveProfile', () => {
    it('creates a new profile', () => {
      const p = makeProfile()
      saveProfile(p)
      expect(loadProfiles()).toHaveLength(1)
    })

    it('updates an existing profile by id', () => {
      const p = makeProfile({ name: 'Luna' })
      saveProfile(p)
      saveProfile({ ...p, name: 'Luna Updated' })
      const profiles = loadProfiles()
      expect(profiles).toHaveLength(1)
      expect(profiles[0].name).toBe('Luna Updated')
    })

    it('stores multiple profiles', () => {
      saveProfile(makeProfile({ id: 'a', name: 'Owl' }))
      saveProfile(makeProfile({ id: 'b', name: 'Fox' }))
      saveProfile(makeProfile({ id: 'c', name: 'Bunny' }))
      expect(loadProfiles()).toHaveLength(3)
    })
  })

  describe('deleteProfile', () => {
    it('removes a profile by id', () => {
      const p = makeProfile({ id: 'del-me' })
      saveProfile(p)
      deleteProfile('del-me')
      expect(loadProfiles()).toHaveLength(0)
    })

    it('does not affect other profiles', () => {
      saveProfile(makeProfile({ id: 'keep', name: 'Keep' }))
      saveProfile(makeProfile({ id: 'remove', name: 'Remove' }))
      deleteProfile('remove')
      const profiles = loadProfiles()
      expect(profiles).toHaveLength(1)
      expect(profiles[0].name).toBe('Keep')
    })
  })

  describe('getLastActiveProfileId', () => {
    it('returns null when no profiles exist', () => {
      expect(getLastActiveProfileId()).toBeNull()
    })

    it('returns the most recently played profile id', () => {
      saveProfile(makeProfile({ id: 'old', lastPlayedAt: '2026-01-01T00:00:00Z' }))
      saveProfile(makeProfile({ id: 'new', lastPlayedAt: '2026-02-01T00:00:00Z' }))
      expect(getLastActiveProfileId()).toBe('new')
    })
  })

  describe('validateProfileName', () => {
    it('rejects empty name', () => {
      expect(validateProfileName('')).toBe('Name cannot be empty')
    })

    it('rejects whitespace-only name', () => {
      expect(validateProfileName('   ')).toBe('Name cannot be empty')
    })

    it('rejects name longer than 12 characters', () => {
      expect(validateProfileName('ThisNameIsTooLong')).toBe('Name must be 12 characters or less')
    })

    it('accepts valid name', () => {
      expect(validateProfileName('Luna')).toBeNull()
    })

    it('accepts name at max length (12 chars)', () => {
      expect(validateProfileName('TwelveChars!')).toBeNull()
    })
  })

  describe('createProfileId', () => {
    it('returns a string', () => {
      expect(typeof createProfileId()).toBe('string')
    })

    it('returns unique ids', () => {
      const ids = new Set(Array.from({ length: 10 }, () => createProfileId()))
      expect(ids.size).toBe(10)
    })
  })
})
