import { useState, useCallback } from 'react'
import type { Profile } from '../lib/profiles'
import {
  loadProfiles,
  saveProfile,
  getLastActiveProfileId,
  validateProfileName,
  createProfileId,
} from '../lib/profiles'
import { migrateLegacyProgress } from '../lib/mapProgress'
import './ProfileScreen.css'

const AVATARS = ['🦉', '🦊', '🐰', '🐻']
const MAX_PROFILES = 4

interface ProfileScreenProps {
  onSelectProfile: (profile: Profile) => void
}

function initProfiles(): Profile[] {
  const existing = loadProfiles()
  if (existing.length > 0) return existing

  // Legacy migration: if no profiles but legacy progress exists, create "Player 1"
  const legacyKey = 'math-practice:map-progress'
  if (localStorage.getItem(legacyKey)) {
    const now = new Date().toISOString()
    const player1: Profile = {
      id: createProfileId(),
      name: 'Player 1',
      avatarId: 0,
      createdAt: now,
      lastPlayedAt: now,
    }
    saveProfile(player1)
    migrateLegacyProgress(player1.id)
    return [player1]
  }

  return []
}

export function ProfileScreen({ onSelectProfile }: ProfileScreenProps) {
  const [profiles, setProfiles] = useState<Profile[]>(initProfiles)
  const [lastActiveId] = useState<string | null>(getLastActiveProfileId)
  const [creating, setCreating] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [resetTarget, setResetTarget] = useState<Profile | null>(null)

  const handleSelectProfile = useCallback((profile: Profile) => {
    const updated: Profile = { ...profile, lastPlayedAt: new Date().toISOString() }
    saveProfile(updated)
    onSelectProfile(updated)
  }, [onSelectProfile])

  const handleStartCreation = useCallback(() => {
    setCreating(true)
    setSelectedAvatar(null)
    setNameInput('')
    setNameError(null)
  }, [])

  const handleCancelCreation = useCallback(() => {
    setCreating(false)
  }, [])

  const handleSelectAvatar = useCallback((avatarId: number) => {
    setSelectedAvatar(avatarId)
    setNameError(null)
  }, [])

  const handleCreateProfile = useCallback(() => {
    if (selectedAvatar === null) return

    const error = validateProfileName(nameInput)
    if (error) {
      setNameError(error)
      return
    }

    const now = new Date().toISOString()
    const profile: Profile = {
      id: createProfileId(),
      name: nameInput.trim(),
      avatarId: selectedAvatar,
      createdAt: now,
      lastPlayedAt: now,
    }
    saveProfile(profile)
    setProfiles(loadProfiles())
    setCreating(false)
    onSelectProfile(profile)
  }, [selectedAvatar, nameInput, onSelectProfile])

  const handleResetRequest = useCallback((e: React.MouseEvent, profile: Profile) => {
    e.stopPropagation()
    setResetTarget(profile)
  }, [])

  const handleResetConfirm = useCallback(() => {
    if (!resetTarget) return
    // Clear map progress for this profile — handled by App via localStorage
    const key = `math-practice:map-progress:${resetTarget.id}`
    localStorage.removeItem(key)
    setResetTarget(null)
    // Force re-render of profiles
    setProfiles(loadProfiles())
  }, [resetTarget])

  const handleResetCancel = useCallback(() => {
    setResetTarget(null)
  }, [])

  const canCreateNew = profiles.length < MAX_PROFILES

  return (
    <div className="profile-screen">
      <h1 className="profile-title">Choose Your Adventurer</h1>
      <p className="profile-subtitle">Who&apos;s exploring today?</p>

      {profiles.length > 0 && (
        <div className="profile-cards">
          {profiles.map(profile => (
            <div
              key={profile.id}
              className={`profile-card${profile.id === lastActiveId ? ' last-played' : ''}`}
              onClick={() => handleSelectProfile(profile)}
            >
              {profile.id === lastActiveId && (
                <span className="last-played-badge">Last played</span>
              )}
              <div className="profile-avatar">{AVATARS[profile.avatarId]}</div>
              <div className="profile-name">{profile.name}</div>
              <div className="profile-card-actions">
                <button
                  className="reset-button"
                  onClick={(e) => handleResetRequest(e, profile)}
                >
                  Reset
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!creating && (
        <button
          className="new-adventurer-button"
          onClick={handleStartCreation}
          disabled={!canCreateNew}
        >
          {canCreateNew ? '✨ New Adventurer' : 'All adventurers chosen!'}
        </button>
      )}

      {creating && (
        <div className="creation-panel">
          <h2 className="creation-title">Pick Your Animal</h2>
          <div className="avatar-picker">
            {AVATARS.map((emoji, idx) => (
              <button
                key={idx}
                className={`avatar-option${selectedAvatar === idx ? ' selected' : ''}`}
                onClick={() => handleSelectAvatar(idx)}
              >
                {emoji}
              </button>
            ))}
          </div>

          {selectedAvatar !== null && (
            <>
              <div className="name-input-group">
                <input
                  className={`name-input${nameError ? ' invalid' : ''}`}
                  type="text"
                  placeholder="Your name"
                  value={nameInput}
                  onChange={e => {
                    setNameInput(e.target.value)
                    setNameError(null)
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreateProfile()
                  }}
                  maxLength={12}
                  autoFocus
                />
                <button
                  className="go-button"
                  onClick={handleCreateProfile}
                >
                  Go!
                </button>
              </div>
              {nameError && <div className="validation-error">{nameError}</div>}
            </>
          )}

          <button className="cancel-button" onClick={handleCancelCreation}>
            Cancel
          </button>
        </div>
      )}

      {resetTarget && (
        <div className="confirm-overlay" onClick={handleResetCancel}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="confirm-avatar">{AVATARS[resetTarget.avatarId]}</div>
            <p className="confirm-message">
              Reset {resetTarget.name}&apos;s adventure?
            </p>
            <p className="confirm-warning">
              All stars and progress will be lost!
            </p>
            <div className="confirm-actions">
              <button className="confirm-reset" onClick={handleResetConfirm}>
                Reset
              </button>
              <button className="confirm-cancel" onClick={handleResetCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
