import type { UserRole } from "@/shared/lib/auth/roles";

export interface AuthUser {
  id: number;
  user_name: string;
  role: UserRole | string;
  status: string;
  pic: string | null;
  email_credential?: {
    email: string;
  };
}

export interface StoredAuthUser {
  user_name: string;
  role: UserRole | string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  access_expires_at: string;
  refresh_expires_at: string;
}

export interface RequestCodeData {
  otp_access_token: string;
  expires_at: string;
  debug_code?: string | null;
}

export interface RequestCodePublicData {
  expires_at: string;
  debug_code?: string | null;
}

export interface DevBypassLoginData {
  bypass: true;
  user: AuthUser;
  tokens: AuthTokens;
}

export interface VerifyCodeData {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface VerifyCodePublicData {
  user: AuthUser;
}

export type RefreshTokenData = AuthTokens;

export interface RefreshTokenPublicData {
  access_expires_at: string;
  refresh_expires_at: string;
}
