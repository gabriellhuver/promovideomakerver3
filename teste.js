const pelando = require('./pelando')
const telegram = require('./telegram')
const upload = require('./upload')
const link = "https://www.pelando.com.br/visit/thread/349006"
const request = require('request')
const after = require('./after-effects')
async function testePelando() {
    try {
       await after.render()
    } catch (error) {
        console.log(error)
    }
}
testePelando()
function testeGetLink() {
    var r = request(link, {
        followAllRedirects: true
    }, function (e, response) {
        r.uri
        response.request.uri
        console.log(r.uri)
    })

}
