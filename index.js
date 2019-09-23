
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

init()
async function init() {
    return new Promise(async (resolve, reject) => {
        let i = await tools.readOptions('O que deseja fazer?', ["Criar videos", "Abrir navegador"])
        switch (i) {
            case 0:
                createVideo()
                break;
            case 1:
                await content.open()
                init()
                break;
            case 2:
                createVideo()
                break;
            default:
                break;
        }
    })
}


async function createVideo() {
    try {
        console.log('Carregando configurações e banco de dados!')
        config = await tools.loadJson('./config/config.json')
        database = await tools.loadJson('./output/database.json')
        await pelando.fetchData()
        videoList = await tools.loadJson('./output/pelando.json')
        var video = {}
        for (let index = 0; index < videoList.length; index++) {
            try {
                console.log('Criando novo video')
                video = videoList[index];
                if (database.videos.includes(video.url)) {
                    console.log("video ja criado!")
                } else {
                    try {
                        await creavideoByPelandoData(video)
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
        createVideo()
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
                while (!currentVideo.metadata) {
                    try {
                        currentVideo.metadata = await content.fetchContent(video.url);
                    } catch (error) {
                        console.log('Tentando denovo kkk')
                    }
                }
            } catch (error) {
                console.log("Erro on fetch products")
                reject()
            }
            currentVideo.price = video.price
            currentVideo.name = tools.getVideoName(video)
            if (video.cupom) {
                currentVideo.inserirCupom = 0
                currentVideo.cupom = video.cupom
            } else {
                currentVideo.inserirCupom = 1
            }
            currentVideo.videoTitle = video.name
            currentVideo.project = config.project
            currentVideo.output = config.output
            currentVideo.converted = config.converted
            currentVideo.tags = config.tags
            await tools.saveToJson('./video.json', currentVideo)
            console.log('Dados do video salvos em videos.json')
            console.log(currentVideo)
            try {
                await prepareImages()
            } catch (error) {
                console.log('Erro na preparaçao das imagens')
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
            await pickImages()
            resolve()
        } catch (error) {
            console.log(error)
            console.log('Erro na prepação das imagens')
            console.log('Operação cancelada')
            process.exit()
        }
    })
}
async function pickImages() {
    return new Promise(async (resolve, reject) => {
        currentVideo = await tools.loadJson('./video.json')
        if (currentVideo.images.length === 1) {
            currentVideo.primeiraImagem = 0
            currentVideo.segundaImagem = 0
            currentVideo.terceiraImagem = 0

        } else if (currentVideo.images.length === 2) {
            currentVideo.primeiraImagem = 0
            currentVideo.segundaImagem = 1
            currentVideo.terceiraImagem = 0

        } else {
            currentVideo.primeiraImagem = 0
            currentVideo.segundaImagem = 1
            currentVideo.terceiraImagem = 2
        }
        await tools.saveToJson('./video.json', currentVideo)
        resolve()
    })
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




