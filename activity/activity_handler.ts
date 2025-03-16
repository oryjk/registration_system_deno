import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { ActivityService } from "../service/activity_service.ts";
import log from "../utils/logger.ts";

const activityRouter = new Router({ prefix: "/activity" });
const activityService = new ActivityService();

activityRouter.post("/create", async (ctx) => {
    try {
        log.info("create activity")
        const activityWithInfo = await ctx.request.body().value;
        const result = await activityService.createActivity(activityWithInfo);
        ctx.response.body = result;
    } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = { error: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
});

activityRouter.delete("/batch", async (ctx) => {
    try {
        log.info("batch delete activity")
        const { ids } = await ctx.request.body().value;
        if (!Array.isArray(ids) || ids.length === 0) {
            ctx.response.status = 400;
            ctx.response.body = { error: "请提供要删除的活动ID列表" };
            return;
        }
        const result = await activityService.deleteActivities(ids);
        ctx.response.body = result;
    } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = { error: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
});


// 活动列表
activityRouter.get("/infos", async (ctx) => {
    try {
        log.info("get activity infos")
        const result = await activityService.getActivities();
        ctx.response.body = result;
    } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = { error: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
});

// 活动详情
activityRouter.get("/:activityId", async (ctx) => {
    try {
        log.info("get activity info")
        const result = await activityService.getActivityById(ctx.params.activityId);
        ctx.response.body = result;
    } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = { error: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
});

// 活动用户列表
activityRouter.get("/:activityId/users", async (ctx) => {
    try {
        log.info("get activity users")
        const activityId = ctx.params.activityId
        const userActivities =await activityService.getActivityUsers(activityId)
        Object.values(
            userActivities.reduce((acc: Record<string, {
                user_id: string;
                activity_id: string;
                operation_time: string;
                stand: number;
            }>, item: {
                user_id: string;
                activity_id: string;
                operation_time: string;
                stand: number;
            }) => {
                const userId = item.user_id
                if (!acc[userId]) {
                    acc[userId] = item
                }
                if (!acc[userId] || new Date(acc[userId].operation_time) < new Date(item.operation_time)) {
                    acc[userId] = item;
                }
                return acc
            }, {})
        )
        console.log(userActivities)
        ctx.response.body = userActivities;
    } catch (error) {
        ctx.response.status = 500;
        error instanceof Error && console.warn(error.stack)
        ctx.response.body = { error: error instanceof Error ? error.stack : 'An unknown error occurred' };
    }
});

export default activityRouter;