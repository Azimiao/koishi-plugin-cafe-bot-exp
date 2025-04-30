/**
 * 主入口文件
 */
import { Context, Random, Schema, segment, version } from 'koishi'

import { Config } from './config';

import * as draw  from "./draw/index";
import * as cat from "./cat/index";
import * as quiz from "./quiz/index";
// 插件名称
export const name = 'cafe-bot-exp'

export * from "./config";

export const inject = ['http','cache'];



export async function apply(ctx: Context,config: Config) {
    
    ctx.plugin(draw,config);
    ctx.plugin(quiz,config);
    ctx.plugin(cat,config);
    
    ctx.command("关于", "about").action(async (argv, _) => {
        argv.session?.send(`我是轨迹Cafe群聊机器人概念版~`);
    });
}
