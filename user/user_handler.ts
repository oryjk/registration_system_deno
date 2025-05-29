import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { UserService } from "../service/user_service.ts";
import log from "../utils/logger.ts";

const userRouter = new Router({
  prefix: "/user",
});
const userService = new UserService();

userRouter.post("/login", async (ctx) => {
  log.info("login");
  const { code } = await ctx.request.body().value;
  const result = await userService.login(code);
  ctx.response.body = result;
});

userRouter.get("/info/:userId", async (ctx) => {
  log.info("get user info");
  const result = await userService.getUserInfo(ctx.params.userId);
  ctx.response.body = result;
});

userRouter.get("/activities/:userId", async (ctx) => {
  log.info("get user activities");
  const result = await userService.getUserActivities(ctx.params.userId);
  ctx.response.body = result;
});

userRouter.get("/infos", async (ctx) => {
  log.info("get all user infos");
  const result = await userService.getAllUsersInfo();
  ctx.response.body = result;
});

export default userRouter;
