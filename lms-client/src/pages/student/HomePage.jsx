import Navbar from "../../components/Navbar"
import { Button, Card, CardContent, Typography, LinearProgress } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { getStoredProfile } from '../../utils/profileStorage'

export default function HomePage() {
    const profile = getStoredProfile()
    const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Student'
    const activeCourses = [
        { id: 1, title: "Introduction to React", progress: 75, nextLesson: "React Hooks" },
        { id: 2, title: "Advanced UI/UX Design", progress: 30, nextLesson: "Color Theory" },
        { id: 3, title: "Backend with Node.js", progress: 10, nextLesson: "Setting up Express" },
    ]

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <Typography variant="h4" className="font-bold text-slate-800 mb-2">
                                Welcome back, {displayName}!
                            </Typography>
                            <Typography variant="body2" className="text-slate-500 mb-6">
                                You are doing well in the course "Introduction to React", keep it up!
                            </Typography>
                            <Button variant="contained" size="large" startIcon={<PlayArrowIcon />} className="bg-blue-600 hover:bg-blue-700 normal-case shadow-none rounded-lg">
                                Resume Course
                            </Button>
                        </div>

                        <div className="hidden md:flex w-64 h-40 bg-blue-50 rounded-xl border-2 border-dashed border-blue-200 items-center justify-center text-blue-500 font-medium">
                            Image here
                        </div>
                    </div>

                    <div>
                        <Typography variant="h6" className="font-bold text-slate-800 mb-4">
                            Your Active Courses
                        </Typography>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                            {activeCourses.map((course) => (
                                <Card key={course.id} className="shadow-sm border border-slate-200 rounded-xl hover:shadow-md transition-shadow duration-200 cursor-pointer">
                                    <CardContent className="p-6">
                                        <Typography variant="h6" className="font-bold text-slate-800 mb-1">
                                            {course.title}
                                        </Typography>
                                        <Typography variant="caption" className="text-slate-500 mb-4">
                                            Next up: {course.nextLesson}
                                        </Typography>

                                        <div className="mb-2 flex justify-between text-sm">
                                            <span className="font-medium text-slate-700">Progress</span>
                                            <span className="text-blue-600 font-bold">{course.progress}%</span>
                                        </div>

                                        <LinearProgress variant="determinate" value={course.progress} className="h-2 rounded-full bg-slate-100 [&>span]:bg-blue-600" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}
