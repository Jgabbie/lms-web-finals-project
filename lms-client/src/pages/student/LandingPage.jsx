import { Button, TextField, Alert, Snackbar } from '@mui/material'
import { School, MenuBook, Email, Phone, LocationOn, ArrowForward, AutoAwesome, Groups, Code, Palette, Terminal, LoginRounded, AssignmentRounded, CheckCircleRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import LandingGraphics from '../../assets/graphics/undraw_education_3vwh.svg'
import StudentDashboardPreview from '../../assets/images/landing-student-dashboard.png'
import { useState } from 'react'
import api from '../../api/axiosClient'
import './LandingPage.css'

export default function LandingPage() {
    const navigate = useNavigate()

    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })

    const [sending, setSending] = useState(false)
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    })

    const handleContactChange = (e) => {
        const { name, value } = e.target
        setContactForm(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleContactSubmit = async (e) => {
        e.preventDefault()

        const { name, email, subject, message } = contactForm

        if (!name || !email || !subject || !message) {
            setNotification({
                open: true,
                message: 'Please fill in all fields.',
                severity: 'error'
            })
            return
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setNotification({
                open: true,
                message: 'Please enter a valid email address.',
                severity: 'error'
            })
            return
        }

        try {
            setSending(true)
            await api.post('/contact', contactForm)
            setContactForm({
                name: '',
                email: '',
                subject: '',
                message: ''
            })
            setNotification({
                open: true,
                message: 'Message sent successfully!',
                severity: 'success'
            })
        } catch (error) {
            console.error('Error sending contact message:', error)
            setNotification({
                open: true,
                message: 'An error occurred while sending the message.',
                severity: 'error'
            })
        } finally {
            setSending(false)
        }
    }

    const courses = [
        { title: 'Introduction to React', description: 'Learn the fundamentals of React and build modern interactive web applications', level: 'Beginner' },
        { title: 'Advanced UI/UX Design', description: 'Master modern interface design principles and create engaging user experiences', level: 'Intermediate' },
        { title: 'Backend with Node.js', description: 'Build powerful server-side applications and APIs using Node.js and Express', level: 'Intermediate' },
    ]
    const navigateSignup = () => {
        navigate('/login', { replace: true })
    }
    const courseIcons = [<Code key='code' />, <Palette key='palette' />, <Terminal key='terminal' />]

    return (
        <div className='edulanding'>
            <a className='landing-skip' href='#main-content'>Skip to content</a>
            <div className='landing-announcement'>A little learning today. A brighter tomorrow. <AutoAwesome fontSize='small' /> Learn at your own pace.</div>
            <main id='main-content'>
                <section className='landing-hero'>
                    <nav className='landing-nav' aria-label='Main navigation'>
                        <a className='landing-brand' href='#main-content'><School /> EduLearn<span className='brand-dot'>.</span></a>
                        <div className='landing-nav-links'><a href='#about'>About Us</a><a href='#courses'>Courses</a><a href='#contact'>Contact Us</a></div>
                        <Button variant='contained' onClick={navigateSignup}>Get Started <ArrowForward fontSize='small' /></Button>
                    </nav>
                    <div className='landing-hero-content'>
                        <span className='landing-eyebrow'>YOUR NEXT CHAPTER STARTS HERE</span>
                        <h1>Learn today.<br />Build your tomorrow.</h1>
                        <p>Develop the skills you need to succeed with practical, accessible, and engaging online courses designed for modern learners.</p>
                        <div className='landing-hero-actions'><Button variant='contained' href='#courses'>Explore Courses <ArrowForward fontSize='small' /></Button><Button variant='outlined' href='#about'>Learn More</Button></div>
                    </div>
                    <div className='landing-hero-note'><span className='landing-status-dot' /> Small steps. Endless possibilities.</div>
                </section>
                <div className='landing-intro'><p>A space for every kind of learner</p><div><span><School /> Students</span><span><MenuBook /> Instructors</span><span><Groups /> Learning together</span></div></div>
                <section id='how-it-works' className='landing-section landing-how' aria-labelledby='landing-how-title'>
                    <div className='landing-section-heading'><span className='landing-eyebrow'>SMALL STEPS. REAL PROGRESS.</span><h2 id='landing-how-title'>Your next chapter,<br />in three simple steps.</h2><p>From signing in to submitting your work, keep your learning in one place.</p></div>
                    <ol className='landing-steps'>
                        <li><div className='landing-step-top'><LoginRounded /><span>01</span></div><h3>Sign in to your space</h3><p>Use your EduLearn account to open your personal learning dashboard.</p></li>
                        <li><div className='landing-step-top'><MenuBook /><span>02</span></div><h3>Find your enrolled courses</h3><p>Open the courses assigned to you and explore their lessons and learning materials.</p></li>
                        <li><div className='landing-step-top'><AssignmentRounded /><span>03</span></div><h3>Learn, discuss, and submit</h3><p>Review resources, join course discussions, and submit your assignments.</p></li>
                    </ol>
                </section>
                <section id='courses' className='landing-section landing-courses'>
                    <div className='landing-section-heading'><span className='landing-eyebrow'>FIND YOUR NEXT POSSIBILITY</span><h2>Big ideas.<br />Practical classes.</h2><p>Explore courses designed to help you build technical, creative, and professional skills.</p></div>
                    <div className='landing-course-grid'>{courses.map((course, index) => <article className={`landing-course-card course-${index}`} key={course.title}>
                        <div className='landing-course-art' aria-hidden='true'><div className='course-orbit' /><div className='course-art-icon'>{courseIcons[index]}</div><span>0{index + 1}</span></div>
                        <div className='landing-course-body'><span className='landing-course-level'>{course.level}</span><h3>{course.title}</h3><p>{course.description}</p><Button variant={index === 1 ? 'contained' : 'outlined'} fullWidth>View Course <ArrowForward fontSize='small' /></Button></div>
                    </article>)}</div>
                    <p className='landing-course-caption'>Technical thinking. Creative confidence. Real-world skills.</p>
                </section>
                <div className='landing-tag-band' aria-hidden='true'>{['Growth oriented', 'Curious', 'Practical skills', 'Calm', 'Motivated', 'Focused sessions', 'Self driven', 'Curious minds', 'Real progress'].map((tag, index) => <span className={`landing-tag tag-${index % 4}`} key={tag}>{index % 3 === 0 && <AutoAwesome />}{tag}</span>)}</div>
                <section id='about' className='landing-section landing-about'>
                    <div className='landing-about-statement'><span className='landing-tag tag-0 floating-tag tag-top'>Curious minds</span><span className='landing-eyebrow'>ABOUT EDULEARN</span><h2>From focused sessions<br />to practical skills,<br />make room for<br /><span>your next chapter.</span></h2><span className='landing-tag tag-2 floating-tag tag-bottom'>Real progress <AutoAwesome /></span></div>
                    <p className='landing-about-copy'>We believe everyone should have access to quality learning opportunities. Our platform provides practical courses that help learners develop valuable skills and turn their knowledge into real-world results.</p>
                    <div className='landing-feature-grid'>
                        <article><MenuBook /><h3>Quality Courses</h3><p>Learn from carefully structured courses designed to provide practical and useful knowledge.</p></article>
                        <article><Groups /><h3>Learn Together</h3><p>Join a growing community of learners and improve your skills at your own pace.</p></article>
                        <article><AutoAwesome /><h3>Practical Skills</h3><p>Focus on skills that can be applied directly to your projects, studies, and career.</p></article>
                    </div>
                </section>
                <section id='platform-preview' className='landing-section landing-platform' aria-labelledby='landing-platform-title'>
                    <div className='landing-platform-copy'><span className='landing-eyebrow'>A CLEARER WAY TO LEARN</span><h2 id='landing-platform-title'>Your learning.<br />All together.</h2><p>A personal workspace that helps you stay focused on what comes next.</p><ul className='landing-platform-benefits'><li><CheckCircleRounded /> Access your enrolled courses and materials</li><li><CheckCircleRounded /> Keep track of assignments and deadlines</li><li><CheckCircleRounded /> Join discussions and follow your progress</li></ul><Button variant='contained' onClick={navigateSignup}>Open Your Learning Space <ArrowForward fontSize='small' /></Button></div>
                    <figure className='landing-dashboard-preview'>
                        <a className='landing-dashboard-image-link' href={StudentDashboardPreview} target='_blank' rel='noreferrer' aria-label='Open full-size Student dashboard screenshot'>
                            <img src={StudentDashboardPreview} alt='EduLearn Student dashboard with enrolled courses, learning materials, assignments, progress, and upcoming deadlines' loading='lazy' width='1440' height='960' />
                        </a>
                        <figcaption>Our Student dashboard, shown with an empty workspace and personal details hidden. Select the preview to view it full size.</figcaption>
                    </figure>
                </section>
                <section className='landing-learning-banner'><div className='landing-learning-card'><span className='landing-eyebrow'>EDUCATION MADE SIMPLE</span><h2>A little curiosity<br />can take you a long way.</h2><p>Empowering learners with practical knowledge and skills for a better future.</p><img src={LandingGraphics} alt='Illustration of learning and education' loading='lazy' /></div></section>
                <section className='landing-section landing-faq' aria-labelledby='landing-faq-title'>
                    <div className='landing-section-heading'><span className='landing-eyebrow'>A LITTLE MORE CLARITY</span><h2 id='landing-faq-title'>Frequently asked<br />questions.</h2></div>
                    <details open><summary>Who is EduLearn for?</summary><p>EduLearn brings students, instructors, and administrators together in one learning management system.</p></details>
                    <details><summary>How do I access my courses?</summary><p>Sign in and open My Courses in the Student portal. The courses you are enrolled in will appear there.</p></details>
                    <details><summary>Where do I submit my assignments?</summary><p>Open Assignments in the Student portal, select an assignment, and follow its submission instructions.</p></details>
                    <details><summary>Who can help with course enrollment?</summary><p>Contact your instructor or school administrator if a course you need is missing from My Courses.</p></details>
                    <details><summary>How do I get started?</summary><p>Use Get Started to visit the login page. You can also find the signup link there if you need an account.</p></details>
                </section>
                <section id='contact' className='landing-section landing-contact'>
                    <div><span className='landing-eyebrow'>LET’S TALK</span><h2>Good questions.<br />New beginnings.</h2><p>Have a question about our courses or need help getting started? Send us a message and our team will be happy to assist you.</p>
                        <dl className='landing-contact-details'><div><Email /><dt>Email</dt><dd>contactsupport@EduLearn.com</dd></div><div><Phone /><dt>Phone</dt><dd>+63 912 345 6789</dd></div><div><LocationOn /><dt>Location</dt><dd>Manila, Philippines</dd></div></dl>
                    </div>
                    <div className='landing-contact-form'><h3>Send your inquiry here!</h3>
                        <TextField
                            fullWidth
                            label='Full Name'
                            required
                            name='name'
                            value={contactForm.name}
                            onChange={handleContactChange}
                            inputProps={{ maxLength: 50 }}
                            variant='outlined'
                        />
                        <TextField
                            fullWidth
                            label='Email Address'
                            type='email'
                            variant='outlined'
                            required
                            name='email'
                            value={contactForm.email}
                            onChange={handleContactChange}
                            inputProps={{ maxLength: 50 }}
                        />
                        <TextField
                            fullWidth
                            label='Subject'
                            variant='outlined'
                            required
                            name='subject'
                            value={contactForm.subject}
                            onChange={handleContactChange}
                            inputProps={{ maxLength: 50 }}
                        />
                        <TextField
                            fullWidth
                            label='Message'
                            multiline
                            rows={5}
                            variant='outlined'
                            name='message'
                            value={contactForm.message}
                            onChange={handleContactChange}
                            inputProps={{ maxLength: 100 }}
                        />
                        <Button
                            fullWidth
                            type='submit'
                            variant='contained'
                            size='large'
                            disabled={sending}
                        >
                            {sending ? 'Sending...' : 'Send Message'}
                            {!sending && <ArrowForward fontSize='small' />}
                        </Button>
                    </div>
                </section>
                <section className='landing-final-cta'><span className='landing-eyebrow'>MAKE YOUR NEXT MOVE</span><h2>Start learning in a way<br />that feels right for you.</h2><Button variant='contained' onClick={navigateSignup}>Get Started <ArrowForward fontSize='small' /></Button><div className='landing-seal' aria-hidden='true'><School /></div></section>
            </main>
            <footer className='landing-footer'><div className='landing-footer-content'><div><a className='landing-brand' href='#main-content'><School /> EduLearn.</a><p>Empowering learners with practical knowledge and skills for a better future.</p></div><div><h3>Explore</h3><a href='#about'>About Us</a><a href='#courses'>Courses</a><a href='#contact'>Contact Us</a></div><div><h3>Get in touch</h3><p>EduLearn@LMS.com</p><p>Manila, Philippines</p></div></div><p className='landing-copyright'>©{new Date().getFullYear()} EduLearn. All rights reserved.</p><div className='landing-footer-wordmark' aria-hidden='true'>EduLearn.</div></footer>


            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={() => setNotification(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    severity={notification.severity}
                    variant='filled'
                    onClose={() => setNotification(prev => ({ ...prev, open: false }))}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </div>
    )
}
