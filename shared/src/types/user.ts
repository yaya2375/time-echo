export interface User {
  id: string;
  username: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface UserInDB extends User {
  password_hash: string;
}
