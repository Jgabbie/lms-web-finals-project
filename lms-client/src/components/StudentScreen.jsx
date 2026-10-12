import './StudentScreen.css'
import './RoleScreen.css'

// Presentation only: existing pages retain their own navigation and handlers.
export default function StudentScreen({ children, page, enabled = true, role = 'student' }) {
    if (!enabled) return <>{children}</>

    return <div className={`edu-student-screen student-${page} edu-role-${role}`}>{children}</div>
}
