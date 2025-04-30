import * as fs from 'fs/promises';
import fsExists from "fs.promises.exists";
import {  HTTP } from "koishi";

async function downloadFileIfNotExist(http: HTTP, downloadUrl: string, savePath:string,forceUpdate :boolean) {

    var result = true;
    var exist = await fsExists(savePath);
    console.log(savePath);
    var needDownload = !exist || forceUpdate;

    if (needDownload) {
        console.log(`Data ${savePath} not exist or forceUpdate,try download from ${downloadUrl}`);

        // download file
        result = await http.get(downloadUrl).then(async (res) => {
            await fs.writeFile(savePath, JSON.stringify(res));
            console.log(`Data ${downloadUrl} download ok,save path ${savePath}`);
            return true;
        }).catch((e)=>{
            return false;
        });
    }

    return result;
}

export default downloadFileIfNotExist;