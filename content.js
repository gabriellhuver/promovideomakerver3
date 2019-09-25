const {
    Builder,
    By,
    promise
} = require('selenium-webdriver');

const tools = require('./tools')
const Chrome = require('selenium-webdriver/chrome')
require("chromedriver");
const cheerio = require('cheerio')


exports.open = function () {
    return new Promise(async (resolve, reject) => {
        var config = tools.loadJson('./config/config.json')

        var options = new Chrome.Options();
        //options.addArguments('--user-data-dir=C:/Users/Gabriell Huver/AppData/Local/Google/Chrome/User Data');
        options.addArguments(`--user-data-dir=${config.chrome}`);

        var driver = new Builder().withCapabilities(options).build();
        await driver.get('htpp://google.com')
        resolve()
    })
}

exports.fetchContent = function (url) {
    return new Promise(async (resolve, reject) => {
        console.log('Acessando dados da pagina de produto')
        var config = tools.loadJson('./config/config.json')

        try {
            var options = new Chrome.Options();
            //options.addArguments('--user-data-dir=C:/Users/Gabriell Huver/AppData/Local/Google/Chrome/User Data');
            options.addArguments(`--user-data-dir=${config.chrome}`);

            var driver = new Builder().withCapabilities(options).build();
            await driver.get('http://americanas.com.br')
            await driver.get(url)

            let body = await driver.getPageSource()
            await driver.quit()
            resolve(await extractProductMetadata(body))
        } catch (error) {
            reject(error)
        }
    })
}
async function extractProductMetadata(body) {
    return new Promise((resolve, reject) => {
        var html = cheerio.load(body)
        var PRODUCT_METADATA = {}
        html('span').each(function (index, element) {
            if (html(element).text().includes('(Cód.')) {
                PRODUCT_METADATA.Product_ID = html(element).text().replace('(Cód.', '').replace(')', '')
            }
        })
        PRODUCT_METADATA.Product_Name = html('#product-name-default').text()
        html('span').each(function (index, element) {
            if (html(element).text().includes('% de volta')) {
                try {
                    PRODUCT_METADATA.CashbackRate = Number(html(element).text().split('(')[1].split('%')[0])
                    PRODUCT_METADATA.Price = Number(html(element).text().split(' ')[1].replace('.', '').replace(',', '.'))
                    return false;
                } catch (error) { }
            }
        })
        html('script').each(async function (index, element) {
            if (html(element).html().includes('cashback')) {
                try {
                    let json = tools.extractJSON(html(element)
                        .html())
                    let images = json[0]
                        .entities
                        .products
                        .entities
                        .products[PRODUCT_METADATA.Product_ID].images
                    PRODUCT_METADATA.images = images
                } catch (error) { }
            }
        })
        if (PRODUCT_METADATA === {}) reject()
        resolve(PRODUCT_METADATA)
    })
}