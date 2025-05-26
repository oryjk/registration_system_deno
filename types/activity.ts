export interface Activity {
  id?: string;
  cover?: string;
  start_time: Date;
  end_time: Date;
  holding_date: Date;
  location: string;
  name: string;
  status: number;
  description: string;
}

export interface ActivityInfo {
  activity_id?: string;
  color: string;
  opposing: string;
  opposing_color: string;
  players_per_team: number;
  billing_type: string;
}

export interface ActivityWithAllInfo
  extends Omit<Activity, "id">, Omit<ActivityInfo, "activity_id"> {
  id: string;
}

export interface ActivityWithInfo {
  activity: Activity;
  info: ActivityInfo;
}

export interface UserActivity {
  user_id: string;
  activity_id: string;
  operation_time: string;
  stand: number;
  registration_count: number;
}

export interface UserActivityStand {
  user_id: string;
  activity_id: string;
  operation_time: string;
  stand: number;
  registration_count: number;
}

export interface CreateActivityInfo {
  color: string;
  opposing: string;
  opposingColor: string;
  playersPerTeam: number;
  billingType: string;
}
export interface CreateActivity {
  name: string;
  startTime: string;
  endTime: string;
  cover?: string;
  status: number;
  location: string;
  holdingDate: string;
  description: string;
  activityInfo: CreateActivityInfo;
}
