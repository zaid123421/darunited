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

export interface MeUser {
  id: number;
  fullName: string;
  email: string;
  emailVerified: boolean;
  recoveryEmailConfigured: boolean;
  role: UserRole | string;
  status: string;
  pic: string | null;
}

export interface RecoveryRequestCodeData {
  recovery_otp_access_token: string;
  expires_at: string;
  debug_code?: string | null;
}

export interface RecoveryRequestCodePublicData {
  expires_at: string;
  debug_code?: string | null;
}

export interface RecoveryVerifyCodeData {
  recovery_access_token: string;
  token_type?: string;
  expires_at: string;
}

export interface RecoveryVerifyCodePublicData {
  expires_at: string;
}

export interface RecoveryPrimaryEmailRequestData {
  expires_at: string;
  debug_code?: string | null;
}

export interface RecoveryPrimaryEmailVerifyData {
  primary_email: string;
  requires_login: boolean;
}

export interface RecoveryEmailSetupOtpData {
  expires_at?: string;
  debug_code?: string | null;
}
