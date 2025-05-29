import { db } from "../db/mysql.ts";
import log from "../utils/logger.ts";
import { UserInfo, UserActivity } from "../types/user.ts";

export class UserService {
  async login(code: string) {
    log.info(`用户登录，code: ${code}`);
    // 这里应该调用微信接口获取openid和session_key，然后根据openid查询或创建用户
    // 简化处理，直接返回一个模拟的用户信息
    const userInfo: UserInfo[] = await db.query(
      "SELECT * FROM rs_user_info where openid = ?",
      [code], // 假设code就是openid
    );
    if (userInfo.length > 0) {
      return { success: true, data: userInfo[0] };
    } else {
      const newUser = {
        openid: code,
        nick_name: `用户_${Math.random().toString(36).substring(7)}`,
        avatar_url: "",
        gender: 0,
        city: "",
        province: "",
        country: "",
        status: 1,
        create_time: new Date(),
      };
      await db.query(
        "INSERT INTO rs_user_info (openid, nick_name, avatar_url, gender, city, province, country, status, create_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          newUser.openid,
          newUser.nick_name,
          newUser.avatar_url,
          newUser.gender,
          newUser.city,
          newUser.province,
          newUser.country,
          newUser.status,
          newUser.create_time,
        ],
      );
      return { success: true, data: newUser };
    }
  }

  async getUserInfo(userId: string) {
    log.info(`获取用户信息，userId: ${userId}`);
    const userInfo: UserInfo[] = await db.query(
      "SELECT * FROM rs_user_info where id = ?",
      [userId],
    );
    return { success: true, data: userInfo[0] };
  }

  async getUserActivities(userId: string) {
    log.info(`获取用户活动，userId: ${userId}`);
    const userActivities: UserActivity[] = await db.query(
      "SELECT * FROM rs_user_activity where user_id = ?",
      [userId],
    );
    return { success: true, data: userActivities };
  }

  async getAllUsersInfo() {
    log.info("获取所有用户信息");
    const usersInfo: UserInfo[] = await db.query("SELECT * FROM rs_user_info where status = 1");
    return { success: true, data: usersInfo };
  }
}