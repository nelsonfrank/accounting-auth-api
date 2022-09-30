export interface UserModelType {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  verificationToken: string;
  active: boolean;
  gender?: string;
  date_of_birth?: Date;
  family_status?: string;
  digital_experience?: string;
  employment_industry?: string;
  residence_country?: string;
  devices?: string[];
  job_title?: string;
  business_usecase?: string;
  company?: string;
  country?: string;
  createdAt?: Date;
  emailVerifiedAt?: Date;
  verifyEmailBefore?: Date;
}
