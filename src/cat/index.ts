/**
 * 黑猫柯贝
 */
import { Context, Random, Schema, segment } from 'koishi'
import { CafeBotCatConfig } from './config';
import { At } from '../at';

export const name = 'cafe-bot-exp.cat';

export interface Config extends CafeBotCatConfig{};
export const Config: Schema<Config> = CafeBotCatConfig;

const catWords = [
    "喵呀呜～ ",
    "喵呀～呵", // 走这边。（带路时）
    "喵呀～～噢", // 说得没错。就是这样。
    "喵呀～嘎～", // 高兴的表现。
    "喵呀～～呵", // 稍等一下。（引起注意）
    "喵嘎", // 爪子痒痒了。（焦躁不安）
    "喵嘎～～ ", // 肚子饿了。
    "喵嘎呜～～", // 警戒的表现。
    "喵呜", // 困了。乏了。累了。
    "喵呜？", // 您是哪位？
    "喵呜—", // 是的。
    "喵噢？", // 怎么了？
    "喵—噢", // 呦，又见面了。 （短期内再会时的招呼）
    "喵—呵", // 好久不见了。还好吗？
    "喵～呜", // 再见
    "喵～噢", // 是，就是这样。（强烈肯定）
    "喵～～呵", // 你好。
    "呜咪嘎～ ", // 打哈欠。
    "咪呜？", // 你说什么？（听到坏话反问的语气）
    "咪～呜 ", // 肚子饿了。（幼猫语）
    "咪～～呵" // 对不起
];


export async function apply(ctx: Context) {

    ctx.command("黑猫柯贝/摸猫", "摸摸柯贝").action(async (argv, _) => {
        const random = new Random(() => Math.random());
        let catWord = random.pick(catWords);
        argv.session?.send(`${At(argv)}🐱:${catWord}`);
    });
}