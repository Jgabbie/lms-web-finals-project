import { Button, TextField } from '@mui/material'
import { School, MenuBook, Email, Phone, LocationOn, ArrowForward, AutoAwesome, Groups, Code, Palette, Terminal } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import LandingGraphics from '../../assets/graphics/undraw_education_3vwh.svg'
import './LandingPage.css'

export default function LandingPage() {
    const navigate = useNavigate()
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
                <section className='landing-learning-banner'><div className='landing-learning-card'><span className='landing-eyebrow'>EDUCATION MADE SIMPLE</span><h2>A little curiosity<br />can take you a long way.</h2><p>Empowering learners with practical knowledge and skills for a better future.</p><img src={LandingGraphics} alt='Illustration of learning and education' loading='lazy' /></div></section>
                <section className='landing-section landing-faq' aria-labelledby='landing-faq-title'>
                    <div className='landing-section-heading'><span className='landing-eyebrow'>A LITTLE MORE CLARITY</span><h2 id='landing-faq-title'>Frequently asked<br />questions.</h2></div>
                    <details open><summary>Who is EduLearn for?</summary><p>EduLearn brings students, instructors, and administrators together in one learning management system.</p></details>
                    <details><summary>What courses can I explore?</summary><p>The featured classes introduce React, UI/UX design, and backend development with Node.js.</p></details>
                    <details><summary>What can I find in the student portal?</summary><p>The student interface includes courses, assignments, learning materials, discussions, and a personal dashboard.</p></details>
                    <details><summary>How do I get started?</summary><p>Use Get Started to visit the login page. You can also find the signup link there if you need an account.</p></details>
                </section>
                <section id='contact' className='landing-section landing-contact'>
                    <div><span className='landing-eyebrow'>LET’S TALK</span><h2>Good questions.<br />New beginnings.</h2><p>Have a question about our courses or need help getting started? Send us a message and our team will be happy to assist you.</p>
                        <dl className='landing-contact-details'><div><Email /><dt>Email</dt><dd>contactsupport@EduLearn.com</dd></div><div><Phone /><dt>Phone</dt><dd>+63 912 345 6789</dd></div><div><LocationOn /><dt>Location</dt><dd>Manila, Philippines</dd></div></dl>
                    </div>
                    <div className='landing-contact-form'><h3>Send your inquiry here!</h3><TextField fullWidth label='Full Name' variant='outlined' /><TextField fullWidth label='Email Address' type='email' variant='outlined' /><TextField fullWidth label='Subject' variant='outlined' /><TextField fullWidth label='Message' multiline rows={5} variant='outlined' /><Button fullWidth variant='contained' size='large'>Send Message <ArrowForward fontSize='small' /></Button></div>
                </section>
                <section className='landing-final-cta'><span className='landing-eyebrow'>MAKE YOUR NEXT MOVE</span><h2>Start learning in a way<br />that feels right for you.</h2><Button variant='contained' onClick={navigateSignup}>Get Started <ArrowForward fontSize='small' /></Button><div className='landing-seal' aria-hidden='true'><School /></div></section>
            </main>
            <footer className='landing-footer'><div className='landing-footer-content'><div><a className='landing-brand' href='#main-content'><School /> EduLearn.</a><p>Empowering learners with practical knowledge and skills for a better future.</p></div><div><h3>Explore</h3><a href='#about'>About Us</a><a href='#courses'>Courses</a><a href='#contact'>Contact Us</a></div><div><h3>Get in touch</h3><p>contactsupport@EduLearn.com</p><p>Manila, Philippines</p></div></div><p className='landing-copyright'>©{new Date().getFullYear()} EduLearn. All rights reserved.</p><div className='landing-footer-wordmark' aria-hidden='true'>EduLearn.</div></footer>
        </div>
    )
}
