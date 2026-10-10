import './App.css'
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom"
import { useEffect, useState } from 'react'



import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage'
import ResetPassword from './pages/ResetPassword'
import NotificationsPage from './pages/NotificationsPage'

import LandingPage from './pages/student/LandingPage'
import HomePage from './pages/student/HomePage'
import DashboardStudent from './pages/student/DashboardStudent'
import AssignmentPage from './pages/student/AssignmentPage'
import AssignmentDetailsPage from './pages/student/AssignmentDetailsPage'
import CoursePage from './pages/student/CoursePage'
import CourseDetailsPage from './pages/student/CourseDetailsPage'
import DiscussionPage from './pages/student/DiscussionPage'
import LearningMaterialsPage from './pages/student/LearningMaterialsPage'

import Dashboard from './pages/admin/Dashboard'
import ActivityLogs from './pages/admin/ActivityLogs'
import UserManagementPage from './pages/admin/UserManagementPage'
import InstructorManagement from './pages/admin/InstructorManagement'
import CoursesManagementPage from './pages/admin/CoursesManagementPage'
import StudentManagement from './pages/admin/StudentManagement'

import InstructorAssignmentsPage from './pages/instructor/InstructorAssignmentsPage'
import DashboardInstructor from './pages/instructor/DashboardInstructor'
import EnrollStudentPage from './pages/instructor/EnrollStudentPage'

import CourseManagementPage from './pages/instructor/CourseManagementPage'
import CreateCoursePage from './pages/instructor/CreateCoursePage'
import UploadMaterialsPage from './pages/instructor/UploadMaterialsPage'
import StudentManagementPage from './pages/instructor/StudentManagementPage'




const ALL_ROLES = ['admin', 'instructor', 'student']

const getHomeRoute = (role) => {
  const routes = {
    admin: '/admin/dashboard',
    instructor: '/instructor/dashboard',
    student: '/student/dashboard'
  }

  return routes[role] || '/login'
}

function ProtectedRoute({ role, allowedRoles }) {
  const location = useLocation()

  if (!role) {
    return (
      <Navigate
        to='/login'
        replace
        state={{ from: location }}
      />
    )
  }

  if (!allowedRoles.includes(role)) {
    return (
      <Navigate
        to={getHomeRoute(role)}
        replace
      />
    )
  }

  return <Outlet />
}

function App() {
  const [role, setRole] = useState(() => {
    const savedRole = localStorage.getItem('role')?.toLowerCase()

    return ALL_ROLES.includes(savedRole)
      ? savedRole
      : null
  })

  useEffect(() => {
    const handleLogout = () => setRole(null)
    window.addEventListener('auth:logout', handleLogout)

    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [])

  const handleLogin = (userRole) => {
    const normalizedRole = String(userRole || '').toLowerCase()

    if (!ALL_ROLES.includes(normalizedRole)) {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      setRole(null)
      return
    }

    localStorage.setItem('role', normalizedRole)
    setRole(normalizedRole)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/home' element={<HomePage />} />

        <Route
          path='/login'
          element={
            role
              ? <Navigate to={getHomeRoute(role)} replace />
              : <LoginPage onLogin={handleLogin} />
          }
        />

        <Route
          path='/signup'
          element={
            role
              ? <Navigate to={getHomeRoute(role)} replace />
              : <SignupPage />
          }
        />

        <Route path='/reset' element={<ResetPassword />} />

        <Route
          element={
            <ProtectedRoute
              role={role}
              allowedRoles={['admin']}
            />
          }
        >
          <Route path='/admin/profile' element={<ProfilePage />} />
          <Route path='/admin/dashboard' element={<Dashboard />} />
          <Route path='/admin/users' element={<UserManagementPage />} />
          <Route path='/admin/instructors' element={<InstructorManagement />} />
          <Route path='/admin/logs' element={<ActivityLogs />} />
          <Route path='/admin/courses' element={<CoursesManagementPage />} />
          <Route path='/admin/students' element={<StudentManagement />} />
        </Route>

        <Route
          element={
            <ProtectedRoute
              role={role}
              allowedRoles={['instructor']}
            />
          }
        >
          <Route path='/instructor/dashboard' element={<DashboardInstructor role={role} />} />
          <Route path='/instructor/courses' element={<CourseManagementPage />} />
          <Route path='/instructor/courses/create' element={<CreateCoursePage />} />
          <Route path='/instructor/materials' element={<UploadMaterialsPage />} />
          <Route path='/instructor/students' element={<StudentManagementPage />} />
          <Route path='/instructor/enroll' element={<EnrollStudentPage />} />
          <Route path='/instructor/assignments' element={<InstructorAssignmentsPage />} />

        </Route>

        <Route
          element={
            <ProtectedRoute
              role={role}
              allowedRoles={['student']}
            />
          }
        >
          <Route path='/student/dashboard' element={<DashboardStudent role={role} />} />
          <Route path='/student/home' element={<HomePage />} />
          <Route path='/student/courses' element={<CoursePage role={role} />} />
          <Route path='/student/assignments' element={<AssignmentPage role={role} />} />
          <Route path='/student/materials' element={<LearningMaterialsPage />} />
          <Route path='/student/courses/details' element={<CourseDetailsPage role={role} />} />
          <Route path='/student/assignments/details' element={<AssignmentDetailsPage role={role} />} />
          <Route path='/student/discussions' element={<DiscussionPage role={role} />} />
        </Route>

        <Route
          element={
            <ProtectedRoute
              role={role}
              allowedRoles={['admin', 'instructor']}
            />
          }
        >
          <Route path='/enroll' element={<EnrollStudentPage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute
              role={role}
              allowedRoles={ALL_ROLES}
            />
          }
        >
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='/settings' element={<ProfilePage />} />
          <Route path='/coursedetails' element={<CourseDetailsPage role={role} />} />
          <Route path='/assigndetails' element={<AssignmentDetailsPage role={role} />} />
          <Route path='/discussion' element={<DiscussionPage role={role} />} />
          <Route path='/notifications' element={<NotificationsPage />} />
        </Route>

        <Route
          path='*'
          element={
            <Navigate
              to={getHomeRoute(role)}
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App
