const tools = require('./tools')
const content = require('./content')
const image = require('./image')
const ae = require('./after-effects')
const upload = require('./upload')
const telegram = require('./telegram')
const pelando = require('./pelando')
const request = require('request')
var config = {}
var videoList = []
var currentVideo = {}
var database = []


loadConfigs().then(() => {
    console.log('Configurações carregadas! Iniciando programa')
    this.createVideo()
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
                "Force download metadata"])
        switch (i) {
            case 0:
                this.createVideo()
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
                await prepareImages()
                break;
            case 5:
                await fetchDataFromProductPage()
                break;
            default:
                break;
        }
    })
}


exports.createVideo =  async function () {
    try {
        await loadConfigs()
        await pelando.fetchData()
        var video = {}
        for (let index = 0; index < videoList.length; index++) {
            try {
                console.log('Criando novo video')
                await loadConfigs()
                video = videoList[index];
                console.log(video)
                if (database.videos.includes(video.url)) {
                    console.log("video ja criado!")
                } else {
                    try {
                        await creavideoByPelandoData(video)
                        videoList.splice(index, 1);
                        await tools.saveToJson('./output/pelando.json', videoList)
                        await loadConfigs()
                    } catch (error) {
                        console.log("Erro criação video " + JSON.stringify(video))
                    }
                }

            } catch (error) {
                console.log("Erro na criação do video " + JSON.stringify(video))
                console.log(error)
                process.exit()
            }
        }
        this.createVideo()
    } catch (error) {
        console.log(error)
    }
}
async function creavideoByPelandoData(video) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!video.url.includes("/produto/")) reject()
            currentVideo.url = tools.wrapLinkAfiliado(video.url, config.codigo)
            try {
                currentVideo.metadata = {}
                currentVideo.metadata = await content.fetchContent(video.url);
                await tools.saveToJson('./video.json', currentVideo)
            } catch (error) {
                console.log("Erro on fetch products")
                reject()
            }
            wrapData(video)
            await tools.saveToJson('./video.json', currentVideo)

            console.log('Dados do video salvos em videos.json')
            console.log(currentVideo)
            try {
                await prepareImages()
            } catch (error) {
                console.log('Erro na preparaçao das imagens')
                creavideoByPelandoData(video)
            }
            try {

                await telegram.createTelegramMessage()
                await telegram.telegramSender(config.telegramGroup)
                await tools.saveToJson('./video.json', currentVideo)
            } catch (error) {
                console.log("Erro on telegram sender")
                reject()
            }
            try {
                await mountTemplate()
                await tools.saveToJson('./video.json', currentVideo)
            } catch (error) {
                console.log('Erro no download e preparação das imagens')
                reject()
            }
            try {
                await ae.render()
                await ae.convert()
                await tools.saveToJson('./video.json', currentVideo)
            } catch (error) {
                console.log('Error on converting')
                reject()
            }
            try {
                await upload.uploadVideo()
                database.videos.push(video.url)
                await tools.saveToJson('./output/database.json', database)
                await tools.saveToJson('./video.json', currentVideo)
            } catch (error) {
                console.log('Erro on upload')
                reject()
            }
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}

async function prepareImages() {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('Iniciando fase de preparo das imagens...')
            await tools.cleanImgDir()
            await image.downloadImagesFromMetadata()
            await image.removeBgFromImagesMetadata()
            await image.pickImages()
            resolve()
        } catch (error) {
            console.log(error)
            console.log('Erro na prepação das imagens')
            console.log('Operação cancelada')
            process.exit()
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

async function mountTemplate() {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('Iniciando montagem do video...')
            currentVideo = await tools.loadJson('./video.json')
            ae.createVideoByHtmldata(currentVideo)
            resolve()
        } catch (error) {
            console.log('Erro na montagem do template')
            console.log('Operação cancelada')
            console.log(error)
            process.exit()
        }
    })
}


async function loadConfigs() {
    return new Promise(async (resolve, reject) => {
        try {
            config = await tools.loadJson('./config/config.json')
            database = await tools.loadJson('./output/database.json')
            currentVideo = await tools.loadJson('./video.json')
            videoList = await tools.loadJson('./output/pelando.json')
            resolve()
        } catch (error) {
            reject(error)
        }
    })
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
