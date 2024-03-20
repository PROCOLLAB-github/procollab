/** @format */

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  isOnline: boolean;
  isActive: boolean;
  onboardingStage: number | null;
  speciality: string;
  userType: number;
  timeCreated: string;
  timeUpdated: string;
  verificationDate: string;
}
