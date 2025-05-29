import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { ActivityService } from "../service/activity_service.ts";
import { UserService } from "../service/user_service.ts";

const router = new Router({ prefix: "/activity-repair" });
const activityService = new ActivityService();

const userService = new UserService();

router.get("/user-stand", async (ctx) => {

    const [activities, userInfos] = await Promise.all([
        activityService.getActivities(),
        userService.getAllUsersInfo(),
    ]);

    const completeAll = activities.map(async (activity) => {
        const userStands = await activityService.getActivityUserStand(activity.id!);
        const userIdStands = userStands.map((userStand) => {
            return userStand.user_id;
        });
        const newLocal = userInfos.data
            .filter((userInfo) => {
                return !userIdStands.includes(userInfo.id!);
            })
            .filter((userInfo) => {
                return userInfo.create_time < activity.holding_date!;
            })
            .map((userInfo) => {
                console.log(`用户 ${userInfo.real_name} 未参加活动 ${activity.holding_date} 的报名，现在补录数据`);
                return activityService.updateUserActivityStand(activity.id!, userInfo.id!.toString(), 3, 0);
            });
        const result = await Promise.all(newLocal);
        console.log(result.length);
        return result.length;
    });

    const result = await Promise.all(completeAll);
    const processedCount = result.reduce((acc, cur) => {
        return acc + cur;
    }, 0);
    ctx.response.body = {
        success: true,
        data: {
            message: `修复完毕 ${processedCount}`,
        },
    };
});

export default router;