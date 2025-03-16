import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";

// 数据库配置
const config = {
    hostname: "127.0.0.1",
    port: 3307,
    username: "root",
    password: "beifa888",
    db: "registration_system",
    poolSize: 10  // 连接池大小
};

// 创建连接池
class DatabasePool {
    private static instance: DatabasePool;
    public client: Promise<Client>;

    private constructor() {
        this.client = new Client().connect(config);
    }

    public static getInstance(): DatabasePool {
        if (!DatabasePool.instance) {
            DatabasePool.instance = new DatabasePool();
        }
        return DatabasePool.instance;
    }

   

    // 获取连接
    getConnection(): Promise<Client> {
        return this.client;
    }

    // 执行查询
    async query(sql: string, params?: any[]): Promise<any> {
        const connection = await this.getConnection();
        return await connection.query(sql, params);

    }
}

// 导出数据库实例
export const db = DatabasePool.getInstance();