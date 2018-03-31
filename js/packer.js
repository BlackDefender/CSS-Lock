// https://github.com/BlackDefender/packer
/*
Using:
node packer.js
node packer.js --watch

options: --watch --min
options: -w -m

dependencies:
jsmin installed globally (npm i -g jsmin)
*/

const config = require('./packer-config.js').config;

let args = process.argv.slice(2);
let enableWatcher = args.includes('--watch') || args.includes('-w');
let enableMinification = args.includes('--min') || args.includes('-m');

const fs = require('fs');
const pathModule = require('path');

let jsmin;
if(enableMinification){
	let globalPathArray = process.env.PATH.split(pathModule.delimiter);
	let jsminPath = require.resolve(pathModule.join('node_modules', 'jsmin'), {paths:globalPathArray});
	jsmin = require(jsminPath).jsmin;
}

const getTime = () => {
    let date = new Date();
    let hours = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();
    return hours + ':' + (min < 10 ? '0'+min : min) + ':' + (sec < 10 ? '0'+sec : sec);
};

const getFileContent = (path) => {
    if(fs.existsSync(path) && fs.statSync(path).isFile(path) && pathModule.extname(path) === '.js'){
        return fs.readFileSync(path)+'\r\n';
    }
    return '';
};

const getFilesListContent = (list) =>{
    return list.reduce(function(appCode, path){
        let stat = fs.statSync(path);
        if(stat.isFile()){
            return appCode + getFileContent(path);
        }else if(stat.isDirectory()){
            let dirContent = fs.readdirSync(path);
            return appCode + dirContent.reduce((code, item)=>{
                return code + getFileContent(path+'/'+item);
            }, '');
        }
    }, '');
};

const join = () => {
    let startTime = Date.now();
    let libsCode = getFilesListContent(config.libs);
    let appCode = getFilesListContent(config.app);
    if(config.wrapIntoContentLoadedEvent){
        appCode = 'document.addEventListener("DOMContentLoaded", function () {\r\n' + appCode + '});';
    }
    let bundle = libsCode + appCode;
    if(enableMinification){
        bundle = jsmin(bundle);
    }
    fs.writeFileSync(config.bundlePath, bundle);
    let mergeTime = Date.now() - startTime;
    console.log(getTime() +' Completed at ' + mergeTime + 'ms');
};
join();

let watcherTimeoutId;
if(enableWatcher){
    fs.watch(config.watcher.path, ()=>{
        if(watcherTimeoutId) clearTimeout(watcherTimeoutId);
        watcherTimeoutId = setTimeout(join, config.watcher.delay);
    });
}
