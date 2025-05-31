import { db } from "../db/mysql.ts";
import { ActivityService } from "../service/activity_service.ts";
import { UserService } from "../service/user_service.ts";
import { Activity, ActivityOrder, UserActivityStand } from "../types/activity.ts";
import { UserInfo } from "../types/user.ts";
import { groupByYearMonth } from "../utils/date_utils.ts";
import log from "../utils/logger.ts";

// 定义返回结果的类型

enum BillingType {
    NormalSeduction = 1,
    Fine = 2
}
interface UserActivityBilling {
    activity_id: string;
    activity_time: Date; // 假设活动时间字段名为 activity_time
    user_billing: {
        user_id: number;
        fee: number;
        status: number; // 假设参赛状态字段名为 status
        billing_type: BillingType; // 假设结算时间字段名为 billing_time
    }[];
}

export class UserOrderUseCase {
    constructor(private activityService: ActivityService, private userService: UserService) {
    }

    async calculateAllActivitiesBilling(startDate: Date): Promise<Map<string, {
        user_id: number;
        fee: number;
        status: number;
        billing_type: BillingType;
    }[]>> {
        const userInfos = await this.userService.getAllUsersInfo()
        const allActivities = await this.activityService.getActivities()
        const allDate = allActivities.map((activity) => {
            return {
                date: new Date(activity.holding_date),
                id: activity.id!
            };
        })
        const yearMonth = groupByYearMonth(allDate);

        const allBillings = allActivities.filter((activity) => {
            return activity.holding_date > startDate;
        }).map(async (activity) => {
            const activityBilling = await this.calculateActivityBilling(activity, userInfos.data);
            return { id: activityBilling?.activity_id, billing: activityBilling };
        });

        const billingMap = await Promise.all(allBillings).then((billings) => {
            return billings.reduce((acc, billing) => {
                if (billing) {
                    acc.set(billing.id!, billing.billing!);
                }
                return acc;
            }, new Map<string, UserActivityBilling>)
        });

        const monthFines = yearMonth.reduce((acc, month) => {
            const userNotParticipate = month.dates.reduce((acc, date) => {
                const id = date.id;
                billingMap.get(id)?.user_billing.filter((userBilling) => {
                    return userBilling.status != 1;
                }).forEach((userBilling) => {
                    if (acc.has(userBilling.user_id)) {
                        acc.set(userBilling.user_id, acc.get(userBilling.user_id)! + 1);
                    } else {
                        acc.set(userBilling.user_id, 1);
                    }
                });
                return acc;
            }, new Map<number, number>);

            acc.set(month.month, []);
            userNotParticipate.forEach((value, key) => {
                if (value > 2) {
                    acc.get(month.month)?.push({
                        user_id: key,
                        fee: 100,
                        status: 4,
                        billing_type: 2,
                    });
                    return;
                }
                if (value > 1) {
                    acc.get(month.month)?.push({
                        user_id: key,
                        fee: 50,
                        status: 4,
                        billing_type: 2,
                    });
                    return;
                }
            });
            return acc;
        }, new Map<string, {
            user_id: number;
            fee: number;
            status: number;
            billing_type: BillingType;
        }[]>);

        return monthFines

    }

    async calculateActivityBilling(activity: Activity, userInfos: UserInfo[]): Promise<UserActivityBilling | null> {
        const userStands = await this.activityService.getActivityUserStand(activity.id!).then((userStand) => {
            return userStand.reduce((acc, item) => {
                const userId = item.user_id;
                if (!acc.get(userId)) {
                    acc.set(userId, item);
                }
                return acc;
            }, new Map<number, UserActivityStand>);
        })

        const needCalculateUsers = userInfos.filter((user) => {
            return user.create_time < activity.holding_date;
        })
        
        if (activity.status === 3) {
            console.log(`当前比赛${activity.name} ${new Date(activity.holding_date).toLocaleString()} 取消或者未成型，算作队员都是出勤状态`);
            const userBilling = (needCalculateUsers).map((user) => {
                return {
                    user_id: user.id,
                    fee: 0,
                    status: 1,
                    billing_type: 1,
                };

            })
            return {
                activity_id: activity.id!,
                activity_time: activity.holding_date,
                user_billing: userBilling
            };
        }
        // 查询比赛订单信息，获取费用和参赛状态
        const activityOrders: ActivityOrder[] = await db.query(
            "SELECT activity_id,description, fee, total,create_time ,activity_holding_time FROM rs_activity_order WHERE activity_id = ?",
            [activity.id!],
        );

        if (activityOrders.length === 0) {
            log.warning(`未找到比赛订单信息：activityId=${activity.id}`);
            return null; // 或者返回一个空的用户账单列表，取决于具体需求
        }

        const activityOrder = activityOrders[0];

        const userBilling = (needCalculateUsers).map((user) => {
            if (userStands.has(user.id)) {
                const userStand = userStands.get(user.id)
                switch (userStand!.stand) {
                    case 1:
                        return {
                            user_id: userStand!.user_id,
                            fee: activityOrder.fee,
                            status: userStand!.stand,
                            billing_type: 1,
                        };
                    case 2:
                        return {
                            user_id: userStand!.user_id,
                            fee: 0,
                            status: userStand!.stand,
                            billing_type: 1,
                        };
                    case 3:
                        return {
                            user_id: userStand!.user_id,
                            fee: 0,
                            status: userStand!.stand,
                            billing_type: 1,
                        };
                    default:
                        console.log(`未知的参赛状态：${userStand!.stand}`);
                        return {
                            user_id: userStand!.user_id,
                            fee: 0,
                            status: 3,
                            billing_type: 1,
                        };
                }

            } else {
                return {
                    user_id: user.id,
                    fee: 0,
                    status: 3,
                    billing_type: 1,
                };
            }
        })

        return {
            activity_id: activity.id!,
            activity_time: activity.holding_date,
            user_billing: userBilling,
        };
    }
}