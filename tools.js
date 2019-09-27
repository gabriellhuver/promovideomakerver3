const readLineSync = require('readline-sync')
const fs = require('fs')
const download = require('image-downloader')

exports.wrapLinkAfiliado = function (url, cod) {
  console.log('Trocando link de afiliado para ' + cod)
  return url.replace("AFL-03-162623", cod)
}
exports.getVideoName = function (video) {
  try {
    var str = String(video.name.split(" ")[0] + " " + video.name.split(" ")[1] + " " + video.name.split(" ")[2] + " " + video.name.split(" ")[3] + " " + video.name.split(" ")[5])
    return str.replace("undefined", "");
  } catch (error) {
    return video.name;
  }
}
exports.read = async function (question) {
  return new Promise((resolve, reject) => {
    try {
      let userRes;
      userRes = readLineSync.question(question);
      if (userRes) {
        resolve(userRes)
      } else {
        read(question)
      }
    } catch (error) {
      reject(error)
    }
  })
}
exports.readOptions = async function (question, prefixies) {
  return new Promise((resolve, reject) => {
    try {
      let index = readLineSync.keyInSelect(prefixies, question);
      if (index === -1) process.exit()
      resolve(index)
    } catch (error) {
      reject(error)
    }
  })
}
exports.loadJson = function (file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    return error
  }
}

exports.saveToJson = function (file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data), 'utf8')
  } catch (error) {
    return error
  }
}
exports.extractHostname = function (url) {
  var hostname;
  if (url.indexOf("//") > -1) {
    hostname = url.split('/')[2];
  } else {
    hostname = url.split('/')[0];
  }
  hostname = hostname.split(':')[0];
  hostname = hostname.split('?')[0];
  return hostname;
}

exports.extractJSON = function (str) {
  var firstOpen, firstClose, candidate;
  firstOpen = str.indexOf('{', firstOpen + 1);
  do {
    firstClose = str.lastIndexOf('}');
    if (firstClose <= firstOpen) {
      return null;
    }
    do {
      candidate = str.substring(firstOpen, firstClose + 1);
      try {
        var res = JSON.parse(candidate);
        return [res, firstOpen, firstClose + 1];
      } catch (e) { }
      firstClose = str.substr(0, firstClose).lastIndexOf('}');
    } while (firstClose > firstOpen);
    firstOpen = str.indexOf('{', firstOpen + 1);
  } while (firstOpen != -1);
}


exports.cleanImgDir = function () {
  return new Promise((resolve, reject) => {
    try {
      var imgPath = "./assets/Footage/imgs/"
      fs.readdir(imgPath, (err, files) => {
        if (err) console.log(err);
        for (const file of files) {
          fs.unlink(imgPath + file, err => {
            if (err) console.log(err);
          });
        }
        resolve()
      });
    } catch (error) {
      console.log(error)
    }
  })
}
exports.loadDescription = function (file) {
  return fs.readFileSync(file, "utf8")
}
exports.downloadFile = function (file_url, targetPath) {
  return new Promise(function (resolve, reject) {
    const headers = {
      'Accept': '*/*',
      'User-Agent': 'request',
    };
    var options = {
      url: file_url,
      dest: targetPath,
      headers: headers
    }
    download.image(options)
      .then(({ filename, image }) => {
        console.log('Saved to', filename)
        resolve(filename)
      })
      .catch((err) => reject(err))
  })
}