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
  create_time: Date;
}

export interface UserActivity {
  user_id: number;
  activity_id: string;
  operation_time: string;
  stand: number;
  registration_count: number;
}
