// types/User.ts
export interface AppUser {
  id: number;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  role?: string;
}
