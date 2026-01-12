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
    qqQuizMDTextID: string,
    qqQuizMDImgID: string,
    qqQuizButtonID: string,
    appendMDBtn: boolean,
    imgWidth:number,
    imgHeight:number,
    disableDriectMD:boolean,
    disableDirectMDReply:string,
    disableMDAt:boolean,
    useReDefine:boolean,
    insertBeforeAt:string,
}

export const CafeBotQuizConfig : Schema<CafeBotQuizConfig> = Schema.object({
    baseQuizUrl: Schema.string().description("答题列表 Url").default("https://www.azimiao.com/quiz.json"),
    forceUpdateWhenLoad:Schema.boolean().description("插件加载时强制更新题目列表").default(false),
    answerTimeout:Schema.number().description("回答超时时间(秒)").default(300),
    maxQuizPerDay: Schema.number().description("每日单人最大答题数").default(5),
    redisServer: Schema.string().description("redis服务器地址"), // TODO: 计划: 分数存储使用 sqlite, 临时数据(如当前题目)用内存就行了?
    redisAuth: Schema.string().description("redis服务器密码"),
    qqQuizMDTextID: Schema.string().description("QQ markdown 纯本文模板ID"),
    qqQuizMDImgID: Schema.string().description("QQ markdown 题目带图模板ID"),
    qqQuizButtonID: Schema.string().description("QQ按钮ID"),
    appendMDBtn: Schema.boolean().description("是否追加QQ按钮").default(false),
    imgWidth: Schema.number().description("QQ图像宽度").default(0),
    imgHeight: Schema.number().description("QQ图像高度").default(0),
    disableDriectMD: Schema.boolean().description("j禁用私聊 MD 回复").default(true),
    disableDirectMDReply: Schema.string().default("暂不支持私聊回复哦，请从群聊@我吧"),
    disableMDAt: Schema.boolean().description("在md回复中禁用@").default(false),
    useReDefine: Schema.boolean().description("test").default(false),
    insertBeforeAt: Schema.string().description("在@前插入的字符串").default("用户"),
}).description("答题配置");