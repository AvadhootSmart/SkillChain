export enum UserRole {
  Client = 0,
  Freelancer = 1
}

export interface IUser {
  userAddress: string;
  username: string;
  email?: string;
  role: UserRole;
}


