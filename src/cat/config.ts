import { Schema } from "koishi";

export interface CafeBotCatConfig {
    catName :string,
}

export const CafeBotCatConfig = Schema.object({
    catName: Schema.string().description("名称/占位").default("柯贝")
}).description("猫猫配置");