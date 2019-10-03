const { fork } = require('child_process');
const tools = require(`./tools`)
const pelando = require('./pelando')
const content = require('./content')
function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
exports.createVideo = function (client) {
    let newFork = null
    client.on('remove', async (item) => {
        var videoList = await tools.loadJson('./output/pelando.json')
        client.emit('message', 'Removing item')
        videoList = videoList.filter((obj) => { return obj.name !== item.name; });
        await tools.saveToJson('./output/pelando.json', videoList)
        client.emit('remove')
        client.emit('message', 'Item removed')
        client.emit('videoList', videoList)

    })
    client.on('message', (msg) => {
        client.emit('message', msg.toString())
    })
    client.on('current', async () => {
        const current = await tools.loadJson(`./video.json`)
        client.emit('current', current)
    })
    client.on('renew', async () => {
        try {
            client.emit('message', 'Atualizando')
            await pelando.fetchData(client)
            client.emit('renew')
            client.emit('message', `Lista atualizada com sucesso!`)
        } catch (error) {
            client.emit('renew')
            client.emit('message', `Erro na procura de dados, feche o navegador que foi aberto!`)
        }
    })
    client.on('disconnect', () => {
        try {
            console.log('Stopped')
            newFork.kill()
            newFork = null
            client.emit('status', false)
        } catch (error) {
            console.log('Tentativa de stop falhada!')
        }
    })
    client.on('videoList', async () => {
        const videoList = await tools.loadJson('./output/pelando.json')
        client.emit('videoList', videoList)
    })
    client.on('open', async () => {
        await content.open()
        client.emit('open')
    })
    client.on('status', () => {
        if (newFork == null) {
            client.emit('status', false)
        } else {
            client.emit('status', true)
        }
    })
    client.on('startBot', () => {
        try {
            console.log('Starting')
            newFork = fork('index.js', [], { silent: true })
            client.emit('status', true)
            client.emit('message', `Started on ${new Date().toTimeString()}`)
            newFork.on('message', msg => {
                console.log(msg.toString());
                client.emit('message', msg)
            });
            newFork.stdout.on('data', async (data) => {
                console.log(data.toString())
                if (data.toString().includes('Criando novo video')) {
                    const videoList = await tools.loadJson('./output/pelando.json')
                    client.emit('videoList', videoList)
                    console.log('Atualizando lista no front')
                }
                client.emit('message', data.toString())
            })
            newFork.on('close', data => {
                client.emit('message', 'Stopped close')
            })
            newFork.on('disconnect', data => {
                client.emit('message', 'Stopped disconnect')
                client.emit('status', false)
            })
            newFork.on('error', data => {
                console.log(data.toString())
                client.emit('message', 'Stopped error')
                client.emit('status', false)
            })
            newFork.on('exit', data => {
                client.emit('message', 'Stopped exit')
                client.emit('status', false)
            })
            newFork.stderr.on('data', (data) => {
                console.log(data.toString())
                client.emit('message', data.toString())
                client.emit('status', false)
            })
        } catch (error) {
            client.emit('message', 'Erro on start proccess')
        }

    })
    client.on('stopBot', () => {
        try {
            console.log(`Stopped by cliend ID: ` + client.id)
            newFork.kill()
            newFork = null;
            client.emit('status', false)
        } catch (error) {
            console.log('Tentativa de stop falhada!')
        }
    })
    client.on('delay', async data => {
        console.log(`Changing delay ${data}`)
        let config = await tools.loadJson('./config/config.json')
        config.delay = data;
        await tools.saveToJson('./config/config.json', config)
        client.emit(data)
    })
    client.on('getConfig', async () => {
        let config = await tools.loadJson('./config/config.json')
        client.emit('getConfig', config)
    })

}