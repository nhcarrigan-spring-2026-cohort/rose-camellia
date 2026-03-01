export interface AuthUser {
  username: string;
  name: string;
  email: string;
  contactNumber?: string;
  isGuest?: boolean;
  verified?: boolean;
}

export interface RegisterRequest {
  username: string;
  name: string;
  email: string;
  password: string;
  contactNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GuestLoginRequest {
  name: string;
  email: string;
  contactNumber?: string;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  token: string;
}

export interface VerifyTokenResponse {
  valid: true;
  user: AuthUser & { verified: boolean };
}
