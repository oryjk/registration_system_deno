import {db} from "../db/mysql.ts";
import {ActivityService} from "../service/activity_service.ts";
import {UserService} from "../service/user_service.ts";
import {Activity, ActivityOrder, UserActivityStand,} from "../types/activity.ts";
import {UserInfo} from "../types/user.ts";
import {groupByYearMonth} from "../utils/date_utils.ts";
import log from "../utils/logger.ts";

// 定义返回结果的类型

enum BillingType {
  NormalSeduction = 1,
  Fine = 2,
}

interface UserBilling {
  user_id: number;
  fee: number;
  status: number; // 假设参赛状态字段名为 status
  billing_type: BillingType; // 假设结算时间字段名为 billing_time
}
interface UserActivityBilling {
  activity_id: string;
  activity_time: Date; // 假设活动时间字段名为 activity_time
  total: number;
  user_billing: UserBilling[];
}

export class UserOrderUseCase {
  constructor(
    private activityService: ActivityService,
    private userService: UserService,
  ) {
  }

  async getUserOrders(startDate: Date): Promise<{
    userBalance: Map<number, number>;
    userActivityBillings: Map<number, Record<string, UserBilling>>;
  }> {
    const userInfos = await this.userService.getAllUsersInfo();
    const userBalance = userInfos.data.reduce((acc, user) => {
      acc.set(user.id, 400);
      return acc;
    }, new Map<number, number>());

    const allActivities = await this.activityService.getActivities();
    const allBillings = allActivities.filter((activity) => {
      return activity.holding_date > startDate;
    }).map(async (activity) => {
      const activityBilling = await this.calculateActivityBilling(
        activity,
        userInfos.data,
      );
      return { id: activityBilling?.activity_id, billing: activityBilling };
    });
    const awaitAllBillings = await Promise.all(allBillings);

    const userActivityBillings = userInfos.data.reduce(
      (acc, user) => {
        let userId = user.id;
        if (!acc.has(userId)) {
          acc.set(userId, {} as Record<string, UserBilling>);
        }

        awaitAllBillings.forEach((activity) => {
          if (activity.billing) {
            let userBilling = activity.billing.user_billing.find((
              userBilling,
            ) => userBilling.user_id == user.id);
            if (userBilling && activity.id && acc.get(userId)) {
              acc.get(userId)![activity.id] = userBilling;
            }
          } else {
            console.log(`当前比赛的订单信息为空 ${activity.id}`);
          }
        });

        return acc;
      },
      new Map<number, Record<string, UserBilling>>(),
    );

    return { userBalance, userActivityBillings };
  }

  /**
   * 计算所有活动的账单信息。
   * 该方法会查询从指定日期开始的所有活动订单，并计算每个用户在每个活动中的扣费。
   * @param startDate 查询的起始日期。
   * @returns 一个 Map，键为 "yyyy-mm" 格式的字符串（代表某年某月），值为一个对象。该对象包含两个属性：
   *          - `finds`: 代表本月的罚款总额。
   *          - `billings`: 一个数组，包含这个月每场比赛的订单信息，每个订单包括比赛信息和每个人的费用。
   */
  async calculateAllActivitiesBilling(startDate: Date): Promise<
    Map<string, {
      finds: {
        user_id: number;
        fee: number;
        status: number;
        billing_type: BillingType;
      }[];
      billings: UserActivityBilling[];
    }>
  > {
    const userInfos = await this.userService.getAllUsersInfo();
    const allActivities = await this.activityService.getActivities();
    const allDate = allActivities.map((activity) => {
      return {
        date: new Date(activity.holding_date),
        id: activity.id!,
      };
    });
    const yearMonth = groupByYearMonth(allDate);

    const allBillings = allActivities.filter((activity) => {
      return activity.holding_date > startDate;
    }).map(async (activity) => {
      const activityBilling = await this.calculateActivityBilling(
        activity,
        userInfos.data,
      );
      return { id: activityBilling?.activity_id, billing: activityBilling };
    });

    const billingMap = await Promise.all(allBillings).then((billings) => {
      return billings.reduce((acc, billing) => {
        if (billing && billing.id && billing.billing) {
          acc.set(billing.id, billing.billing);
        }
        return acc;
      }, new Map<string, UserActivityBilling>());
    });

    const monthFines = yearMonth.reduce(
      (acc, month) => {
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
        }, new Map<number, number>());

        acc.set(month.month, []);
        userNotParticipate.forEach((value, key) => {
          if (value > 3) {
            acc.get(month.month)?.push({
              user_id: key,
              fee: 100,
              status: 4,
              billing_type: 2,
            });
            return;
          }
          if (value > 2) {
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
      },
      new Map<string, {
        user_id: number;
        fee: number;
        status: number;
        billing_type: BillingType;
      }[]>(),
    );

    const result = yearMonth.reduce(
      (acc, month) => {
        acc.set(month.month, {
          finds: monthFines.get(month.month)!,
          billings: [],
        });
        month.dates.forEach((date) => {
          const id = date.id;
          const billing = billingMap.get(id);
          if (billing) {
            acc.get(month.month)!.billings.push(billing);
          }
        });

        return acc;
      },
      new Map<string, {
        finds: {
          user_id: number;
          fee: number;
          status: number;
          billing_type: BillingType;
        }[];
        billings: UserActivityBilling[];
      }>(),
    );

    return result;
    // return { monthFines: monthFines, billingMap: billingMap }
  }

  async calculateActivityBilling(
    activity: Activity,
    userInfos: UserInfo[],
  ): Promise<UserActivityBilling | null> {
    const userStands = await this.activityService.getActivityUserStand(
      activity.id!,
    ).then((userStand) => {
      return userStand.reduce((acc, item) => {
        const userId = item.user_id;
        if (!acc.get(userId)) {
          acc.set(userId, item);
        }
        return acc;
      }, new Map<number, UserActivityStand>());
    });

    const needCalculateUsers = userInfos.filter((user) => {
      return user.create_time < activity.holding_date;
    });

    if (activity.status === 3) {
      console.log(
        `当前比赛${activity.name} ${
          new Date(activity.holding_date).toLocaleString()
        } 取消或者未成型，算作队员都是出勤状态`,
      );
      const userBilling = needCalculateUsers.map((user) => {
        return {
          user_id: user.id,
          fee: 0,
          status: 1,
          billing_type: 1,
        };
      });
      return {
        activity_id: activity.id!,
        activity_time: activity.holding_date,
        total: 0,
        user_billing: userBilling,
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

    const userBilling = needCalculateUsers.map((user) => {
      if (userStands.has(user.id)) {
        const userStand = userStands.get(user.id);
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
    });

    return {
      activity_id: activity.id!,
      activity_time: activity.holding_date,
      total: activityOrder.total,
      user_billing: userBilling,
    };
  }
}
