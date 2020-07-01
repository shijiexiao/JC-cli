// 存放用户所需要的常量
const {
    version
} = require('../package.json')

const  downloadDir=`${process.env[  process.platform === 'darwin'?'HOME':'USERPROFILE']}/.template`;


module.exports = {
    version,downloadDir
}