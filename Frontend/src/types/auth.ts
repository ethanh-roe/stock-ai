export interface User {
    id: number;
    email: string;
    username: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface Token {
    access_token: string;
    token_type: string;
}