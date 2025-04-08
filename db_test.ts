import { db } from "./db/mysql.ts";

async function testPoolSize() {
  console.time("总执行时间");

  // 模拟耗时查询
  const slowQuery = async () => {
    // 使用 SLEEP 函数模拟耗时操作
    db.query("SELECT * from rs_user_info");
    return await db.query("SELECT SLEEP(2)");
  };

  // 执行多个查询
  const queries = [
    slowQuery().then(() => console.log("查询1完成")),
    slowQuery().then(() => console.log("查询2完成")),
    slowQuery().then(() => console.log("查询3完成")),
    slowQuery().then(() => console.log("查询4完成")),
    slowQuery().then(() => console.log("查询5完成")),
    slowQuery().then(() => console.log("查询6完成")),
    slowQuery().then(() => console.log("查询7完成")),
    slowQuery().then(() => console.log("查询8完成")),
    slowQuery().then(() => console.log("查询9完成")),
    slowQuery().then(() => console.log("查询10完成")),
  ];

  await Promise.all(queries);
  console.timeEnd("总执行时间");
}

// 分别测试不同连接池大小
async function runTest() {
  console.log("连接池大小为1的测试：");
  // 设置连接池大小为1
  await testPoolSize();

  console.log("连接池大小为3的测试：");
  // 设置连接池大小为3
  await testPoolSize();
}

runTest();
