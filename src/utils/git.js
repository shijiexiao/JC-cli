// const download = require('download-git-repo');
const request = require('./request');
const {
    orgName
} = require('./cliConfig');

class Git {
    constructor() {
        this.orgName = orgName;
    }

    /**
     * 获取项目组中的项目模板列表
     */
   async getProjectList() {
        console.log(`/orgs/JC-Frame-Team/repos`)
       return  await request(`/orgs/JC-Frame-Team/repos`);
    }

    /**
     * 获取项目模板的版本列表
     * @param {String} repo 项目名称
     */
    async getProjectVersions(repo) {
        return await  request(`/repos/JC-Frame-Team/${repo}/tags`);
    }

    /**
     * 下载 github 项目
     * @param {Object} param 项目信息 项目名称 项目版本 本地开发目录
     */
    downloadProject({
        repo,
        version,
        repoPath
    }) {
        // return new Promise((resolve, reject) => {
        //   download(`JC-Frame-Team/${repo}#${version}`, repoPath, (err) => {
        //     if (err) reject(err);
        //     resolve(true);
        //   });
        // });
    }
}

module.exports = Git;