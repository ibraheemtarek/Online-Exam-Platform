export enum UserRole {
  USER = "User",
  ADMIN = "Admin",
}

export interface SignupDTP {
  firstName: string;
  lastName: string;
  email: string;
  image: string;
  passwordHash: string;
  role: UserRole;
}

export interface SigninDTP {
  email: string;
  passwordHash: string;
}
