import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { OrderService } from "../service/order_service.ts";
import log from "../utils/logger.ts";

const orderRouter = new Router({
  prefix: "/order",
});
const orderService = new OrderService();

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

export default orderRouter;
