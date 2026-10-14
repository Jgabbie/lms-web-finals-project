const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 2525,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
})

exports.sendContactEmail = async (req, res) => {
    const { name, email, subject, message } = req.body

    await transporter.sendMail({
        from: `"EduLearn LMS" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'EduLearn LMS - Contact Support',
        html: `
                <div
                    style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    padding: 30px;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    "
                >
                    <h2 style="color: #2563eb;">
                        EduLearn LMS
                    </h2>

                    <p>Hello ${name},</p>

                    <p>
                        Thank you for contacting the EduLearn LMS.
                        We'll respond as soon as possible.
                    </p>

                    <p>
                        If ypu did not send an inquiry to EduLearn LMS
                        account, you can safely ignore this email.
                    </p>
                </div>
            `
    })

    try {
        res.status(200).json({ message: 'Email sent successfully' })
    } catch (error) {
        console.error('Error sending email:', error)
        res.status(500).json({ message: 'Failed to send email' })
    }
}