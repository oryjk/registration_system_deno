import { db } from "../db/mysql.ts";
import log from "../utils/logger.ts";
import {
  Activity,
  ActivityInfo,
  ActivityWithInfo,
  UserActivity,
} from "../types/activity.ts";

export class ActivityService {
  async createActivity(activityWithInfo: ActivityWithInfo) {
    const client = await db.client;
    const uuid = crypto.randomUUID();

    try {
      await client.execute("START TRANSACTION");

      const { activity, info } = activityWithInfo;
      await client.execute(
        "INSERT INTO rs_activity (id, cover, start_time, end_time, holding_date, location, name, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          uuid,
          activity.cover,
          activity.start_time,
          activity.end_time,
          activity.holding_date,
          activity.location,
          activity.name,
          activity.status,
        ],
      );

      await client.execute(
        "INSERT INTO rs_activity_info (activity_id, color, opposing, opposing_color,players_per_team) VALUES (?,?,?,?,?)",
        [
          uuid,
          info.color,
          info.opposing,
          info.opposing_color,
          info.players_per_team,
        ],
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
        `DELETE FROM rs_activity WHERE id IN (${ids.map(() => "?").join(",")})`,
        ids,
      );
      await client.execute(
        `DELETE FROM rs_activity_info WHERE activity_id IN (${
          ids.map(() => "?").join(",")
        })`,
        ids,
      );

      await client.execute("COMMIT");
      return { success: true, ids };
    } catch (error) {
      await client.execute("ROLLBACK");
      throw error;
    }
  }

  async getActivities() {
    const activities: Activity[] = await db.query<Activity[]>(
      "SELECT * FROM rs_activity",
    );
    const activityInfos: ActivityInfo[] = await db.query<ActivityInfo[]>(
      "SELECT * FROM rs_activity_info",
    );
    console.log("查询所有的活动222");
    const infoMap = activityInfos.reduce(
      (acc: Record<string, ActivityInfo>, item: ActivityInfo) => {
        if (!item.activity_id) {
          log.warning(`发现无效的活动ID: ${JSON.stringify(item)}`);
          return acc;
        }
        acc[item.activity_id] = item;
        return acc;
      },
      {},
    );

    return activities.map((activity: Activity) => {
      if (!activity?.id) {
        log.warning(`发现无效的活动ID: ${JSON.stringify(activity)}`);
        return activity; // 如果没有ID，只返回活动基本信息
      }
      return {
        ...activity,
        ...infoMap[activity.id],
      };
    });
  }

  async getActivityById(id: string) {
    const activity = await db.query<Activity[]>(
      "SELECT * FROM rs_activity where id = ?",
      [id],
    );
    console.log("查询活动详情" + activity);
    const activityInfo: ActivityInfo[] = await db.query(
      "SELECT * FROM rs_activity_info where activity_id =?",
      [id],
    );
    return {
      ...activity[0],
      ...activityInfo[0],
    };
  }

  async getActivityUsers(activityId: string): Promise<UserActivity[]> {
    return await db.query(
      "SELECT * FROM rs_user_activity where activity_id = ?",
      [activityId],
    );
  }

  async updateActivityStatusAndDesc(id: string, status: number, desc: string) {
    console.log("更新活动状态| " + id + " |" + status + " " + desc);
    const client = await db.client;
    try {
      await client.execute("START TRANSACTION");

      await client.execute(
        "UPDATE rs_activity SET status = ?,description = ? WHERE id = ?",
        [status, desc, id],
      );
      client.execute("COMMIT");

      return { success: true };
    } catch (error) {
      await client.execute("ROLLBACK");
      throw error;
    }
  }

  async updateUserActivityStand(
    activityId: string,
    userId: string,
    stand: number,
  ) {
    const client = await db.client;
    try {
      await client.execute(
        "INSERT INTO rs_user_activity (activity_id, user_id, stand, operation_time, paid, registration_count) VALUES (?, ?, ?, CONVERT_TZ(NOW(), @@session.time_zone, '+08:00'),?, ?)",
        [activityId, userId, stand, 1, 1],
      );
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}
