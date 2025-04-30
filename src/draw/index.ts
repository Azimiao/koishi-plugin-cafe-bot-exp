/**
 * 轨迹抽卡
 */

import { Context, Schema } from 'koishi'
import * as fs from 'fs/promises';
import * as path from 'path';
import fsExists from "fs.promises.exists";
import { DailySeededName } from '../common/DailySeededName';
import PseudoRandom from '../common/PseudoRandom';
import HtmlCreator from './templete/html';

import { CafeBotDrawConfig } from './config';

import { At } from '../common/at';
import downloadFileIfNotExist from '../common/downloadTool';

export const name = 'cafe-bot-exp.draw';

export const inject = ['http'];

export interface Config extends CafeBotDrawConfig{};
export const Config: Schema<Config> = CafeBotDrawConfig;

const animals = ["瑟蕾奴", "可鲁贝洛斯", "捷欧", "基库", "蔡特", "柯贝", "古利亚诺斯", "小星", "影良", "fio", "xeros"];
const starEnum = [5, 4, 3, 2, 1];

let cafebotCardData = [];

// 对数组进行伪随机排列
function shuffleWithCustomRandom(array, rand) {
    for (let i = array.length - 1; i > 0; i--) {
        const a = rand();
        const j = Math.floor(a * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

let star2Name = null;


async function downloadCardDataIfNotExist(ctx: Context, config: Config,forceUpdate: boolean) {

    if (!forceUpdate && cafebotCardData != null && cafebotCardData.length > 0) {
        return;
    }

    const root = path.join(ctx.baseDir, 'data', `${name}-data`)
    await fs.mkdir(root, { recursive: true });
    const cardFilePath = path.join(root, 'card.json');

    await downloadFileIfNotExist(ctx.http,config.baseDataUrl,cardFilePath,forceUpdate);

    var fileContent = await fs.readFile(cardFilePath, "utf-8");
    try {
        cafebotCardData = JSON.parse(fileContent);
    } catch (error) {
        throw new Error("Card read error");
    }
    return;
}

async function getCards(seed, ctx, config) {

    await downloadCardDataIfNotExist(ctx, config,false);

    let minCount = config.MinCount;
    let maxCount = config.MaxCount;
    let randomer = new PseudoRandom(seed);
    let drawTime = randomer.nextInt(minCount, maxCount);
    let cardDataCache = [...cafebotCardData];
    let cardDataRandom = shuffleWithCustomRandom(cardDataCache, randomer.next);


    const allChanges = [
        config.Star5Chance,
        config.Star4Chance,
        config.Star3Chance,
        config.Star2Chance,
        config.Star1Chance
    ];
    if (star2Name == null) {
        star2Name = {
            "1": config.Star1Name,
            "2": config.Star2Name,
            "3": config.Star3Name,
            "4": config.Star4Name,
            "5": config.Star5Name
        };

    }
    const groupedByStar = {};

    cardDataRandom.forEach(char => {
        const star = char.star;
        if (!groupedByStar[star]) {
            groupedByStar[star] = [];
        }
        groupedByStar[star].push(char);
    });


    let result = [];
    for (let i = 0; i < drawTime; i++) {
        let randomNumber = randomer.next();
        let selectStarGroup = -999;
        for (let starGroup = 0; starGroup < allChanges.length; starGroup++) {
            if (randomNumber < allChanges[starGroup]) {
                selectStarGroup = 5 - starGroup;
                break;
            }
        }

        if (selectStarGroup > 0 && groupedByStar != null && groupedByStar[selectStarGroup]) {
            let nowGroupData = groupedByStar[selectStarGroup];
            let pickUpNumber = randomer.nextInt(0, nowGroupData.length - 1);
            let card = nowGroupData[pickUpNumber];
            card.starText = star2Name[card.star];
            if (!result.includes(card)) {
                result.push(card);
            }
        }
    }
    return result;
}

export async function apply(ctx: Context,config: Config){
    await downloadCardDataIfNotExist(ctx,config,config.forceUpdateDataWhenLoad);

    ctx.command('轨迹抽卡/给我抽', "进行每日抽卡").action(async (argv, _) => {
        let seed = DailySeededName(argv.session.userId);
        console.log(`getcard for ${seed}`);
        let randomer = new PseudoRandom(seed);
        let result = await getCards(seed, ctx, config);

        if (result.length <= 0) {
            let msg = "你并不是本群限定非酋, 只不过抽到的卡牌被" + animals[randomer.nextInt(0, animals.length - 1)] + "叼走了~\n";
            console.log(`getcard for ${seed} is empty,send it`);
            await argv.session?.send(`${At(argv)}${msg}`);
            return;
        }

        let resultParse = {};
        result.forEach(element => {
            if (!resultParse[element.star]) {
                resultParse[element.star] = [];
            }
            resultParse[element.star].push(element);
        });

        let msg = `${At(argv)}今日抽到的卡牌:\n`;
        starEnum.forEach(starCount => {
            if (resultParse[starCount]) {
                msg += `${star2Name[starCount]}\n`;
                resultParse[starCount].forEach(card => {
                    msg += `-${card.name}\n`;
                });
            }
        })
        await argv.session?.send(msg);
        console.log(`getcard for ${seed} send ok`);
        return;
    });

    // 防抖
    const requestWebCache = {};

    ctx.command('轨迹抽卡/给我抽图', "进行抽卡并显示卡牌图片").action(async (argv, _) => {

        let seed = DailySeededName(argv.session.userId);
        console.log(`getcard img for ${seed}`);

        let randomer = new PseudoRandom(seed);
        let result = await getCards(seed, ctx, config);

        if (result.length <= 0) {
            let msg = "你并不是本群限定非酋, 只不过抽到的卡牌被" + animals[randomer.nextInt(0, animals.length - 1)] + "叼走了~\n"
            await argv.session?.send(`${At(argv)} ${msg}`);
            console.log(`getcard img for ${seed} is empty`);
            return;
        }

        if (requestWebCache[seed]) {
            await argv.session?.send(`${At(argv)} 请等待上次抽取完成哦~`);
            console.log(`getcard img for ${seed}, another request is processing, send please wait`);
            return;
        }

        requestWebCache[seed] = "waiting";

        await argv.session?.sendQueued(`${At(argv)} 抽取中,请稍候...`);
        console.log(`getcard img for ${seed} is processing, send please wait`);

        var a = HtmlCreator(result);



        await ctx.http.post(
            config.ImageServer,
            {
                html: a,
                auth: config.ImageServerAuth,
                filename: seed,
            },
            {
                responseType: "json"
            }
        ).then(async (res) => {
            delete requestWebCache[seed];
            await argv.session?.sendQueued(`${At(argv)}<img src="${res.data}"/>`);
            await argv.session?.cancelQueued();
            console.log(`getcard img for ${seed} send ok~`);
        }).catch(async (e) => {
            console.log(e);
            delete requestWebCache[seed];
            await argv.session?.sendQueued(`${At(argv)}图片生成失败`);
            await argv.session?.cancelQueued();
            console.log(`getcard img for ${seed} is failed, send create failed`);
        })
        return;
    });
}