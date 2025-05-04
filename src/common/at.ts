import { Context, Random, Schema, segment } from 'koishi'

export function At(argv, newLine = true) {
    let AtStr = (argv.session && !argv.session.isDirect) ? `${segment.at(argv.session.userId)}${newLine ? "\n" : ""}` : "";
    return AtStr;
}