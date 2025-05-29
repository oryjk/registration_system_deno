export interface MonthDate {
    month: string;
    count: number;
    dates: { date: Date, id: string }[];
}


export const groupByYearMonth = (matchDates: { date: Date, id: string }[]): MonthDate[] => {
    const monthDates = matchDates.reduce((acc, matchDate) => {
        const month = matchDate.date.toLocaleString('default', {
            year: 'numeric',
            month: 'long'
        });
        if (!acc[month]) {
            acc[month] = [];
        }
        acc[month].push(matchDate);
        acc[month].sort((a, b) => a.date.getTime() - b.date.getTime());
        return acc;
    }, {} as { [key: string]: { date: Date, id: string }[] });

    const sortedArray = Object.entries(monthDates)
        .sort(([monthA], [monthB]) => {
            // 将月份字符串转换为 Date 对象进行比较
            // 提取年份（如 "2023"）
            const yearA = parseInt(monthA.split('年')[0]);
            const yearB = parseInt(monthB.split('年')[0]);

            // 提取月份（如 "1月" → 1）
            const monthAIndex = parseInt(monthA.split('年')[1].replace('月', ''));
            const monthBIndex = parseInt(monthB.split('年')[1].replace('月', ''));

            return yearA === yearB
                ? monthAIndex - monthBIndex
                : yearA - yearB;
        })
        .map(([month, dates]) => ({
            month,
            dates,
            count: dates.length
        }));

    return sortedArray
}