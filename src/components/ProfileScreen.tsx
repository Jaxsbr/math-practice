import { useState, useCallback } from 'react'
import type { Profile } from '../lib/profiles'
import {
  loadProfiles,
  saveProfile,
  deleteProfile,
  getLastActiveProfileId,
  validateProfileName,
  createProfileId,
} from '../lib/profiles'
import { migrateLegacyProgress, clearMapProgress } from '../lib/mapProgress'
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
  const [editTarget, setEditTarget] = useState<Profile | null>(null)
  const [editName, setEditName] = useState('')
  const [editAvatar, setEditAvatar] = useState<number>(0)
  const [editNameError, setEditNameError] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ type: 'reset' | 'delete'; profile: Profile } | null>(null)

  const reloadProfiles = useCallback(() => {
    setProfiles(loadProfiles())
  }, [])

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
    reloadProfiles()
    setCreating(false)
    onSelectProfile(profile)
  }, [selectedAvatar, nameInput, onSelectProfile, reloadProfiles])

  // Edit handlers
  const handleOpenEdit = useCallback((e: React.MouseEvent, profile: Profile) => {
    e.stopPropagation()
    setEditTarget(profile)
    setEditName(profile.name)
    setEditAvatar(profile.avatarId)
    setEditNameError(null)
  }, [])

  const handleCloseEdit = useCallback(() => {
    setEditTarget(null)
    setEditNameError(null)
  }, [])

  const handleSaveEdit = useCallback(() => {
    if (!editTarget) return
    const error = validateProfileName(editName)
    if (error) {
      setEditNameError(error)
      return
    }
    const updated: Profile = {
      ...editTarget,
      name: editName.trim(),
      avatarId: editAvatar,
    }
    saveProfile(updated)
    reloadProfiles()
    setEditTarget(null)
  }, [editTarget, editName, editAvatar, reloadProfiles])

  // Confirm action handlers (reset / delete)
  const handleConfirmAction = useCallback(() => {
    if (!confirmAction) return
    if (confirmAction.type === 'reset') {
      clearMapProgress(confirmAction.profile.id)
    } else {
      clearMapProgress(confirmAction.profile.id)
      deleteProfile(confirmAction.profile.id)
    }
    setConfirmAction(null)
    setEditTarget(null)
    reloadProfiles()
  }, [confirmAction, reloadProfiles])

  const handleCancelConfirm = useCallback(() => {
    setConfirmAction(null)
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
                  className="edit-button"
                  onClick={(e) => handleOpenEdit(e, profile)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!creating && !editTarget && (
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

      {editTarget && !confirmAction && (
        <div className="creation-panel">
          <h2 className="creation-title">Edit Adventurer</h2>
          <div className="avatar-picker">
            {AVATARS.map((emoji, idx) => (
              <button
                key={idx}
                className={`avatar-option${editAvatar === idx ? ' selected' : ''}`}
                onClick={() => { setEditAvatar(idx); setEditNameError(null) }}
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="name-input-group">
            <input
              className={`name-input${editNameError ? ' invalid' : ''}`}
              type="text"
              placeholder="Your name"
              value={editName}
              onChange={e => {
                setEditName(e.target.value)
                setEditNameError(null)
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSaveEdit()
              }}
              maxLength={12}
              autoFocus
            />
            <button className="go-button" onClick={handleSaveEdit}>
              Save
            </button>
          </div>
          {editNameError && <div className="validation-error">{editNameError}</div>}

          <div className="edit-danger-zone">
            <button
              className="edit-danger-button reset-danger"
              onClick={() => setConfirmAction({ type: 'reset', profile: editTarget })}
            >
              Reset Progress
            </button>
            <button
              className="edit-danger-button delete-danger"
              onClick={() => setConfirmAction({ type: 'delete', profile: editTarget })}
            >
              Delete Profile
            </button>
          </div>

          <button className="cancel-button" onClick={handleCloseEdit}>
            Cancel
          </button>
        </div>
      )}

      {confirmAction && (
        <div className="confirm-overlay" onClick={handleCancelConfirm}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="confirm-avatar">{AVATARS[confirmAction.profile.avatarId]}</div>
            {confirmAction.type === 'reset' ? (
              <>
                <p className="confirm-message">
                  Reset {confirmAction.profile.name}&apos;s adventure?
                </p>
                <p className="confirm-warning">
                  All stars and progress will be lost!
                </p>
              </>
            ) : (
              <>
                <p className="confirm-message">
                  Delete {confirmAction.profile.name}?
                </p>
                <p className="confirm-warning">
                  This adventurer and all their progress will be removed forever!
                </p>
              </>
            )}
            <div className="confirm-actions">
              <button className="confirm-reset" onClick={handleConfirmAction}>
                {confirmAction.type === 'reset' ? 'Reset' : 'Delete'}
              </button>
              <button className="confirm-cancel" onClick={handleCancelConfirm}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
