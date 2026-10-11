import './StudentScreen.css'

// Presentation only: existing pages retain their own navigation and handlers.
export default function StudentScreen({ children, page, enabled = true }) {
    if (!enabled) return <>{children}</>

    return <div className={`edu-student-screen student-${page}`}>{children}</div>
}
