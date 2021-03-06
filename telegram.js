require('chromedriver')
const tools = require('./tools')
const {
  Builder, By, Key
} = require('selenium-webdriver')
const fs = require('fs')
const Chrome = require('selenium-webdriver/chrome')
const path = require('path')
const clipboardy = require('clipboardy');
exports.telegramSender = async function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`Enviando mensangem telegram`)
      console.log(`Enviando para ${id}`)
      var msg = ""
      var image = path.resolve(__dirname, './output/telegram/image.png')
      try {
        msg = fs.readFileSync('./output/telegram/message.txt', 'utf8')
        clipboardy.writeSync(msg);
      } catch (error) {
        reject(error)
      }
      var options = new Chrome.Options();
      options.addArguments(`--user-data-dir=chrome`);
      var driver = new Builder().withCapabilities(options).build();
      await driver.get('https://web.telegram.org/#/im')
      await sleep(6000);
      console.log('Abrindo Telegram client Webdriver')
      await driver.findElements(By.tagName('span')).then(async elems => {
        var array = await elems
        console.log(`Procurando por ${id} na lista de grupos!`)
        for (let index = 0; index < array.length; index++) {
          const element = array[index];
          var text = await element.getText();
          if (text === id) {
            console.log(await element.getText())
            await element.click()
            console.log('Esperando grupo carregar as mensagens e imagens')
            await sleep(8000);
            console.log('Limpando campo de texto do Telegram')
            await element.findElement(By
              .xpath('//*[@id="ng-app"]/body/div[1]/div[2]/div/div[2]/div[3]/div/div[3]/div[2]/div/div/div/form/div[2]/div[5]'))
              .sendKeys("")
            await sleep(1000)
            await element.findElement(By
              .xpath('//*[@id="ng-app"]/body/div[1]/div[2]/div/div[2]/div[3]/div/div[3]/div[2]/div/div/div/form/div[2]/div[5]'))
              .sendKeys(Key.CONTROL, 'a')
            await sleep(1000)
            await element.findElement(By
              .xpath('//*[@id="ng-app"]/body/div[1]/div[2]/div/div[2]/div[3]/div/div[3]/div[2]/div/div/div/form/div[2]/div[5]'))
              .sendKeys(Key.DELETE)
            await sleep(1000)
            console.log('Colando mensagem no campo de texto')
            await element.findElement(By
              .xpath('//*[@id="ng-app"]/body/div[1]/div[2]/div/div[2]/div[3]/div/div[3]/div[2]/div/div/div/form/div[2]/div[5]'))
              .sendKeys(Key.CONTROL, 'v')
            await sleep(2000);
            console.log(`Enviando imagem ${image} para ${id} e esperando carregar`)
            await element.findElement(By
              .xpath('//*[@id="ng-app"]/body/div[1]/div[2]/div/div[2]/div[3]/div/div[3]/div[2]/div/div/div/form/div[3]/div[2]/input'))
              .sendKeys(image);
            await sleep(8000);
            console.log('Imagem carregada...')
            await element.findElement(By.xpath('//*[@id="ng-app"]/body/div[1]/div[2]/div/div[2]/div[3]/div/div[3]/div[2]/div/div/div/form/div[2]/div[5]')).sendKeys(Key.ENTER)
            await sleep(3000)
            console.log('Mensagem enviada com sucesso!')
            try {
              console.log('Fechando webdriver client!')
              await driver.quit()
              await sleep(2000)
              resolve()
            } catch (error) { console.log(error) }
          }
        }

      })


    } catch (error) {
      reject(error)
    }
  })
}

exports.open = function () {
  return new Promise(async (resolve, reject) => {
    try {
      var options = new Chrome.Options();
      options.addArguments(`--user-data-dir=chrome`);
      var driver = new Builder().withCapabilities(options).build();
      await driver.get('https://web.telegram.org/#/im')
      await tools.read('Press enter to exit');
      await driver.quit()
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

exports.createTelegramMessage = function () {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Criando mensagem Telegram !')
      const video = await tools.loadJson('./video.json')
      var message = await fs.readFileSync('./config/telegram.txt', 'utf8');
      message = message.replace('#produto#', video.name)
      message = message.replace('#price#', video.price)
      message = message.replace('#link#', video.url)
      console.log(`Produto ${video.name} com preço ${video.price} com a url ${video.url}`)
      if (video.inserirCupom === 0) {
        console.log(`Inserindo cupom na mensagem ! ${video.cupom}`)
        message = message.replace('#cupom#', `Utilize nosso cupom ${video.cupom}`)
      } else {
        message = message.replace('#cupom#', '')
      }
      fs.copyFileSync(video.imagesNoBg[0], `./output/telegram/image.png`)
      console.log('Imagem copiada para a pasta de output do telegram')
      fs.writeFileSync(`./output/telegram/message.txt`, message)
      console.log(`Mensagem salva em ./output/telegram/message.txt`)
      await sleep(1000)
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}
