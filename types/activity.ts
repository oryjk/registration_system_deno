export interface Activity {
    id?: string;
    cover?: string;
    start_time: Date;
    end_time: Date;
    holding_date?: Date;
    location: string;
    name: string;
    status: number;
}

export interface ActivityInfo {
    activity_id?: string;
    color: string;
    opposing: string;
    opposing_color: string;
}

export interface ActivityWithInfo {
    activity: Activity;
    info: ActivityInfo;
}