export type AccountStatus = "active" | "inactive" | "suspended";

export type AccountRole = "super_admin" | "analyst";

export interface Account {
  id: number;
  fullName: string;
  email: string;
  role: AccountRole;
  status: AccountStatus;
  pic: string | null;
}

export interface AccountListData {
  accounts: Account[];
}

export interface CreateAccountInput {
  fullName: string;
  email: string;
}

export interface UpdateAccountStatusInput {
  userId: number;
  status: AccountStatus;
}
