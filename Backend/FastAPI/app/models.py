from pydantic import BaseModel, EmailStr


# User creation model (what frontend will need to send)
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    
# User creation response model (what is returned upon creation)
class UserCreateResponse(BaseModel):
    id: int
    email: EmailStr
    username: str

# Login Request model
class UserLogin(BaseModel):
    identifier: str # username OR email associated with account
    password: str

# Token response for login
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    


