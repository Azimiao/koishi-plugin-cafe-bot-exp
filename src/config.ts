import { Schema } from "koishi";

import { CafeBotDrawConfig } from "./draw/config";

import { CafeBotQuizConfig } from "./quiz/config";

import { CafeBotCatConfig } from "./cat/config";

export interface CafeBotConfig{
    logoUrl: string,
    refreshLogoWhenLoad: boolean,
    useLocalLogoFile:boolean,
}

export type Config = CafeBotConfig & CafeBotDrawConfig & CafeBotQuizConfig & CafeBotCatConfig;

export const Config: Schema<Config> = Schema.intersect([
    Schema.object({
        logoUrl: Schema.string().description("LOGO图片").default("https://www.azimiao.com/wp-content/uploads/2025/05/cafe-wide.jpg"),
        refreshLogoWhenLoad: Schema.boolean().description("每次加载插件强制刷新 LOGO 图片").default(false),
        useLocalLogoFile: Schema.boolean().description("使用本地存储的 LOGO 图片(目前 QQ 平台不可用)").default(false),
    }),
    CafeBotDrawConfig.collapse(),
    CafeBotQuizConfig.collapse(),
    CafeBotCatConfig.collapse()
]);