export function add(a: number, b: number): number {
  return a + b;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log("Add 2 + 3 =", add(2, 3));
  console.log("开始执行");

  // Promise异步操作
  Promise.resolve().then(() => {
    console.log("Promise 1");
  });

  // 定时器异步操作
  setInterval(() => {
    console.log("定时器");
  }, 1000);

  // 立即执行的微任务
  queueMicrotask(() => {
    console.log("微任务");
  });

  // Promise链式操作
  Promise.resolve()
    .then(() => {
      console.log("Promise 2");
    })
    .then(() => {
      console.log("Promise 3");
    });

  console.log("结束执行");
}
