import { db } from "../db/mysql.ts";
import log from "../utils/logger.ts";
import { ActivityOrder } from "../types/activity.ts";

export class OrderService {
  async createActivityOrder(order: ActivityOrder) {
    log.info("创建活动订单");
    const client = await db.client;
    const uuid = crypto.randomUUID();
    try {
      await client.execute("START TRANSACTION");
      await client.execute(
        "INSERT INTO rs_activity_order (id, activity_id, description, fee, total, create_time) VALUES (?, ?, ?, ?, ?, ?)",
        [
          uuid,
          order.activity_id,
          order.description,
          order.fee,
          order.total,
          new Date(),
        ],
      );
      await client.execute("COMMIT");
      return { success: true, id: uuid };
    } catch (error) {
      await client.execute("ROLLBACK");
      throw error;
    }
  }

  autoCalculateFee(number: number) {
    log.info("自动计算费用");
    const fee = number > 0 ? Number((350 / number).toFixed(2)) : 0;
    return { success: true, fee };
  }
}