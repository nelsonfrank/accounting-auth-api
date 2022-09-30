export interface UserModelType {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  verificationToken: string;
  verifyBefore: Date;
  active: boolean;
  createdAt?: Date;
  emailVerifiedAt?: Date;
}
