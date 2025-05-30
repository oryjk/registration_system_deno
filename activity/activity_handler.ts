import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { ActivityService } from "../service/activity_service.ts";
import log from "../utils/logger.ts";
import { CreateActivity } from "../types/activity.ts";
import { UserActivity } from "../types/user.ts";

const activityRouter = new Router({ prefix: "/activity" });
const activityService = new ActivityService();

activityRouter.post("/create", async (ctx) => {
  log.info("create activity");
  const createActivity: CreateActivity = await ctx.request.body().value;
  const activityWithInfo = {
    activity: {
      name: createActivity.name,
      start_time: new Date(createActivity.startTime),
      end_time: new Date(createActivity.endTime),
      cover: createActivity.cover,
      status: createActivity.status,
      location: createActivity.location,
      holding_date: new Date(createActivity.holdingDate),
      description: createActivity.description,
    },
    info: {
      color: createActivity.activityInfo.color,
      opposing: createActivity.activityInfo.opposing,
      opposing_color: createActivity.activityInfo.opposingColor,
      players_per_team: createActivity.activityInfo.playersPerTeam,
      billing_type: createActivity.activityInfo.billingType,
    },
  };
  const result = await activityService.createActivity(activityWithInfo);
  ctx.response.body = result;
});

activityRouter.delete("/batch", async (ctx) => {
  log.info("batch delete activity");
  const { ids } = await ctx.request.body().value;
  if (!Array.isArray(ids) || ids.length === 0) {
    ctx.response.status = 400;
    ctx.response.body = { error: "请提供要删除的活动ID列表" };
    return;
  }
  const result = await activityService.deleteActivities(ids);
  ctx.response.body = result;
});

// 活动列表
activityRouter.get("/infos", async (ctx) => {
  log.info("get activity infos");
  const result = await activityService.getFullActivitiesInfo();
  result.sort((a, b) => b.holding_date.getTime() - a.holding_date.getTime());
  ctx.response.body = { success: true, data: result };
});

// 活动详情
activityRouter.get("/:activityId", async (ctx) => {
  log.info("get activity info");
  const result = await activityService.getActivityById(ctx.params.activityId);
  ctx.response.body = result;
});

// 修改活动状态
activityRouter.patch("/:activityId/status", async (ctx) => {
  log.info("update activity status");
  const activityId = ctx.params.activityId;
  const { status, desc } = await ctx.request.body().value;

  if (typeof status !== "number") {
    ctx.response.status = 400;
    ctx.response.body = { error: "状态值必须是数字" };
    return;
  }

  const result = await activityService.updateActivityStatusAndDesc(
    activityId,
    status,
    desc,
  );
  log.info("修改比赛状态成功, 比赛ID: " + activityId + ", 状态: " + status);
  ctx.response.body = result;
});

// 修改用户活动状态
activityRouter.patch("/:activityId/user/:userId/stand", async (ctx) => {
  log.info("update user activity stand");
  const { activityId, userId } = ctx.params;
  const { stand, count } = await ctx.request.body().value;

  const result = await activityService.updateUserActivityStand(
    activityId,
    userId,
    stand,
    count,
  );
  log.info(
    `修改用户活动状态成功, 活动ID: ${activityId}, 用户ID: ${userId}, 状态: ${stand}, 人数: ${count}`,
  );
  ctx.response.body = result;
});

// 活动用户列表
activityRouter.get("/:activityId/users", async (ctx) => {
  console.log("%cget activity users", "color: red");
  const activityId = ctx.params.activityId;
  const activity = await activityService.getActivityById(activityId);
  const userActivities = await activityService.getActivityUsers(activityId);
  const userStands = Object.values(
    userActivities.reduce((
      acc: Record<string, UserActivity>,
      item: UserActivity,
    ) => {
      const userId = item.user_id;
      if (
        !acc[userId] ||
        new Date(acc[userId].operation_time) < new Date(item.operation_time)
      ) {
        acc[userId] = item;
      }
      return acc;
    }, {} as Record<string, UserActivity>),
  );
  console.log(activity);
  // 添加用户数量到 activity
  const activity_info = {
    ...activity,
    regist_count: userStands.length,
  };
  ctx.response.body = {
    success: true,
    data: {
      activity_info,
      user_infos: userStands,
    },
  };
});

export default activityRouter;
