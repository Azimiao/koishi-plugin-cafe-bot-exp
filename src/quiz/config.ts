/**
 * 轨迹答题配置
 */
import { Schema } from "koishi";

export interface CafeBotQuizConfig {
    baseQuizUrl: string,
    forceUpdateWhenLoad:boolean,
    answerTimeout:number,
    maxQuizPerDay: number,
    redisServer: string,
    redisAuth: string,
}

export const CafeBotQuizConfig : Schema<CafeBotQuizConfig> = Schema.object({
    baseQuizUrl: Schema.string().description("答题列表 Url").default("https://www.azimiao.com/quiz.json"),
    forceUpdateWhenLoad:Schema.boolean().description("插件加载时强制更新题目列表").default(false),
    answerTimeout:Schema.number().description("回答超时时间(秒)").default(300),
    maxQuizPerDay: Schema.number().description("每日单人最大答题数").default(5),
    redisServer: Schema.string().description("redis服务器地址"), // TODO: 计划: 分数存储使用 sqlite, 临时数据(如当前题目)用内存就行了?
    redisAuth: Schema.string().description("redis服务器密码"),
}).description("答题配置");