import { ActivityService } from "../service/activity_service.ts";
import { UserService } from "../service/user_service.ts";
import { UserInfo } from "../types/user.ts";
import { UserOrderUseCase } from "./user_order_use_case.ts";

Deno.test("query user performance", async (t) => {
    const acticityService = new ActivityService()
    const activity = await acticityService.getActivityById("e3766899-ecc0-48a7-aa0e-dfba7de31be5")
    // const activity = await acticityService.getActivityById("2736ab53-18b3-4ad0-98f6-b6e45c988306")

    const userService = new UserService()
    const userInfo = await userService.getAllUsersInfo()
    const userOrderUseCase = new UserOrderUseCase(acticityService, userService);
    const billing = await userOrderUseCase.calculateActivityBilling(activity, userInfo.data)
    // console.log(JSON.stringify(billing))
    console.log(billing)
    console.log(billing?.user_billing.length)
});

Deno.test("async test", async () => {
    const activityService = new ActivityService()
    const userService = new UserService()
    const userOrderUseCase = new UserOrderUseCase(activityService, userService);
    const userInfos = await userService.getAllUsersInfo()
    const userInfoObject = userInfos.data.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
    }, {} as Record<number, UserInfo>);
    const billing = await userOrderUseCase.calculateAllActivitiesBilling(new Date("2024-01-01"))
    console.log(billing)
});