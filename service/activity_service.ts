import { db } from "../db/mysql.ts";
import log from "../utils/logger.ts";
import { Activity, ActivityInfo, ActivityWithInfo } from "../types/activity.ts";

export class ActivityService {
    async createActivity(activityWithInfo: ActivityWithInfo) {
        const client = await db.client;
        const uuid = crypto.randomUUID();

        try {
            await client.execute("START TRANSACTION");

            const { activity, info } = activityWithInfo;
            await client.execute(
                "INSERT INTO rs_activity (id, cover, start_time, end_time, holding_date, location, name, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [uuid, activity.cover, activity.start_time, activity.end_time, activity.holding_date, activity.location, activity.name, activity.status]
            );

            await client.execute(
                "INSERT INTO rs_activity_info (activity_id, color, opposing, opposing_color) VALUES (?,?,?,?)",
                [uuid, info.color, info.opposing, info.opposing_color]
            );

            await client.execute("COMMIT");
            return { success: true, id: uuid };
        } catch (error) {
            await client.execute("ROLLBACK");
            throw error;
        }
    }

    async deleteActivities(ids: string[]) {
        const client = await db.client;
        try {
            await client.execute("START TRANSACTION");

            await client.execute(
                `DELETE FROM rs_activity WHERE id IN (${ids.map(() => '?').join(',')})`,
                ids
            );
            await client.execute(
                `DELETE FROM rs_activity_info WHERE activity_id IN (${ids.map(() => '?').join(',')})`,
                ids
            );

            await client.execute("COMMIT");
            return { success: true, ids };
        } catch (error) {
            await client.execute("ROLLBACK");
            throw error;
        }
    }

    async getActivities() {
        const activities: Activity[] = await db.query("SELECT * FROM rs_activity");
        const activityInfos: ActivityInfo[] = await db.query("SELECT * FROM rs_activity_info");
        log.info("查询所有的活动222")
        const infoMap = activityInfos.reduce((acc: Record<string, any>, item: any) => {
            acc[item.activity_id] = item;
            return acc;
        }, {});

        return activities.map((activity: any) => ({
            ...activity,
            ...infoMap[activity.id] || {}
        }));
    }

    async getActivityById(id: string) {
        const activity = await db.query("SELECT * FROM rs_activity where id = ?", [id]);
        log.info("查询活动详情" + activity)
        const activityInfo = await db.query("SELECT * FROM rs_activity_info where activity_id =?", [id]);
        return {
            ...activity[0],
            ...activityInfo[0]
        };
    }

    async getActivityUsers(activityId: string) {
        return await db.query(
            "SELECT * FROM rs_user_activity where activity_id = ?",
            [activityId]
        );
    }

    async updateActivityStatusAndDesc(id: string, status: number, desc: string) {
        const client = await db.client;
        try {
            await client.execute("START TRANSACTION");

            await client.execute(
                "UPDATE rs_activity SET status = ?,description = ? WHERE id = ?",
                [status, desc, id]
            );


            return { success: true };
        } catch (error) {
            await client.execute("ROLLBACK");
            throw error;
        }
    }

    async updateUserActivityStand(activityId: string, userId: string, stand: number) {
        const client = await db.client;
        try {
            await client.execute(
                "INSERT INTO rs_user_activity (activity_id, user_id, stand, operation_time) VALUES (?, ?, ?, NOW())",
                [activityId, userId, stand]
            );
            return { success: true };
        } catch (error) {
            throw error;
        }
    }
}