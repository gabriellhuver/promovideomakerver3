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

loadConfigs().then(async () => {
    console.log('Configurações carregadas! Iniciando programa')
    if (DEBUG) init()
    else await self.createVideo()
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
                    reject(new Error("Erro on telegram sender"))
                }
                break;
            case 4:
                await prepareImages()
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
    return new Promise(async (resolve, reject) => {
        try {
            while (true) {
                await loadConfigs()
                if (videoList.length === 0) {
                    await pelando.fetchData()
                    await loadConfigs()
                }
                var video = {}
                console.log('Criando novo video')
                await loadConfigs()
                video = videoList[0];
                if (!video) reject(new Error('Error video null'))
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
                    } catch (error) {
                        console.log("Erro criação video " + video.name)
                        videoList.splice(0, 1);
                        await tools.saveToJson('./output/pelando.json', videoList)
                        await loadConfigs()
                    }
                }
                await loadConfigs()
                console.log(`Esperando ${config.delay} Secs para crianção do proximo video`)
                await sleep(1000 * config.delay)
            }
        } catch (error) {
            console.log(error)
            reject()
        } finally {
            await self.createVideo()
        }
    })
}
async function creavideoByPelandoData(video) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!video.url.includes("/produto/")) reject()
            currentVideo.url = tools.wrapLinkAfiliado(video.url, config.codigo)
            currentVideo.metadata = {}
            currentVideo.metadata = await content.fetchContent(video.url);
            if (currentVideo.Product_Name === '') reject(new Error('Error on fetch data'))
            await tools.saveToJson('./video.json', currentVideo)
            console.log('new video')
            wrapData(video)
            await tools.saveToJson('./video.json', currentVideo)
            console.log('Dados do video salvos em videos.json')
            console.log('Iniciando fase de preparo das imagens...')
            await prepareImages()
            console.log(currentVideo)
            currentVideo = await tools.loadJson('./video.json')
            ae.createVideoByHtmldata(currentVideo)
            console.log('Video criado com sucesso!')
            await telegram.createTelegramMessage()
            console.log('Mensagem do telegram criada!')
            await telegram.telegramSender(config.telegramGroup)
            database.videos.push(video.url)
            await tools.saveToJson('./output/database.json', database)
            console.log('Iniciando montagem do video...')
            await tools.saveToJson('./video.json', currentVideo)
            console.log('Iniciando renderização!')
            await ae.render()
            console.log('Iniciando conversão!')
            await ae.convert()
            await tools.saveToJson('./video.json', currentVideo)
            await upload.uploadVideo()
            console.log('Upload finalizado!')
            await tools.saveToJson('./video.json', currentVideo)
            resolve()
        } catch (error) {
            console.log(error)
            console.log(`Erro criacao do video ${JSON.stringify(video)}`)
            reject(error)

        }
    })
}

async function prepareImages() {
    return new Promise(async (resolve, reject) => {
        try {
            await tools.cleanImgDir()
            await image.downloadImagesFromMetadata()
            await image.removeBgFromImagesMetadata()
            await image.pickImages()
            resolve()
        } catch (error) {
            reject(error)
        }
    })
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
