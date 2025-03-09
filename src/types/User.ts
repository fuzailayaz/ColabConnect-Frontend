// types/User.ts
export interface User {
  id: number;
  email: string;
  username?: string; // Make username optional
  first_name?: string;
  last_name?: string;
  avatar?: string;
  role?: string;
}