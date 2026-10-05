import { AppBar, Toolbar, Typography, Button, Card, CardContent, TextField, Box } from '@mui/material'
import { School, MenuBook, Email, Phone, LocationOn } from '@mui/icons-material'
import LandingGraphics from '../../assets/graphics/undraw_education_3vwh.svg'
import { useNavigate } from "react-router-dom"

export default function LandingPage() {
    //initialize useNavigate
    const navigate = useNavigate()


    //temp courses data
    const courses = [
        {
            title: "Introduction to React",
            description: "Learn the fundamentals of React and build modern interactive web applications",
            level: "Beginner"
        },
        {
            title: "Advanced UI/UX Design",
            description: "Master modern interface design principles and create engaging user experiences",
            level: "Intermediate"
        },
        {
            title: "Backend with Node.js",
            description: "Build powerful server-side applications and APIs using Node.js and Express",
            level: "Intermediate"
        },
    ]


    //go to signup page
    const navigateSignup = () => {
        navigate("/login", { replace: true })
    }


    return (
        <div className='min-h-screen bg-slate-50 text-slate-800'>
            <AppBar position='sticky' elevation={0} className='bg-white border-b border-slate-200'>
                <Toolbar className='max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex items-center gap-2 flex-1'>
                        <School className='text-white-600' />
                        <Typography variant='h6' className='font-bold text-white-800'>
                            EduLearn
                        </Typography>
                    </div>

                    <div className='hidden md:flex items-center gap-8 mr-6'>
                        <a href='#about' className='text-white-800 hover:text-blue-600 transition-colors'>
                            About Us
                        </a>
                        <a href='#courses' className='text-white-800 hover:text-blue-600 transition-colors'>
                            Courses
                        </a>
                        <a href='#contact' className='text-white-800 hover:text-blue-600 transition-colors'>
                            Contact Us
                        </a>
                    </div>

                    <Button onClick={navigateSignup} variant='contained' className='bg-blue-600 hover:bg-blue-700 normal-case rounded-lg shadow-none'>
                        Get Started
                    </Button>
                </Toolbar>
            </AppBar>


            <section className='bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='min-h-[650px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20'>
                        <div>
                            <Typography variant='h1' className='!text-4xl sm:!text-5xl lg:!text-6xl !font-bold !leading-tight mb-6'>
                                Learn Today.
                                <br />
                                Build Tomorrow
                            </Typography>

                            <Typography variant='h6' className='!font-normal !leading-relaxed text-blue-100 max-w-xl mb-8'>
                                Develop the skills you need to succeed with practical, accessible, and engaging online courses designed for modern learners
                            </Typography>

                            <div className='flex flex-col sm:flex-row gap-4 mt-3'>
                                <Button variant="contained" size='large' href='#courses' className='bg-white hover:bg-slate-100 text-blue-700 normal-case font-semibold rounded-lg px-7 shadow-none'>
                                    Explore Courses
                                </Button>

                                <Button variant="outlined" size='large' href='#about' className='!border-white !text-white !hover:border-white !hover:bg-white/10 normal-case rounded-lg px-7'>
                                    Learn More
                                </Button>
                            </div>
                        </div>

                        <div className='hidden lg:flex justify-center'>
                            <div className='relative w-[440px] h-[380px]'>

                                <div className='absolute inset-8 z-0 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20' />

                                <div className='absolute top-0 z-0 right-0 w-28 h-28 bg-white/10 rounded-full' />

                                <div className='absolute bottom-0 z-0 left-0 w-36 h-36 bg-indigo-400/20 rounded-full' />

                                <div className='relative z-10 w-full h-full flex items-center justify-center'>
                                    <Box
                                        component="img"
                                        src={LandingGraphics}
                                        alt='Landing Graphics'
                                        className='w-full max-w-lg h-auto object-contain'
                                    />
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id='about' className='py-24 bg-white'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='text-center max-w-3xl mx-auto mb-16'>
                        <Typography variant='overline' className='!text-blue-600 !font-bold !tracking-widest'>
                            About Us
                        </Typography>
                        <Typography variant='h3' className='!font-bold !text-3xl sm:text-4xl text-slate-800 mt-2 mb-5'>
                            Education Made Simple
                        </Typography>
                        <Typography variant='body1' className='text-slate-500 !leading-relaxed'>
                            We believe everyone should have access to quality learning opportunities. Our platform provides practical courses that help learners develop valuable skills and turn their knowledge into real-world results
                        </Typography>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <Card elevation={0} className='border border-slate-200 rounded-2xl'>
                            <CardContent className='!p-8 text-center'>
                                <div className='w-14 h-14 mx-auto mb-5 rounded-xl bg-blue-50 flex items-center justify-center'>
                                    <MenuBook className='text-blue-600' />
                                </div>
                                <Typography variant='h6' className='font-bold mb-3'>
                                    Quality Courses
                                </Typography>
                                <Typography variant='body2' className='text-slate-500 leading-relaxed'>
                                    Learn from carefully structured courses designed to provide practical and useful knowledge.
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card elevation={0} className='border border-slate-200 rounded-2xl'>
                            <CardContent className='!p-8 text-center'>
                                <div className='w-14 h-14 mx-auto mb-5 rounded-xl bg-blue-50 flex items-center justify-center'>
                                    <MenuBook className='text-blue-600' />
                                </div>
                                <Typography variant='h6' className='font-bold mb-3'>
                                    Learn Together
                                </Typography>
                                <Typography variant='body2' className='text-slate-500 leading-relaxed'>
                                    Join a growing community of learners and improve your skills at your own pace.
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card elevation={0} className='border border-slate-200 rounded-2xl'>
                            <CardContent className='!p-8 text-center'>
                                <div className='w-14 h-14 mx-auto mb-5 rounded-xl bg-blue-50 flex items-center justify-center'>
                                    <MenuBook className='text-blue-600' />
                                </div>
                                <Typography variant='h6' className='font-bold mb-3'>
                                    Practical Skills
                                </Typography>
                                <Typography variant='body2' className='text-slate-500 leading-relaxed'>
                                    Focus on skills that can be applied directly to your projects, studies, and career.
                                </Typography>
                            </CardContent>
                        </Card>
                    </div>
                </div>


            </section>

            <section id='courses' className='py-24 bg-slate-50'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>

                    <div className='mb-12'>
                        <Typography variant='overline' className='!text-blue-600 !font-bold !tracking-widest'>
                            Our Courses
                        </Typography>
                        <Typography variant='h3' className='!font-bold !text-3xl sm:!text-4xl text-slate-800 mt-2'>
                            Start Learning
                        </Typography>
                        <Typography variant='body1' className='text-slate-500 max-w-md'>
                            Explore courses designed to help you build technical, creative, and professional skills
                        </Typography>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {courses.map((course) => (
                            <Card key={course.title} elevation={0} className='rounded-2xl border border-slate-200 overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300'>
                                <div className='h-40 bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center'>
                                    <MenuBook className='!text-6xl text-white/90' />
                                </div>

                                <CardContent className='!p-6'>
                                    <span className='inline-block px-3 py-1 mb-4 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold'>
                                        {course.level}
                                    </span>
                                    <Typography variant='h6' className='font-bold text-slate-800 mb-3'>
                                        {course.title}
                                    </Typography>
                                    <Typography variant='body2' className='text-slate-500 leading-relaxed mb-6'>
                                        {course.description}
                                    </Typography>
                                    <Button variant='outlined' fullWidth className='normal-case rounded-kg border-blue-600 text-blue-600 hover:border-blue-700 hover:bg-blue-50'>
                                        View Course
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <section id='contact' className='py-24 bg-white'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-16'>
                        <div>
                            <Typography variant='overline' className='!text-blue-600 !font-bold !tracking-widest'>
                                Contact Us
                            </Typography>
                            <Typography variant='h3' className='!font-bold !text-3xl sm:text-4xl text-slate-800 mt-2 mb-5'>
                                We'd love to hear from you
                            </Typography>
                            <Typography variant='body1' className='text-slate-500 leading-relaxed mb-10 max-w-lg'>
                                Have a question about our courses or need help getting started? Send us a message and our team will be happy to assist you.
                            </Typography>

                            <div className='space-y-6 mt-3'>
                                <div className='flex items-center gap-4'>
                                    <div className='w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center'>
                                        <Email className='text-blue-600' />
                                    </div>

                                    <div>
                                        <Typography variant='caption' className='text-slate-400'>
                                            Email
                                        </Typography>
                                        <Typography className='font-medium text-slate-700'>
                                            contactsupport@EduLearn.com
                                        </Typography>
                                    </div>
                                </div>

                                <div className='flex items-center gap-4'>
                                    <div className='w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center '>
                                        <Phone className='text-blue-600' />
                                    </div>

                                    <div>
                                        <Typography variant='caption' className='text-slate-400'>
                                            Phone
                                        </Typography>
                                        <Typography className='font-medium text-slate-700'>
                                            +63 912 345 6789
                                        </Typography>
                                    </div>
                                </div>

                                <div className='flex items-center gap-4'>
                                    <div className='w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center '>
                                        <LocationOn className='text-blue-600' />
                                    </div>

                                    <div>
                                        <Typography variant='caption' className='text-slate-400'>
                                            Location
                                        </Typography>
                                        <Typography className='font-medium text-slate-700'>
                                            Manila, Philippines
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <Card elevation={0} className='border border-slate-200 rounded-2xl'>
                            <CardContent className='!p-8'>
                                <Typography variant='h6' className='font-bold text-slate-800 mb-6'>
                                    Send your inquiry here!
                                </Typography>

                                <div className='flex flex-col gap-3'>
                                    <TextField fullWidth label="Full Name" variant='outlined' />
                                    <TextField fullWidth label="Email Address" type='email' variant='outlined' />
                                    <TextField fullWidth label="Subject" variant='outlined' />
                                    <TextField fullWidth label="Message" multiline rows={5} variant='outlined' />
                                    <Button fullWidth variant='contained' size='large' className='bg-blue-600 hover:bg-blue-700 normal-case rounded-lg shadow-none !py-3'>
                                        Send Message
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <footer className='bg-slate-900 text-white'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
                    <div className='flex flex-col md:flex-row justify-between gap-8'>
                        <div className='max-w-sm'>
                            <div className='flex items-center gap-2 mb-4'>
                                <School className='text-blue-400' />
                                <Typography variant='h6' className='font-bold'>
                                    EduLearn
                                </Typography>
                            </div>

                            <Typography variant='body2' className='text-slate-400 leading-relaxed'>
                                Empowering learners with practical knowledge and skills for a better future.
                            </Typography>
                        </div>

                        <div>
                            <Typography className='font-semibold mb-4'>
                                Navigation
                            </Typography>

                            <div className='flex flex-col gap-2'>
                                <a href='#about' className='text-slate-400 hover:text-white text-sm'>
                                    About Us
                                </a>

                                <a href='#courses' className='text-slate-400 hover:text-white text-sm'>
                                    Courses
                                </a>

                                <a href='#contact' className='text-slate-400 hover:text-white text-sm'>
                                    Contact Us
                                </a>
                            </div>

                            <div className='border-t border-slate-800 mt-10 pt-6'>
                                <Typography variant='body2' className='text-slate-500 text-center'>
                                    ©{new Date().getFullYear()} EduLearn. All rights reserved.
                                </Typography>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    )
}
