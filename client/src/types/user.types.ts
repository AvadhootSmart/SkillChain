export type USER_ROLE = "client" | "freelancer";

export interface IUser {
  userAddress: string;
  username: string;
  email?: string;
  role: USER_ROLE;
}


