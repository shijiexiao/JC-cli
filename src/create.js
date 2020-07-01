// create  所有逻辑
// 拉取 当前所有项目 都列出来   让用户选择安装哪个项目 ProjetName
// 选完后 再显示所有的版本号
// 可能还需要用户配置一些数据  来结合渲染我的项目
// const axios = require('axios')
const ora = require('ora');
const fs=require('fs')
const Git = require('./utils/git');
const git = new Git()
const {downloadDir} =require('./constants')
const {promisify}=require('util')
const path=require('path') // node 核心模块
let ncp=require('ncp')
let downloadGitRepos=require('download-git-repo')

const MetalSmith=require('metalsmith'); // 遍历文件夹  看需不需要渲染
const { resolve } = require('path');
const { rejects } = require('assert');
const Inquirer = require('inquirer');
const cons = require('consolidate');
const { forEach } = require('../ask');
let {render} =require('consolidate').ejs
render=promisify(render)

// 把异步的api转换成promise
downloadGitRepos=promisify( downloadGitRepos)
ncp=promisify( ncp)
// 1) 获取项目列表
// 封裝loading效果
const waitFnLoading=(fn,message)=> async (...args)=>{
    const spinner=ora(message)
    spinner.start()
    const result=await fn(...args);
    spinner.succeed()
    return result;
}
const download=async(repo,tag)=>{
    // 
    let api=`JC-Frame-Team/${repo}`
    if(tag)
    {
        api+=`#${tag}`
    }
    // /user/xxx/.template/repo
    const dest=`${downloadDir}/${repo}`
    await   downloadGitRepos(api,dest)
    return dest;
}
module.exports = async(projectName) => {
  
    console.log('create  file', projectName)

    // const agent = new https.Agent();
    // axios.get('https://api.github.com/users/jiejackhuang/repos', {
    //     headers: {
    //         // referer: '127.0.0.1:8899', //指定referer
    //         // host: 'xxxx' //指定主机名
    //         'Authorization': 'token 3087f14c646a9244e1d4f7b3af8550276e2e5189',
    //     }
    // }).then(data => {
    //     console.log(data)
    // }, error => {
    //     console.log(error)
    // })
    let repos=await  waitFnLoading( git.getProjectList,'fetching jc template ... 耐心等候哦')()
    // const spinner=ora('fetching jc template ... 耐心等候哦')
    // spinner.start()
    // let repos=await git.getProjectList()
    // spinner.succeed()
    
    // console.log('repos', repos);
    repos = repos.map(item => item.name)
    // console.log('repos', repos);
    const {repo}=await Inquirer.prompt({
        name:'repo', //獲取選擇後的結果
        type:'list',
        message:'please choose a template to create JC project',
        choices:repos
    })
    // // 选择当前版本号
    let tags=await  waitFnLoading( git.getProjectVersions,'fetching getProjectVersions ...')(repo)

        tags=tags.map(item=> item.name)
        const {tag}=await Inquirer.prompt({
            name:'tag', //獲取選擇後的結果
            type:'list',
            message:'please choose a tags to create JC project',
            choices:tags
        })
    console.log(repo,tag) // 下载模板

    // 把魔板放到临时目录里面 存好以备后期使用
     let dest=  await waitFnLoading (download,'小jc正在全力下载中 downloading...')(repo,tag)
     console.log(dest)
//   我拿到了下载的目录  直接拷贝当前执行的目录下即可  、、ncp  拷贝

// 把template 下的文件拷贝达到执行命令的  path.resolve() 当前目录下 
// kao bei  opration
//  这个项目名字是否已经存在 如果存在   提示当前项目已经存在

// 如果有ask.js文件  //.template
if(!fs.existsSync(path.join(dest,'ask.js'))){

   await ncp(dest,path.resolve(projectName))  // KAOBEI HENKUAI 
}else{
    //  复杂的需要魔板渲染 渲染后再拷贝
    // 如果有ask文件 就是一个复杂的魔板  需要用户选择，选择后编译魔板
    // 1) 让用户填信息
    console.log('res',dest)
    await new Promise((resolve,reject)=>{
        MetalSmith(__dirname) // 如果传入路径 默认会遍历当前路径的src文件
        .source(dest).destination(path.resolve(projectName))
          .use(async (files,metal,done)=>{
            console.log('ressssssssssss',dest)
              const args=require(path.join(dest,'ask.js'))
              const choice=await Inquirer.prompt(args)
              console.log(choice)
            //   我现在 要把choice 传递给下一个use   
            // 我在此use获得的参数传递给下一个use靠的就是metal .meatldata()
             const meta=metal.metadata()
             Object.assign(meta,choice)
             delete files['ask.js']
              done()  
   
          }).use((files,metal,done)=>{
            // 根据用户的输入 下载魔板
            const transChoice=metal.metadata()
            Reflect.ownKeys(files).forEach(async (file)=>{
                // console.log('files start' ,files)
                if(file.includes('js') || file.includes('json')){
                    let content=files[file].contents.toString() //文件的内容
                    if(content.includes('<%')){
                        content =await render(content,transChoice) // 把上面的use传下来的 choice render渲染的魔板上
                        files[file].contents=Buffer.from(content)
                    }
                }
            })
              done()
          })
          
          .build(err=>{
              if(err) reject()
              else resolve()
          })
    })
    // 2.拿着用户填的信息去渲染魔板
}



}
