
export interface User {
  id?: string; // Make id optional
  userId?: string; // Add userId to match UserInfo
  email: string;
  firstName: string;
  lastName: string;
  role?: string; // Make role optional to match UserInfo
  username?: string;
  profilePicture?: string;
  address?: string;
  city?: string;
  country?: string;
  phoneNumber?: string;
  isActive?: boolean;
  isOnline?: boolean;
}
