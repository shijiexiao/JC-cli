console.log('jc main')
// 找到要执行的核心文件
// 1 要解析用户的参数
const program = require('commander')
const path = require('path')
const {
    version
} = require('./constants')


// 当前进程里面的参数
// console.log(process.argv)
// 解析用户传递过来的参数

const mapActions = {
    create: {
        alias: 'c',
        description: 'create a pro',
        examples: [
            'jc-cli create <project-name>'
        ]
    },
    config: {
        alias: 'conf',
        description: 'config project variables',
        examples: [
            'jc-cli config set <key> <value>',
            'jc-cli config get <k>'
        ]
    },
    '*': {
        alias: '',
        description: 'jc-Tips command not found ',
        examples: []
    }
}

Reflect.ownKeys(mapActions).forEach((action) => {
    // create config 
    // vue create pro
    program.command(action) // 配置命令的name
        .alias(mapActions[action].alias) // 命令的别名
        .description(mapActions[action].description)
        .action(() => {
            if (action === '*') {
                console.log(mapActions[action].description)
            } else { // create config
                // console.log(action)
                // process.argv 【node,jc-cli,create,args]
                // 分配任务
                require(path.resolve(__dirname, action))(...process.argv.slice(3));
                //  
            }
        })
})

// 监听用户的hhelp事件
program.on('--help', () => {
    console.log('\nJC-Examples')
    Reflect.ownKeys(mapActions).forEach((a) => {
        mapActions[a].examples.forEach(e => {
            console.log(`  ${e}`)
        })
    })
})





program.version(version).parse(process.argv)