function HtmlCreator(cardList) {
    const fullHtml = `
    <!DOCTYPE html>
    <html lang="zh">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>抽卡结果</title>
    <style>
         :root {
            --ur-color: #ff9900;
            --ssr-color: #ff4db8;
            --sr-color: #3399ff;
            --r-color: #eee;
            --n-color: #eee;
        }

        body {
            font-family: Arial, sans-serif;
            background: #dceffc;
            background-image: url("https://cdn.trails-game.com/wp-content/uploads/2020/07/20_Sunshine.jpg");
            background-size: cover;
            margin: 0;
            padding: 0;
            height: 100vh;
            width: 100vw;
        }

        .gacha-wrapper {
            display: flex;
            justify-content: center;
            position: absolute;
            transform: translate(-50%, -50%);
            left: 50%;
            top: 50%;
            width: calc(100% - 40px);
            padding-left: 20px;
            padding-right: 20px;
        }

        .gacha-container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            justify-content: center;
            width: 100%;
        }

        .card {
            background: #fff;
            border-radius: 10px;
            overflow: hidden;
            width: 130px !important;
            height: 155px !important;
            overflow: hidden;
            text-align: center;
            box-shadow: 1px 1px 3px rgb(122, 122, 122);
            border: 3px solid #fff;
            transform: skew(-10deg);
            box-sizing: border-box;
        }

        .card.rarity-5 {
            box-shadow: 1px 1px 3px var(--ur-color);
            border: 3px solid var(--ur-color);
        }

        .card.rarity-4 {
            box-shadow: 1px 1px 3px var(--ssr-color);
            border: 3px solid var(--ssr-color)
        }

        .card.rarity-3 {
            box-shadow: 1px 1px 3px var(--sr-color);
            border: 3px solid var(--sr-color)
        }

        .card.rarity-2 {
            box-shadow: 1px 1px 3px var(--r-color);
            border: 3px solid var(--r-color)
        }

        .card.rarity-1 {
            box-shadow: 1px 1px 3px var(--n-color);
            border: 3px solid var(--n-color);
        }

        .card .card-img {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 115px;
            transform: skew(10deg) scale(1.2);
            background-repeat: no-repeat !important;
            background-size: 100% !important;
        }

        .rarity {
            position: absolute;
            bottom: 0px;
            padding: 5px;
            background: #34495e;
            font-weight: bold;
            width: 100%;
            text-align: center;
        }

        .rarity.rarity-5 {
            color: var(--ur-color);
            border-top: 3px solid var(--ur-color);
        }

        .rarity.rarity-4 {
            color: var(--ssr-color);
            border-top: 3px solid var(--ssr-color);
        }

        .rarity.rarity-3 {
            color: var(--sr-color);
            border-top: 3px solid var(--sr-color);
        }

        .rarity.rarity-2 {
            color: var(--r-color);
            border-top: 3px solid var(--r-color);
        }

        .rarity.rarity-1 {
            color: var(--n-color);
            border-top: 3px solid var(--n-color);
        }
    </style>
    </head>
    <body>
    <!-- <h1 style="text-align: center;color:#c9a472;">抽卡结果</h1> -->
    <div class="gacha-wrapper">
        <div class="gacha-container" id="gachaContainer">
        ${cardList.map((item) => {
            return `
            <div class="card rarity-${item.star}">
            <div class="card-img" style="background:url('${item.url}')"></div>
            <div class="rarity rarity-${item.star}">${item.starText}</div>
            </div>
            `
        })}
        </div>
    </div>
    </body>
    </html>
    `;
    return fullHtml;
}

export default HtmlCreator;