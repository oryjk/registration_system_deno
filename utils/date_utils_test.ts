import { groupByYearMonth } from "./date_utils.ts";

Deno.test("group month", async (t) => {
    function generateRandomDate(start: Date, end: Date): { date: Date, id: string } {
        const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
        return { date: new Date(randomTime), id: Math.floor(Math.random() * 10001).toString() };
    }

    // 生成 20 个 2023 年的随机日期
    const dates: { date: Date, id: string }[] = Array.from({ length: 20 }, () => {
        const start = new Date('2023-01-01');
        const end = new Date('2023-12-31');
        return generateRandomDate(start, end);
    });

    const monthDates = groupByYearMonth(dates);
    console.log(monthDates)
});