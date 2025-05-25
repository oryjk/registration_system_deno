# 活动报名系统

这是一个基于 Deno 和 Oak
框架开发的活动报名系统，主要用于管理活动和用户报名信息。

## 功能特性

- 活动创建、查询、更新和删除
- 用户报名状态管理
- 活动状态管理
- 批量操作支持

## 技术栈

- [Deno](https://deno.land/) - JavaScript/TypeScript 运行时
- [Oak](https://oakserver.github.io/oak/) - Web 框架
- [MySQL](https://www.mysql.com/) - 数据库

## 快速开始

1. 克隆项目
   ```bash
   git clone https://github.com/yourusername/registration_system_deno.git
   ```

## 如何启动

deno run --allow-net --allow-env --allow-read server.ts

## 项目结构

registration_system_deno/ ├── activity/ # 活动相关模块 ├── user/ # 用户相关模块
├── utils/ # 工具类 ├── server.ts # 服务入口 └── .env.example # 环境变量示例
