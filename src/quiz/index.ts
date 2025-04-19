/**
 * 轨迹答题
 */
import { Context, Random, Schema, segment } from 'koishi'
import { CafeBotQuizConfig } from './config';

import { At } from '../common/at';

export const name = 'cafe-bot-exp.quiz';
export const inject = ['http'];
export interface Config extends CafeBotQuizConfig { };
export const Config: Schema<Config> = CafeBotQuizConfig;

const validOptions = {
    'A': 0, 'B': 1, 'C': 2, 'D': 3,
    'a': 0, 'b': 1, 'c': 2, 'd': 3,
    '1': 0, '2': 1, '3': 2, '4': 3
};

export async function apply(ctx: Context, config: Config) {

    ctx.command("轨迹答题/出题").action(async (argv, _) => {
        await argv.session?.send("开发中");
        return;
    });
   
    ctx.command("轨迹答题/回答 <answer:text>", `使用"回答+选项"回答问题，如"回答 A"`).action(async (argv, answer) => {
        await argv.session?.send("开发中");
        return;

        let selectNumber = -1;
        if (answer in validOptions) {
            selectNumber = validOptions[answer];
        } else {
            argv.session?.send(`${At(argv)}回答错误~`);
        }
    });
}