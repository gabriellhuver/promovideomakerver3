
const {
    Builder, By, Key, promise
} = require('selenium-webdriver')
require('chromedriver')
const Chrome = require('selenium-webdriver/chrome')
const request = require('request')
const tools = require('./tools')
exports.fetchData = async function () {
    return new Promise(async (resolve, reject) => {
        console.log('Buscando pelos melhores produtos no pelando.com')
        var prodList = []
        var database = await tools.loadJson('./output/database.json')
        var options = new Chrome.Options();
        const url = 'https://www.pelando.com.br/quente'
        options.addArguments('--user-data-dir=chrome');
        var driver = new Builder().withCapabilities(options).build();
        try {
            console.log(`Tentando acessar a ${url}`)
            await driver.get(url)
        } catch (error) {
            reject()
        }
        await sleep(3000);
        for (let index = 0; index < 1; index++) {
            await driver.findElement(By.tagName('body')).sendKeys(Key.PAGE_DOWN);
            await sleep(500)
        }
        await driver.findElements(By.className('gridLayout-item threadCardLayout--card')).then(async res => {
            for (let index = 0; index < res.length; index++) {
                var product = {}
                try {
                    const element = res[index];
                    try {
                        product.url = await element.findElement(By.xpath("./article/div[7]/a")).getAttribute('href')
                        console.log(`Url de produto achada ${product.url}`)
                    }
                    catch (error) {
                        product.url = ""
                    }
                    try {

                        product.percent = await element.findElement(By.className('cept-vote-temp vote-temp vote-temp--hot')).getText()
                        product.percent = Number(product.percent.replace("°", ""))
                    } catch (error) {
                        try {
                            product.percent = await element.findElement(By.className('cept-vote-temp vote-temp vote-temp--burn')).getText()
                            product.percent = Number(product.percent.replace("°", ""))
                        } catch (error) {
                            process.percent = 0
                        }
                    }
                    try {
                        try {
                            product.name = await element.findElement(By.className("cept-tt thread-link linkPlain thread-title--card")).getText()
                        } catch (error) { }
                        try {
                            product.seller = await element.findElement(By.className("text--b text--color-brandPrimary cept-merchant-name")).getText()
                        } catch (error) { }
                        try {
                            product.percent = await element.findElement(By.className('cept-vote-temp vote-temp vote-temp--hot')).getText()
                            product.percent = Number(product.percent.replace("°", ""))
                        } catch (error) { }
                        try {
                            product.price = await element.findElement(By.className("thread-price text--b vAlign--all-tt cept-tp size--all-l")).getText()
                        } catch (error) { }
                        try {
                            product.url = await element.findElement(By.xpath("./article/div[7]/a")).getAttribute('href')
                        }
                        catch (error) { }
                        try {
                            product.description = await element.findElement(By.className("cept-description-container overflow--wrap-break width--all-12  size--all-s size--all-s overflow--clamp-s-2 overflow--fade-b-r--s")).getText()
                        } catch (error) { }
                        try {
                            product.cupom = await element.findElement(By.className("lbox--v-4 flex--width-calc-fix flex--grow-1 clickable overflow--ellipsis width--all-12 hAlign--all-c text--color-charcoal text--b btn--mini")).getAttribute('value')
                        } catch (error) { }
                        try {
                            product.username = await element.findElement(By.className("thread-username")).getText()
                        } catch (error) { }
                        if (product.seller === 'Submarino' || product.seller === 'Americanas' || product.seller === 'Shoptime') {
                            if (!database.videos.indexOf(product.url) > -1) {
                                prodList.push(product)
                                console.log(product)
                            }
                        }
                    } catch (error) { }

                } catch (error) {
                    console.log(error)
                }
            }
            await driver.quit()
            console.log('Organizando produtos na lista!')
            prodList = sortByKey(prodList, 'percent')
            await tools.saveToJson('./output/pelando.json', prodList)
            console.log('Lista salva com sucesso! ./output/pelando.json')
            resolve()
        })

    })

}
function sortByKey(array, key) {
    return array.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
}
function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
