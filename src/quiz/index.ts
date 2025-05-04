/**
 * 轨迹答题
 */
import { Context, Random, Schema, segment, Logger } from 'koishi';
import { } from '@koishijs/plugin-help';
import { } from '@koishijs/cache';

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

declare module 'koishi' {
    interface Tables {
        'cafeQuiz': CafeQuiz
    }
}


export interface CafeQuiz {
    id: number,
    userId: string,
    right: number,
    wrong: number,
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

    const userQuiz: CafeQuiz[] = await ctx.database.get('cafeQuiz', { userId: argv.session.userId });
    let userQuizA: CafeQuiz = null;
    if (userQuiz.length === 0) {
        userQuizA = await ctx.database.create('cafeQuiz', {
            userId: argv.session.userId,
            right: 0,
            wrong: 0
        });
    } else {
        userQuizA = userQuiz[0];
    }

    var qItem = quizDataSet[lastQuestion.question];

    logger?.info(`${argv.session.userId} try answer quiz(id:${lastQuestion.question}): right answer:${lastQuestion.answer}, input answer:${selectNumber}`);

    if (qItem && lastQuestion.answer == selectNumber) {
        await argv.session?.send(`${At(argv)}回答正确😊${qItem.explain.length > 0 ? '，' + qItem.explain : ''}`);
        await ctx.database.set('cafeQuiz', userQuizA.id, {
            right: userQuizA.right + 1
        });
        return;
    } else {
        await argv.session?.send(`${At(argv)}回答错误😟${qItem.explain2.length > 0 ? '，' + qItem.explain2 : ''}`);
        await ctx.database.set('cafeQuiz', userQuizA.id, {
            wrong: userQuizA.wrong + 1
        });
        return;
    }
}

export async function apply(ctx: Context, config: Config) {

    logger = ctx.logger(name);

    // 扩展数据库表
    ctx.model.extend('cafeQuiz', {
        id: 'unsigned',
        userId: 'string',
        right: 'integer',
        wrong: 'integer'
    }, { primary: 'id', autoInc: true });

    await downloadQuitDataIfNotExist(ctx, config, config.forceUpdateWhenLoad);

    ctx.command("轨迹答题/出题", "随机抽一道题目").action(async (argv, _) => {

        await downloadQuitDataIfNotExist(ctx, config, false);

        var lastQuestion = await ctx.cache.get('question', argv.session.userId);
        if (lastQuestion) {
            await argv.session?.send("上一题还没有回答哦~");
            return;
        }

        var dailyNameKey = DailySeededName(argv.session.userId);
        argv.session.user


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

        var randomId = Random.pick(quizDataIds); // TODO: 应该考虑不出重复的题
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
    ctx.command("轨迹答题/回答 <answer:text>", `使用"回答+空格+选项"回答问题，另外你也可以直接@我说出选项(ABCD)哦`).action(async (argv, answer) => {
        await answerHandler(ctx, config, argv, answer);
        return;
    });

    ctx.command("轨迹答题/A", "选择 A 选项", { hidden: true }).action(async (argv, _) => {
        await answerHandler(ctx, config, argv, 'A');
        return;
    });

    ctx.command("轨迹答题/B", "选择 B 选项", { hidden: true }).action(async (argv, _) => {
        await answerHandler(ctx, config, argv, 'B');
        return;
    });

    ctx.command("轨迹答题/C", "选择 C 选项", { hidden: true }).action(async (argv, _) => {
        await answerHandler(ctx, config, argv, 'C');
        return;
    });

    ctx.command("轨迹答题/D", "选择 D 选项", { hidden: true }).action(async (argv, _) => {
        await answerHandler(ctx, config, argv, 'D');
        return;
    });

    ctx.command("轨迹答题/答题分", "查看答题总分数").action(async (argv, _) => {
        const userQuiz: CafeQuiz[] = await ctx.database.get('cafeQuiz', { userId: argv.session.userId });

        if (userQuiz.length === 0) {
            await argv.session?.send(`${At(argv)}你还没有答过题哦，快来答题吧~`);
            return;
        } else {
            let userQuizA = userQuiz[0];
            let right = userQuizA.right;
            let total = right + userQuizA.wrong;
            let percent = Math.round((userQuizA.right * 1.0 / total) * 100);
            let comment = "继续努力吧~";
            
            if(total >= 6){
                if (percent >= 90) {
                    comment = "哇，难道您就是传说中的桂皮?!";
                } else if (percent >= 70) {
                    comment = "离合格的桂皮只有一步之遥?!";
                } else if (percent >= 60) {
                    comment = "正在成为桂皮中……";
                } else if(percent <= 25){
                    comment = "开除桂皮籍！😤"
                }
            }

            await argv.session?.send(`${At(argv)}你的答题数据：\n - 答题总数: ${total}\n - 正确回答: ${right}\n - 正确率: ${percent}%\n${comment}`);
            return;
        }
    })
}