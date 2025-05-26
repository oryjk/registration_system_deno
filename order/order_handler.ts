import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { db } from "../db/mysql.ts";
import { ActivityService } from "../service/activity_service.ts";

interface ActivityOrder {
    activityId: string;
    desc: string;
    fee: number;
    total: number;
    createTime: Date;
}

const activityService = new ActivityService();

const orderRouter = new Router({
    prefix: "/order",
});
orderRouter.post("/createActivityOrder", async (ctx) => {
    try {
        const activityOrder: ActivityOrder = await ctx.request.body().value;

        const result: any = await db.query("insert into rs_activity_order (activity_id, description, fee, total, create_time) values (?, ?, ?, ?, ?)",
            [activityOrder.activityId, activityOrder.desc, activityOrder.fee, activityOrder.total, new Date()]
        );
        ctx.response.body = result;
    } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = {
            error: error instanceof Error
                ? error.message
                : "An unknown error occurred",
        };
    }
});

orderRouter.get("/autoCalculate", async (ctx) => {
    try {
        const activities = await activityService.getActivities();
        const needCalculateFeeActivities = activities.filter((activity) => {
            return activity.status == 2;
        })
        needCalculateFeeActivities.forEach(async (activity) => {
            const userStands = await activityService.getActivityUserStand(activity.id!);
            const number = userStands.reduce((acc, cur) => {
                if (cur.stand == 1) {
                    return acc + 1;
                }
                return acc;
            }, 0);
            const fee = number > 0 ? Number((350 / number).toFixed(2)) : 0;
            console.log(`比赛 ${JSON.stringify(activity)} 参赛人数 ${number}`);
            await db.query("insert into rs_activity_order (activity_id, description, fee, total, create_time,activity_holding_time) values (?, ?, ?, ?, ?,?)",
                [activity.id!, activity.description, fee, 350, new Date(),activity.holding_date]
            );
        })


        ctx.response.body = `所有比赛计算完成，比赛个数 ${needCalculateFeeActivities.length}`;
    } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = {
            error: error instanceof Error
                ? error.message
                : "An unknown error occurred",
        };
    }
});

export default orderRouter;
