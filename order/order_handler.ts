import {Router} from "https://deno.land/x/oak@v12.6.1/mod.ts";
import {ActivityService} from "../service/activity_service.ts";
import {OrderService} from "../service/order_service.ts";
import {UserService} from "../service/user_service.ts";
import log from "../utils/logger.ts";
import {UserOrderUseCase} from "./user_order_use_case.ts";

const orderRouter = new Router({
  prefix: "/order",
});
const orderService = new OrderService();

const activityService = new ActivityService();
const userService = new UserService();
const userOrderUseCase = new UserOrderUseCase(activityService, userService);

orderRouter.post("/create", async (ctx) => {
  log.info("创建活动订单");
  const order = await ctx.request.body().value;
  const result = await orderService.createActivityOrder(order);
  ctx.response.body = result;
});

orderRouter.post("/autoCalculate", async (ctx) => {
  log.info("自动计算费用");
  const { number } = await ctx.request.body().value;
  const result = await orderService.autoCalculateFee(number);
  ctx.response.body = result;
});

orderRouter.get("/all-activities", async (ctx) => {
  log.info("获取订单列表");
  const allActivitiesBilling = await userOrderUseCase
    .calculateAllActivitiesBilling(new Date("2024-07-01"));
  console.log(allActivitiesBilling);
  ctx.response.body = Object.fromEntries(allActivitiesBilling); // 将 Map 转换为普通对象
});

orderRouter.get("/all-user-orders", async (ctx) => {
  log.info("获取订单列表");
  const allActivitiesBilling = await userOrderUseCase.getUserOrders(
    new Date("2024-07-01"),
  );
  console.log(allActivitiesBilling);
  let userActivityBillings = Object.fromEntries(
      allActivitiesBilling.userActivityBillings,
  );


  ctx.response.body = {
    userBalance: Object.fromEntries(allActivitiesBilling.userBalance),
    userActivityBillings:userActivityBillings
  }; // 将 Map 转换为普通对象
});

export default orderRouter;
