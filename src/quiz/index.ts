/**
 * 轨迹答题
 */
import { Context, Random, Schema, segment } from 'koishi'
import { } from '@koishijs/cache';

import { At } from '../common/at';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CafeBotQuizConfig } from './config';
import downloadFileIfNotExist from '../common/downloadTool';

export const name = 'cafe-bot-exp.quiz';
export const inject = ['http', 'cache'];
export interface Config extends CafeBotQuizConfig { };
export const Config: Schema<Config> = CafeBotQuizConfig;

const validOptions = {
    'A': 0, 'B': 1, 'C': 2, 'D': 3,
    'a': 0, 'b': 1, 'c': 2, 'd': 3,
    '1': 0, '2': 1, '3': 2, '4': 3
};


let quizDataIds = [];
let quizDataSet = {};

interface QuestionCache {
    question: number,
    answer: number
}

declare module '@koishijs/cache' {
    interface Tables {
        question: QuestionCache
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
        throw new Error("quiz read error");
    }
    return;
}

export async function apply(ctx: Context, config: Config) {

    await downloadQuitDataIfNotExist(ctx, config, config.forceUpdateWhenLoad);

    ctx.command("轨迹答题/出题").action(async (argv, _) => {

        await downloadQuitDataIfNotExist(ctx, config, false);

        var lastQuestion = await ctx.cache.get('question', argv.session.userId);
        if (lastQuestion) {
            await argv.session?.send("上一题还没有回答哦~");
            return;
        }
        if (quizDataIds == null || quizDataIds.length <= 0) {
            await argv.session?.send(`${At(argv)}题目数据获取失败~`);
            return;
        }

        var randomId = Random.pick(quizDataIds);
        var qItem = quizDataSet[randomId];
        var qOptions: any = Random.shuffle(qItem.options);
        var answerIndex = -1;
        // 缓存正确答案
        for (var i = 0; i < qOptions.length; i++) {
            if (qOptions[i].oid === qItem.a) {
                answerIndex = i;
                break;
            }
        }

        await ctx.cache.set('question', argv.session.userId, { question: randomId, answer: answerIndex }, config.answerTimeout * 1000);

        var messageQuestion = `${qItem.question.img.length > 0 ? `<img src="${qItem.question.img}"/>` : ``}${At(argv)}${qItem.question.s}
A.${qOptions[0].s}
B.${qOptions[1].s}
C.${qOptions[2].s}
D.${qOptions[3].s}`;
        await argv.session?.send(messageQuestion);
        return;
    });

    ctx.command("轨迹答题/回答 <answer:text>", `回复"回答+空格+选项"回答问题哦，如"回答 A"`).action(async (argv, answer) => {
        // await argv.session?.send("开发中");
        // return;
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
            await argv.session?.send(`${At(argv)}选项无效，请重新输入~`);
            return;
        }

        await ctx.cache.delete('question', argv.session.userId);

        if (quizDataIds == null || quizDataIds.length <= 0) {
            await argv.session?.send(`${At(argv)}题目数据获取失败，请重新开始答题~`);
            return;
        }

        var qItem = quizDataSet[lastQuestion.question];

        if (qItem && lastQuestion.answer == selectNumber) {
            await argv.session?.send(`${At(argv)}回答正确😊${qItem.explain.length > 0 ? ',' + qItem.explain : ''}`);
            return;
        } else {
            await argv.session?.send(`${At(argv)}回答错误😟${qItem.explain2.length > 0 ? ',' + qItem.explain2 : ''}`);
            return;
        }
    });

    ctx.command("轨迹答题/答题分数").action(async (argv, _) => {
        await argv.session?.send(`${At(argv)}正在开发中哦~`);
        return;
    })
}