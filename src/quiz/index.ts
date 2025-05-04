/**
 * 轨迹答题
 */
import { Context, Random, Schema, segment,Logger } from 'koishi';
import {} from '@koishijs/plugin-help';
import {} from '@koishijs/cache';

import { At } from '../common/at';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CafeBotQuizConfig } from './config';
import downloadFileIfNotExist from '../common/downloadTool';
import { DailySeededName } from '../common/DailySeededName';
import CafeTimeTools from '../common/CafeTimeTools';

export const name = 'cafe-bot-exp.quiz';
export const inject = ['http', 'cache', 'logger'];
export interface Config extends CafeBotQuizConfig { };
export const Config: Schema<Config> = CafeBotQuizConfig;

const validOptions = {
    'A': 0, 'B': 1, 'C': 2, 'D': 3,
    'a': 0, 'b': 1, 'c': 2, 'd': 3,
    '1': 0, '2': 1, '3': 2, '4': 3
};

let logger: Logger = null;

let quizDataIds = [];
let quizDataSet = {};

interface QuestionCache {
    question: number,
    answer: number
}

declare module '@koishijs/cache' {
    interface Tables {
        question: QuestionCache,
        todayCache: number
    }
}

async function downloadQuitDataIfNotExist(ctx: Context, config: Config, forceUpdate: boolean) {
    if (!forceUpdate && quizDataIds != null && quizDataIds.length > 0) {
        return;
    }

    const root = path.join(ctx.baseDir, 'data', `${name}-data`)
    await fs.mkdir(root, { recursive: true });
    const quizFilePath = path.join(root, 'quiz.json');

    await downloadFileIfNotExist(ctx.http, config.baseQuizUrl, quizFilePath, forceUpdate);

    var fileContent = await fs.readFile(quizFilePath, "utf-8");
    try {
        var a = JSON.parse(fileContent);
        var quizData = a.filter(item => item.question.t === "MCWithTextOnly");
        quizData.forEach(element => {
            quizDataIds.push(element.question.id);
            quizDataSet[element.question.id] = element;
        });
    } catch (error) {
        logger?.error("get quiz data failed");
        logger?.error(error);
        throw new Error("quiz read error");
    }
    return;
}


async function answerHandler(ctx: Context, config: Config, argv, answer: string) {

    await downloadQuitDataIfNotExist(ctx, config, false);

    var lastQuestion = await ctx.cache.get('question', argv.session.userId);
    if (!lastQuestion) {
        await argv.session?.send("你还未开始答题或已超时哦~");
        return;
    }

    let selectNumber = -1;

    if (answer in validOptions) {
        selectNumber = validOptions[answer];
    } else {
        await argv.session?.send(`${At(argv)}输入选项无效哦，请重新输入~`);
        return;
    }

    await ctx.cache.delete('question', argv.session.userId);

    if (quizDataIds == null || quizDataIds.length <= 0) {
        await argv.session?.send(`${At(argv)}超级计算机『卡佩尔』发生核心故障😵(导力网络异常波动)`);
        return;
    }


    var qItem = quizDataSet[lastQuestion.question];

    logger?.info(`${argv.session.userId} try answer quiz(id:${lastQuestion.question}): right answer:${lastQuestion.answer}, input answer:${selectNumber}`);

    if (qItem && lastQuestion.answer == selectNumber) {
        await argv.session?.send(`${At(argv)}回答正确😊${qItem.explain.length > 0 ? '，' + qItem.explain : ''}`);
        return;
    } else {
        await argv.session?.send(`${At(argv)}回答错误😟${qItem.explain2.length > 0 ? '，' + qItem.explain2 : ''}`);
        return;
    }
}

export async function apply(ctx: Context, config: Config) {

    logger = ctx.logger(name);

    await downloadQuitDataIfNotExist(ctx, config, config.forceUpdateWhenLoad);

    ctx.command("轨迹答题/出题","随机抽一道题目").action(async (argv, _) => {

        await downloadQuitDataIfNotExist(ctx, config, false);

        var lastQuestion = await ctx.cache.get('question', argv.session.userId);
        if (lastQuestion) {
            await argv.session?.send("上一题还没有回答哦~");
            return;
        }

        var dailyNameKey = DailySeededName(argv.session.userId);



        if (quizDataIds == null || quizDataIds.length <= 0) {
            await argv.session?.send(`${At(argv)}超级计算机『卡佩尔』发生核心故障😵(导力网络异常波动)`);
            return;
        }


        var todayCount = await ctx.cache.get('todayCache', dailyNameKey);

        if (!todayCount) {
            todayCount = 0;
        }

        if (todayCount >= config.maxQuizPerDay) {
            await argv.session?.send(`${At(argv)}今日答题已到上限哦~明天再来看看吧❤`);
            return;
        }

        todayCount++;
        var cacheTimeoutTime = CafeTimeTools.getRemainingSecondsToBeijingMidnight();
        
        logger?.debug(`try set cache ${dailyNameKey}, ${todayCount}`);

        await ctx.cache.set('todayCache', dailyNameKey, todayCount, cacheTimeoutTime * 1000);

        var randomId = Random.pick(quizDataIds);
        var qItem = quizDataSet[randomId];
        var qOptions: any = Random.shuffle(qItem.options);
        var answerIndex = -1;

        logger?.info(`${argv.session.userId} get a new quiz(id:${randomId})`);

        // 缓存正确答案
        for (var i = 0; i < qOptions.length; i++) {
            if (qOptions[i].oid === qItem.a) {
                answerIndex = i;
                break;
            }
        }

        await ctx.cache.set('question', argv.session.userId, { question: randomId, answer: answerIndex }, config.answerTimeout * 1000);

        var messageQuestion = `${qItem.question.img.length > 0 ? `<img src="${qItem.question.img}"/>` : ``}${At(argv)}${qItem.question.s}
A. ${qOptions[0].s}
B. ${qOptions[1].s}
C. ${qOptions[2].s}
D. ${qOptions[3].s}`;
        await argv.session?.send(messageQuestion);
        return;
    });

    ctx.command("轨迹答题").usage('通过趣味答题看看你是不是合格的桂皮吧~');
    ctx.command("轨迹答题/回答 <answer:text>", `使用"回答+空格+选项"回答问题哦，如"回答 A"`).action(async (argv, answer) => {
        await answerHandler(ctx, config, argv, answer);
        return;
    });

    ctx.command("轨迹答题/A", "选择 A 选项",{ hidden: true }).action(async (argv, _) => {
        await answerHandler(ctx, config, argv, 'A');
        return;
    });

    ctx.command("轨迹答题/B", "选择 B 选项",{ hidden: true }).action(async (argv, _) => {
        await answerHandler(ctx, config, argv, 'B');
        return;
    });

    ctx.command("轨迹答题/C", "选择 C 选项",{ hidden: true }).action(async (argv, _) => {
        await answerHandler(ctx, config, argv, 'C');
        return;
    });

    ctx.command("轨迹答题/D", "选择 D 选项",{ hidden: true }).action(async (argv, _) => {
        await answerHandler(ctx, config, argv, 'D');
        return;
    });

    ctx.command("轨迹答题/答题分数","查看答题总分数").action(async (argv, _) => {
        await argv.session?.send(`${At(argv)}正在开发中哦~`);
        return;
    })
}