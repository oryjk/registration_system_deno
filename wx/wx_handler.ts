import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { WxService } from "../service/wx_service.ts";
import log from "../utils/logger.ts";

const wxRouter = new Router({
  prefix: "/wx",
});
const wxService = new WxService();

wxRouter.get("/getAccessToken", async (ctx) => {
  log.info("get access token");
  const result = await wxService.getAccessToken();
  ctx.response.body = result;
});

wxRouter.get("/getPhoneNumber", async (ctx) => {
  log.info("get phone number");
  const { code } = await ctx.request.body().value;
  const result = await wxService.getPhoneNumber(code);
  ctx.response.body = result;
});

export default wxRouter;