import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { db } from "../db/mysql.ts";
import { UserInfo } from "../types/user.ts";
const userRouter = new Router({
  prefix: "/user",
});
userRouter.get("/infos", async (ctx) => {
  try {
    const users: UserInfo[] = await db.query(
      "SELECT * FROM rs_user_info where status=1",
    );
    ctx.response.body = users;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      error: error instanceof Error
        ? error.message
        : "An unknown error occurred",
    };
  }
});

export default userRouter;
