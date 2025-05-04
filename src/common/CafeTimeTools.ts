const CafeTimeTools = {
    getRemainingSecondsToBeijingMidnight : function () {
        const now = new Date();
        const utcNow = now.getTime(); // 当前时间的UTC时间戳

        // 构造目标时间：当天的16:00 UTC（对应北京时间次日的00:00）
        const target = new Date(now);
        target.setUTCHours(16, 0, 0, 0);

        // 如果当前时间超过或等于目标时间，则目标时间设为次日
        if (utcNow >= target.getTime()) {
            target.setUTCDate(target.getUTCDate() + 1);
        }

        // 计算剩余时间的秒数（向下取整）
        const diff = target.getTime() - utcNow;
        const seconds = Math.ceil(diff / 1000);

        return seconds;
    }
}

export default CafeTimeTools;