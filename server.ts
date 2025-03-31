import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import userRouter from "./user/user_handler.ts";
import activityRouter from "./activity/activity_handler.ts";
import wxRouter from "./wx/wx_handler.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

const app = new Application();
const router = new Router({
    prefix: "/apid",
});

// 路由配置
router.get("/", (ctx) => {
    ctx.response.body = "Welcome to Registration System";
});

//添加子路由
router.use(userRouter.routes());
router.use(activityRouter.routes());
router.use(wxRouter.routes());

// 注册中间件
app.use(oakCors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true
}));
// 添加404错误处理中间件
app.use(async (ctx, next) => {
    try {
        await next();
        if (ctx.response.status === 404) {
            ctx.response.body = {
                status: 404,
                message: `接口 ${ctx.request.url} 不存在`
            };
        }

    } catch (err) {
        ctx.response.status = 500;
        ctx.response.body = {
            status: 500,
            message: err instanceof Error ? err.message : "服务器内部错误"
        };
    }
});

app.use(router.routes());
app.use(router.allowedMethods());

// 启动服务器
const port = 8000;
console.log(`Server running on http://localhost:${port}/apid`);
await app.listen({ port });