/**
 * 主入口文件
 */
import { Context, Random, Schema, segment } from 'koishi'
import { Config } from './config';
import { version } from "../package.json";

import * as draw  from "./draw/index";
import * as cat from "./cat/index";
import * as quiz from "./quiz/index";
import { At } from './common/at';
// 插件名称
export const name = 'cafe-bot-exp'

export * from "./config";

export const inject ={
    required: ['http','cache', 'database'],
    optional: ['logger']
};



export async function apply(ctx: Context,config: Config) {
    
    ctx.plugin(draw,config);
    ctx.plugin(quiz,config);
    ctx.plugin(cat,config);
    
    ctx.command("关于", "about").action(async (argv, _) => {
        argv.session?.send(
`<img src="https://www.azimiao.com/wp-content/uploads/2025/05/cafe-wide.jpg"/>
${At(argv)}Hi~我是轨迹CafeBot概念版v${version}🎉~
我运行在🖥️超级计算机『卡佩尔』上🛜
🔹 我提供轨迹抽卡🎴和轨迹问答🙋‍功能
🔹 另外我还有一些隐藏功能待你探索哦🎁
我还在成长中，多多与我聊天吧~`);
    });
}