export interface User {
    id: number;
    email: string;
    username: string;
}

export interface LoginRequest {
    identifier: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
}