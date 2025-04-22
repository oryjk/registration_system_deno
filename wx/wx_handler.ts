import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { WxService } from "../service/wx_service.ts";
import log from "../utils/logger.ts";

const wxRouter = new Router({ prefix: "/wx" });
const wxService = new WxService();

// 获取微信 JS 配置
wxRouter.get("/jsconfig", async (ctx) => {
  try {
    log.info("get wx jsconfig");
    const url = ctx.request.url.toString();
    const config = await wxService.getJsConfig(url);

    ctx.response.body = {
      success: true,
      data: config,
    };
  } catch (error) {
    log.error(error instanceof Error ? error.stack : String(error));
    ctx.response.status = 500;
    ctx.response.body = {
      error: error instanceof Error
        ? error.message
        : "An unknown error occurred",
    };
  }
});

// 获取微信授权code
wxRouter.get("/auth", async (ctx) => {
  try {
    log.info("get wx auth code");
    const code = await wxService.getAuthCode();
    ctx.response.body = {
      success: true,
      code,
    };
  } catch (error) {
    log.error(error instanceof Error ? error.stack : String(error));
    ctx.response.status = 500;
    ctx.response.body = {
      error: error instanceof Error
        ? error.message
        : "An unknown error occurred",
    };
  }
});

// 微信登录
wxRouter.post("/login", async (ctx) => {
  try {
    log.info("wx login");
    const { code } = await ctx.request.body().value;
    const userInfo = await wxService.login(code);
    ctx.response.body = {
      success: true,
      data: userInfo,
    };
  } catch (error) {
    log.error(error instanceof Error ? error.stack : String(error));
    ctx.response.status = 500;
    ctx.response.body = {
      error: error instanceof Error
        ? error.message
        : "An unknown error occurred",
    };
  }
});

// 获取用户信息
wxRouter.get("/user/profile", async (ctx) => {
  try {
    log.info("get user profile");
    const userProfile = await wxService.getUserProfile();
    ctx.response.body = {
      success: true,
      data: userProfile,
    };
  } catch (error) {
    log.error(error instanceof Error ? error.stack : String(error));
    ctx.response.status = 500;
    ctx.response.body = {
      error: error instanceof Error
        ? error.message
        : "An unknown error occurred",
    };
  }
});

export default wxRouter;
