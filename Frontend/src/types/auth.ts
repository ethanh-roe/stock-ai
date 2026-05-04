export interface UserInfo {
    id: number;
    username: string;
    email: string;
    created_at: string;
    cash_balance: number;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    initial_balance: number
}

export interface Token {
    access_token: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
}