const {
    Builder,
    By,
    promise,
    Key, Actions
} = require('selenium-webdriver');
const clipboardy = require('clipboardy');
var webdriver = require("selenium-webdriver");
var chrome = require("selenium-webdriver/chrome");
const tools = require('./tools')
var YoutubeVideoTittleXPATH = '//*[@id="upload-item-0"]' +
    '/div[3]/div[2]/div/div/div[1]' +
    '/div[3]/form/div[1]/fieldset[1]/' +
    'div/label[1]/span/input'

exports.uploadVideo = async function () {
    var config = tools.loadJson('./config/config.json')
    var video = tools.loadJson('./video.json')
    var desc
    if (video.inserirCupom == 0) {
        desc = tools.loadDescription(config.descCupom).toString()
        desc = desc.replace('www.link.com.br', video.url)
        desc = desc.replace('#CUPOM#', video.cupom)
        clipboardy.writeSync(desc);
    } else {
        desc = tools.loadDescription(config.desc).toString()
        desc = desc.replace('www.link.com.br', video.url)
        clipboardy.writeSync(desc);
    }

    var chromeOptions = new chrome.Options();
    chromeOptions.addArguments(`--user-data-dir=${config.chrome}`);
    driver = new webdriver.Builder()
        .forBrowser("chrome")
        .setChromeOptions(chromeOptions)
        .build();
    await driver.get('https://www.youtube.com/upload')

    await sleep(1000)
    try {
        await driver.findElement(By
            .xpath('//*[@id="upload-prompt-box"]/div[2]/input'))
            .sendKeys(video.converted)
    } catch (error) {
        console.log('erro no input')
        driver.close()
    }
    try {
        await driver.findElement(By.xpath('//*[@id="upload-item-0"]/div[3]/div[2]/div/div/div[1]/div[3]/form/div[1]/fieldset[1]/div/label[1]/span/input')).clear();
        await driver.findElement(By
            .xpath(YoutubeVideoTittleXPATH))
            .sendKeys(String(video.videoTitle).substring(0, 75));
        await driver.findElement(By.xpath('//*[@id="upload-item-0"]/div[3]/div[2]/div/div/div[1]/div[3]/form/div[1]/fieldset[1]/div/label[2]/span/textarea')).sendKeys(Key.CONTROL, 'v')

    } catch (error) {
        console.log('erro elems')
        driver.close()
    }
    var tagElement = await driver.findElement(By.xpath("//*[@id=\"upload-item-0\"]/div[3]/div[2]/div/div/div[1]/div[3]/form/div[1]/fieldset[1]/div/div/span/div/span/input"));
    tags = video.tags
    for (var tag of tags) {
        tagElement.sendKeys(tag + '\n');
    }
    var tr = true;
    while (tr) {
        try {
            var tt = await driver.findElement(By.xpath('//*[@id="upload-item-0"]/div[2]/div[2]/div[1]')).getText();
            var progress = await driver.findElement(By.xpath('//*[@id="upload-item-0"]/div[3]/div[1]/div[2]/div[2]/div[1]/span/span')).getText();
            process.stdout.write("\r");
            process.stdout.write("\x1b[32m" +
                'Uploading video -> | ' + progress + ' | for ' + video.name);
            process.stdout.write("\x1b[0m")

            await sleep(3000)
            if (tt === 'Upload concluído!') {
                tr = false
                await driver.findElement(By.xpath('//*[@id="upload-item-0"]/div[3]/div[1]/div[1]/div/div/button')).click();
                await sleep(3000)
                await driver.quit()
            }
        } catch (error) {
            console.log(error)
        }


    }

}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
