export const defaultProfile = {
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    profileImage: '',
}

export const getStoredProfile = () => {
    try {
        const savedProfile = localStorage.getItem('user_profile')
        const savedUser = localStorage.getItem('user')
        const saved = JSON.parse(savedProfile || savedUser || '{}')
        return { ...defaultProfile, ...saved }
    } catch {
        return defaultProfile
    }
}

export const saveStoredProfile = (profile) => {
    const next = { ...defaultProfile, ...profile }
    localStorage.setItem('user_profile', JSON.stringify(next))
    window.dispatchEvent(new Event('profile:updated'))
    return next
}

export const getProfileInitials = (profile) => {
    const firstInitial = profile.firstName?.[0] || ''
    const lastInitial = profile.lastName?.[0] || ''
    return `${firstInitial}${lastInitial}`.toUpperCase() || 'U'
}
