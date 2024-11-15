const nodemailer = require('nodemailer')
require('dotenv').config()
const transport = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS_KEY,
    },
})
const sendEmail = async (email, username) => {
    const emailsend = `<!DOCTYPE html>
                <html lang="en">

                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Welcome to InCircle</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }

                        .email-container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        }

                        .header {
                            background-color: #007bff;
                            padding: 20px;
                            text-align: center;
                            border-radius: 8px 8px 0 0;
                        }

                        .header h1 {
                            color: #ffffff;
                            margin: 0;
                        }

                        .content {
                            padding: 20px;
                        }

                        .content h2 {
                            color: #333333;
                        }

                        .content p {
                            color: #555555;
                            line-height: 1.6;
                        }

                        .footer {
                            text-align: center;
                            padding: 10px;
                            font-size: 14px;
                            color: #777777;
                        }

                        .button {
                            display: inline-block;
                            background-color: #007bff;
                            color: #ffffff;
                            padding: 10px 20px;
                            text-decoration: none;
                            border-radius: 4px;
                            margin-top: 20px;
                        }

                        .button:hover {
                            background-color: #0056b3;
                        }
                    </style>
                </head>

                <body>
                    <div class="email-container">
                        <div class="header">
                            <h1>Welcome to InCircle!</h1>
                        </div>
                        <div class="content">
                            <h2>Hello ${username},</h2>
                            <p>Thank you for signing up for InCircle. We're thrilled to have you on board!</p>
                            <p>Get started by exploring our features and connecting with others. We're here to help you make the most
                                out of your experience.</p>
                            <a href="[Your App URL]" class="button">Get Started</a>
                        </div>
                        <div class="footer">
                            <p>&copy; 2024 InCircle. All rights reserved.</p>
                        </div>
                    </div>
                </body>

                </html>
                `
    // console.log(process.env.EMAIL, process.env.EMAIL_PASS_KEY);
    try {
        transport.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Welcome to InCircle!",
            // text: `Hi ${name}, Thanks for Sign up`,
            html: emailsend
        }, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
        })
    } catch (error) {
        console.log(error);
    }
}



module.exports = sendEmail
