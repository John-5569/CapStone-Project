from fastapi_mail import ConnectionConfig, FastMail, MessageSchema
from dotenv import load_dotenv
import os
load_dotenv()
MAIL_USERNAME=os.getenv("MAIL_USERNAME")
MAIL_PASSWORD=os.getenv("MAIL_PASSWORD")
MAIL_FROM=os.getenv("MAIL_FROM")
MAIL_PORT = os.getenv("MAIL_PORT")
MAIL_SERVER=os.getenv("MAIL_SERVER")
MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME")
MAIL_STARTTLS=os.getenv("MAIL_STARTTLS")
MAIL_SSL_TLS=os.getenv("MAIL_SSL_TLS")
class Email:
    def __init__(self):
        self.config = ConnectionConfig(
                MAIL_USERNAME=MAIL_USERNAME ,
                MAIL_PASSWORD=MAIL_PASSWORD,
                MAIL_FROM=MAIL_FROM,
                MAIL_PORT=MAIL_PORT,
                MAIL_SERVER=MAIL_SERVER,
                MAIL_FROM_NAME=MAIL_FROM_NAME,
                MAIL_STARTTLS=MAIL_STARTTLS,
                MAIL_SSL_TLS=MAIL_SSL_TLS,
                USE_CREDENTIALS=True,
                VALIDATE_CERTS=True
            )

        self.fast_mail = FastMail(self.config)

    async def sendVerificationEmail(self, email, link):
        html = f"""
        <h2>Verify your email</h2>

        <p>Click the button below to verify your account.</p>

        <a href="{link}">
            Verify Email
        </a>

        <p>If you didn't create an account, ignore this email.</p>
        """

        message = MessageSchema(
            subject="Verify your Email",
            recipients=[email],
            body=html,
            subtype="html"
        )

        await self.fast_mail.send_message(message)


    async def sendResetPasswordEmail(self, email, link):

        html = f"""
        <h2>Reset Password</h2>

        <p>Click the button below to reset your password.</p>

        <a href="{link}">
            Reset Password
        </a>

        <p>If you didn't request a password reset, ignore this email.</p>
        """

        message = MessageSchema(
            subject="Reset Password",
            recipients=[email],
            body=html,
            subtype="html"
        )

        await self.fast_mail.send_message(message)

emailService = Email()
