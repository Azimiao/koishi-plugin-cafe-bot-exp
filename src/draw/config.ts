/**
 * 轨迹抽卡配置
 */
import { Schema } from "koishi";

export interface CafeBotDrawConfig {
    baseDataUrl: string,
    ImageServer: string,
    ImageServerAuth: string,
    MinCount: number,
    MaxCount: number,

    Star1Name: string,
    Star1Chance: number,

    Star2Name: string,
    Star2Chance: number,

    Star3Name: string,
    Star3Chance: number,

    Star4Name: string,
    Star4Chance: number,

    Star5Name: string,
    Star5Chance: number
}

export const CafeBotDrawConfig : Schema<CafeBotDrawConfig> = Schema.object({
    baseDataUrl: Schema.string().description("数据链接").default("https://www.azimiao.com/kiseki.json"),

    ImageServer: Schema.string().description("图像生成服务器").default("http://127.0.0.1:3000/screenshot"),
    ImageServerAuth: Schema.string().description("图像生成服务器密码").default(""),

    MinCount: Schema.number().description("最小抽取次数").default(0),
    MaxCount: Schema.number().description("最大抽取次数").default(8),

    Star1Name: Schema.string().description("1星名称").default("N"),
    Star1Chance: Schema.number().description("1星概率").default(0.5),

    Star2Name: Schema.string().description("2星名称").default("R"),
    Star2Chance: Schema.number().description("2星概率").default(0.34),

    Star3Name: Schema.string().description("3星名称").default("SR"),
    Star3Chance: Schema.number().description("3星概率").default(0.22),

    Star4Name: Schema.string().description("4星名称").default("SSR"),
    Star4Chance: Schema.number().description("4星概率").default(0.12),

    Star5Name: Schema.string().description("5星名称").default("UR"),
    Star5Chance: Schema.number().description("5星概率").default(0.04)
}).description("抽卡配置");