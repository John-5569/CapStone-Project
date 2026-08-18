from pydantic import BaseModel, EmailStr
class UserRequest(BaseModel):
    email: EmailStr
    password: str
    rememberMe: bool = False

class GoogleAuthRequest(BaseModel):
    idToken: str

class UserEmail(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    newPassword: str

class CredentialsRequest(BaseModel):
    email: EmailStr
    password: str