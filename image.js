
var fs = require('fs')
    , gm = require('gm');
const tools = require('./tools')
const self = this
const path = require('path')

exports.pickImages = async function () {
    return new Promise(async (resolve, reject) => {
        try {
            var currentVideo = await tools.loadJson('./video.json')
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
        } catch (error) {
            reject(error)
        }
    })
}

exports.downloadImagesFromMetadata = function () {
    return new Promise(async (resolve, reject) => {
        try {
            var video = await tools.loadJson('./video.json')
            video.images = []
            for (var index = 0; index < video.metadata.images.length; index++) {
                const imageUrl = video.metadata.images[index].large;
                try {
                    const file = `./assets/Footage/imgs/image${index}.jpg`;
                    await tools.downloadFile(imageUrl, file)
                    video.images.push(path.join(__dirname, file))
                    console.log(`${imageUrl} -> ${path.join(__dirname, file)} Download Success!`)
                } catch (error) {
                    reject(error)
                }
            }
            await tools.saveToJson('./video.json', video)
            console.log('Metadados das imagens salvos em video.json')
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}
exports.removeBgFromImagesMetadata = function () {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('Convertendo imagem para PNG')
            var video = await tools.loadJson('./video.json')
            video.imagesNoBg = []
            for (let index = 0; index < video.images.length; index++) {
                const img = video.images[index];
                try {
                    const file = `./assets/Footage/imgs/imageNoGb${index}.png`
                    await self.removeBackground(img, file)
                    console.log(`Convertendo imagem ${img} -> ${path.join(__dirname, file)}`)
                    video.imagesNoBg.push(path.join(__dirname, file))
                } catch (error) {
                    reject(error)
                }
            }
            await tools.saveToJson('./video.json', video)
            console.log('Metadados das imagens salvos em video.json')
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}
exports.removeBackground = function (src, dest) {
    return new Promise(async (resolve, reject) => {
        gm(src)
            .write(dest, function (err) {
                if (err) reject()
                resolve()
            });
    })
}