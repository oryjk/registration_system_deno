export interface UserInfo {
  id: number;
  open_id: string;
  union_id: string;
  avatar_url: string;
  username: string;
  nickname: string;
  real_name: string;
  is_manager: boolean;
  latest_login_date: Date;
}
