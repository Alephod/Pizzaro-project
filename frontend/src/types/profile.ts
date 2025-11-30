import type { OrderData } from './order'

export interface UserProfileData {
  name?: string | null;
  phone?: string | null;
  dob?: string | null;
  addresses?: string[];
  orders?: string[];
}

export interface ProfileDataFromDB {
  id: number;
  email: string;
  data: UserProfileData;
}

export interface ProfileData {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  dob: string | null;
  addresses: string[];
  orders: OrderData[];
}