import * as log from "https://deno.land/std@0.208.0/log/mod.ts";

// 颜色代码
const colors = {
  // 日志级别颜色
  debug: "\x1b[36m", // 青色
  info: "\x1b[32m", // 绿色
  warning: "\x1b[33m", // 黄色
  error: "\x1b[31m", // 红色
  // 其他元素颜色
  time: "\x1b[34m", // 蓝色
  message: "\x1b[37m", // 白色
  reset: "\x1b[0m", // 重置颜色
};

// 确保日志目录存在
// try {
//   await Deno.mkdir("./logs", { recursive: true });
// } catch (error) {
//   if (!(error instanceof Deno.errors.AlreadyExists)) {
//     throw error;
//   }
// }

// 自定义格式化器
const formatter = ({ datetime, levelName, msg }: log.LogRecord): string => {
  const levelColor = colors[levelName.toLowerCase() as keyof typeof colors] ||
    colors.reset;

  // 获取调用栈信息
  const stack = new Error().stack?.split("\n")[2] || "";
  const fileInfo = stack.match(/at (.+) \((.+):(\d+):(\d+)\)/) ||
    stack.match(/at (.+):(\d+):(\d+)/);

  // 提取文件名和函数名
  const functionName = fileInfo?.[1] || "anonymous";
  const fileName = fileInfo?.[2]?.split("/").pop() || "unknown";

  return `${colors.time}[${datetime.toISOString()}]${colors.reset} ${levelColor}${levelName}${colors.reset} [${fileName}:${functionName}] ${colors.message}${msg}${colors.reset}`;
};

// 配置日志
log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("INFO", {
      formatter,
    }),
    // file: new log.handlers.FileHandler("INFO", {
    //   filename: "./logs/app.log",
    //   formatter: "{datetime} {levelName} {msg}",
    // }),
  },
  loggers: {
    default: {
      level: "INFO",
      // handlers: ["console", "file"],
      handlers: ["console"],
    },
  },
});

export default log;
