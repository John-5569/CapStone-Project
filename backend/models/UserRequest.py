from pydantic import BaseModel, EmailStr
class UserRequest(BaseModel):
    email: EmailStr
    password: str

class UserEmail(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    newPassword: str

class CredentialsRequest(BaseModel):
    email: EmailStr
    password: str