export interface Profile {
  full_name: string | null;
  phone_number: string | null;
  avatar_url: string | null;
}

export interface ActiveUser {
  user_id: string;
  profiles?: Profile;
  start_date: string;
  end_date: string;
  isCheckedIn?: boolean;
}