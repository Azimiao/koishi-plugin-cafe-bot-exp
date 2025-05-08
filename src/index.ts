/**
 * 主入口文件
 */
import { Context, Logger, Random, Schema, segment } from 'koishi'
import { pathToFileURL } from 'url';
import { resolve } from 'path';
import { Config } from './config';
import { version } from "../package.json";
import '@koishijs/censor';

import * as fs from 'fs/promises';
import * as path from 'path';

import * as draw from "./draw/index";
import * as quiz from "./quiz/index";
import * as cat from "./cat/index";
import downloadFileIfNotExist from './common/downloadTool';

// 插件名称
export const name = 'cafe-bot-exp'

export * from "./config";

export const plugins = [draw, quiz, cat];

export const inject = {
    required: Array.from(new Set([...draw.injectDepend.required,...quiz.injectDepend.required,...cat.injectDepend.required])),
    optional: Array.from(new Set([...draw.injectDepend.optional,...quiz.injectDepend.optional,...cat.injectDepend.optional])),
};



let logger: Logger = null;
let logoFilePath = null;

export async function apply(ctx: Context, config: Config) {

    logger = ctx.logger(name);

    ctx.plugin(draw, config);
    ctx.plugin(quiz, config);
    ctx.plugin(cat, config);

    const root = path.join(ctx.baseDir, 'data', `${name}-data`);
    await fs.mkdir(root, { recursive: true });
    logoFilePath = path.join(root, 'logo.jpg');

    logger?.info(`Try check logoFile ${logoFilePath} or download it, forceUpdate:${config.refreshLogoWhenLoad}`);

    var result = await downloadFileIfNotExist(ctx.http, config.logoUrl, logoFilePath, config.refreshLogoWhenLoad);

    logger?.info(`download file ${result ? "ok" : "failed"}`);

    ctx.command("关于", "关于本机器人的信息").action(async (argv, _) => {
        argv.session?.send(
            `<img src="${config.useLocalLogoFile ? pathToFileURL(logoFilePath).href : config.logoUrl}"/>
Hi~我是轨迹CafeBot概念版v${version}🎉~
我运行在🖥️超级计算机『卡佩尔』上🛜
🔹 我提供轨迹抽卡🎴和轨迹问答🙋‍功能
🔹 另外我还有一些隐藏功能待你探索哦🎁
我还在成长中，多多与我聊天吧~`);
    });
}