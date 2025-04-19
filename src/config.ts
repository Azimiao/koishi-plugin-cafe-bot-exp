import { Schema } from "koishi";

import { CafeBotDrawConfig } from "./draw/config";

import { CafeBotQuizConfig } from "./quiz/config";

import { CafeBotCatConfig } from "./cat/config";

export type Config = CafeBotDrawConfig & CafeBotQuizConfig & CafeBotCatConfig;

export const Config: Schema<Config> = Schema.intersect([
    CafeBotDrawConfig.collapse(),
    CafeBotQuizConfig.collapse(),
    CafeBotCatConfig.collapse()
]);