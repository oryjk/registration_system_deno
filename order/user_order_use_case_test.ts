import { ActivityService } from "../service/activity_service.ts";
import { UserService } from "../service/user_service.ts";
import { UserOrderUseCase } from "./user_order_use_case.ts";

Deno.test("query user performance", async (t) => {
    const acticityService = new ActivityService()
    const activity = await acticityService.getActivityById("e3766899-ecc0-48a7-aa0e-dfba7de31be5")

    const userService = new UserService()
    const userInfo = await userService.getAllUsersInfo()
    const userOrderUseCase = new UserOrderUseCase(acticityService);
    const billing = await userOrderUseCase.calculateActivityBilling(activity, userInfo.data)
    console.log(billing)
});