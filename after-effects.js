var ae = require('after-effects')
const hbjs = require('handbrake-js')
const tools = require('./tools')
const path = require('path')
function createVideoByHtmldata() {
    var config = tools.loadJson('./config/config.json')
    var video = tools.loadJson('./video.json')
    console.log('Iniciando criação do video no After Effects ~~ aescript')
    ae.options.program = config.afterEffectsPath
    ae((video) => {
        function setDebuggerState(state) {
            app.preferences.savePrefAsLong("Main Pref Section", "Pref_JAVASCRIPT_DEBUGGER", Number(state))
            app.preferences.saveToDisk();
            app.preferences.reload();
        }
        setDebuggerState(true)
        const primeiraImagem = video.imagesNoBg[video.primeiraImagem];
        app.open(new File(video.project))
        app.project.items[1].items[2].items[1].layer(1).sourceText.setValue(video.name)
        changeFontSize();
        app.project.items[1].items[2].items[2].layer(1).sourceText.setValue(video.price)
        if (video.inserirCupom === 0) {
            app.project.items[1].items[2].items[4].layer(1).sourceText.setValue("UTILIZE NOSSO CUPOM " + String(video.cupom).toUpperCase())

        } else {
            app.project.items[1].items[2].items[4].layer(1).sourceText.setValue("Link na descrição!")

        }
        app.project.items[1].items[1].items[4].layer(2).source.replace(new File(primeiraImagem))

        const segundaImagem = video.imagesNoBg[video.segundaImagem];
        var image2 = new File(primeiraImagem)
        try {
            image2 = new File(segundaImagem)
        } catch (error) { alert(error) }
        app.project.items[1].items[1].items[1].layer(2).source.replace(image2)

        const terceiraImagem = video.imagesNoBg[video.terceiraImagem];
        var image3 = new File(primeiraImagem)
        try {
            image3 = new File(terceiraImagem)
        } catch (error) { alert(error) }
        app.project.items[1].items[1].items[2].layer(2).source.replace(image3)

        app.project.save(new File(video.project))

        function changeFontSize() {
            var textProp = app.project.items[1].items[2].items[1].layer(1).property("Source Text");
            var textDocument = textProp.value;
            if (video.name.length <= 12) {
                textDocument.fontSize = 28;
            } else if (video.name.length >= 12 && video.name.length <= 18) {
                textDocument.fontSize = 20;
            } else if (video.name.length >= 18 && video.name.length <= 24) {
                textDocument.fontSize = 14;
            }
            else {
                textDocument.fontSize = 10;
            }
            textProp.setValue(textDocument);
        }
    }, video);



}


function render() {
    return new Promise(function (resolve, reject) {
        console.log('Iniciando renderização ~~ aerender')
        var config = tools.loadJson('./config/config.json')
        var video = tools.loadJson('./video.json')
        var spawn = require('child_process').spawn;
        var ae = spawn(path.join(config.afterEffectsPath, '\\Support Files\\aerender'), [
            '-project', video.project,
            '-comp', config.comp,
            '-output', video.output,
            '-OMtemplate', config.OMtemplate
        ]);
        ae.stderr.on('data', function (data) {
            process.stdout.write("\r");
            process.stdout.write("\x1b[31m" + data.toString());
            process.stdout.write("\x1b[0m")
        });
        ae.stdout.on('data', function (data) {
            process.stdout.write("\r");
            process.stdout.write(data.toString());
        })
        ae.on('close', function (code) {
            // Video has rendered
            process.stdout.write("\r");
            process.stdout.write("\x1b[32m Renderização finalizada !");
            process.stdout.write("\x1b[0m")
            resolve(code)
        });
    })
}

async function convert() {
    return new Promise(function (resolve, reject) {
        var video = tools.loadJson('./video.json')
        console.log(`Iniciando preparação do video (web optimization ~~ Handbrake)`)
        hbjs.spawn({
            input: video.output,
            output: video.converted,
            optimize: true,
            encoder: 'x264'
        })
            .on('error', err => {
                // invalid user input, no video found etc
                console.log(err)
                reject(err)
            })
            .on('progress', progress => {

                process.stdout.write("\r");
                process.stdout.write(`Preparando video para upload - Percent complete: ${progress.percentComplete}%, ETA: ${progress.eta}`);

                if (progress.percentComplete === 100) {
                    console.log('\nConversão finalizada')

                    resolve()
                }
            })
            .on('close', data => {
                console.log(data)
            })
    })
}

module.exports = {
    render,
    convert,
    createVideoByHtmldata
}