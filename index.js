const tools = require('./tools')
const content = require('./content')
const image = require('./image')
const ae = require('./after-effects')
const upload = require('./upload')
const telegram = require('./telegram')
const pelando = require('./pelando')
var config = {}
var videoList = []
var currentVideo = {}
var database = []
var self = this

const DEBUG = false

loadConfigs().then(() => {
    console.log('Configurações carregadas! Iniciando programa')
    if (DEBUG) init()
    else self.createVideo()
})



async function init() {
    return new Promise(async (resolve, reject) => {
        let i = await tools.readOptions('O que deseja fazer?',
            [
                "Criar videos",
                "Abrir navegador",
                "Force Upload!",
                "Force telegram message!",
                "Force image prepare",
                "Force download metadata",
                "Force mount template",
                "Force fetch data",
                "Create last video"])
        switch (i) {
            case 0:
                self.createVideo()
                break;
            case 1:
                await content.open()
                init()
                break;
            case 2:
                await upload.uploadVideo()
                break;
            case 3:
                try {
                    await telegram.createTelegramMessage()
                    await telegram.telegramSender(config.telegramGroup)
                    await tools.saveToJson('./video.json', currentVideo)
                } catch (error) {
                    console.log("Erro on telegram sender")
                    reject()
                }
                break;
            case 4:
                prepareImages()
                break;
            case 5:
                await fetchDataFromProductPage()
                break;
            case 6:
                ae.createVideoByHtmldata()
                break;
            case 7:
                currentVideo = await tools.loadJson('./video.json')
                currentVideo.metadata = await content.fetchContent(currentVideo.url);
                await tools.saveToJson('./video.json', currentVideo)
                break;
            case 8:
                currentVideo = await tools.loadJson('./video.json')
                await creavideoByPelandoData(currentVideo)
                break;
            default:
                break;
        }
    })
}


function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
exports.createVideo = async function () {
    while (true) {
        try {
            await loadConfigs()
            if (videoList.length === 0) {
                await pelando.fetchData()
                await loadConfigs()
            }
            var video = {}
            console.log('Criando novo video')
            await loadConfigs()
            video = videoList[0];
            console.log(video)
            if (database.videos.includes(video.url)) {
                console.log("video ja criado!")
                videoList.splice(0, 1);
                await tools.saveToJson('./output/pelando.json', videoList)
                await loadConfigs()
            } else {
                try {
                    await creavideoByPelandoData(video)
                    videoList.splice(0, 1);
                    await tools.saveToJson('./output/pelando.json', videoList)
                    await loadConfigs()
                    index--
                } catch (error) {
                    console.log("Erro criação video " + JSON.stringify(video))
                    videoList.splice(0, 1);
                    await tools.saveToJson('./output/pelando.json', videoList)
                    await loadConfigs()
                    index--
                }
            }
            console.log(videoList)
        } catch (error) {
            console.log(error)
        }
        await sleep(5000)
    }
}
async function creavideoByPelandoData(video) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!video.url.includes("/produto/")) reject()
            currentVideo.url = tools.wrapLinkAfiliado(video.url, config.codigo)
            currentVideo.metadata = {}
            currentVideo.metadata = await content.fetchContent(video.url);
            await tools.saveToJson('./video.json', currentVideo)
            console.log('new video')
            wrapData(video)
            await tools.saveToJson('./video.json', currentVideo)
            console.log('Dados do video salvos em videos.json')
            console.log(currentVideo)
            console.log('Iniciando fase de preparo das imagens...')
            await tools.cleanImgDir()
            await image.downloadImagesFromMetadata()
            await image.removeBgFromImagesMetadata()
            await image.pickImages()
            await telegram.createTelegramMessage()
            //await telegram.telegramSender(config.telegramGroup)
            await tools.saveToJson('./video.json', currentVideo)
            console.log('Iniciando montagem do video...')
            ae.createVideoByHtmldata(currentVideo)
            await tools.saveToJson('./video.json', currentVideo)
            //await ae.render()
            //await ae.convert()
            await tools.saveToJson('./video.json', currentVideo)
            //await upload.uploadVideo()
            database.videos.push(video.url)
            await tools.saveToJson('./output/database.json', database)
            await tools.saveToJson('./video.json', currentVideo)
            resolve()
        } catch (error) {
            console.log(`Erro criacao do video ${JSON.stringify(video)}`)
            reject()
        }
    })
}

async function prepareImages() {
    await tools.cleanImgDir()
    await image.downloadImagesFromMetadata()
    await image.removeBgFromImagesMetadata()
    await image.pickImages()
}


function wrapData(video) {
    currentVideo.name = tools.getVideoName(video)
    if (video.cupom) {
        currentVideo.inserirCupom = 0
        currentVideo.cupom = video.cupom
    } else {
        currentVideo.inserirCupom = 1
    }
    currentVideo.price = video.price
    currentVideo.videoTitle = video.name
    currentVideo.project = config.project
    currentVideo.output = config.output
    currentVideo.converted = config.converted
    currentVideo.tags = config.tags

}




async function loadConfigs() {
    return new Promise(async (resolve, reject) => {
        try {
            config = await tools.loadJson('./config/config.json')
            database = await tools.loadJson('./output/database.json')
            currentVideo = await tools.loadJson('./video.json')
            videoList = await tools.loadJson('./output/pelando.json')
            videoList = sortByKey(videoList, "percent")
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}
function sortByKey(array, key) {
    return array.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
}


async function fetchDataFromProductPage() {
    return new Promise(async (resolve, reject) => {
        try {
            await loadConfigs()
            currentVideo.metadata = await content.fetchContent(currentVideo.url);
            await tools.saveToJson('./video.json', currentVideo)
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
}
