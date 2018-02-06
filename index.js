'use strict';
const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');
const relative = require('relative');
const tmp = require('tmp');
let main = function (rootDir) {
  return new Promise((resolve, reject) => {
    console.log(`Hello world ${process.env.SOLOTEST}`);
    console.log(`Hello world ${process.cwd()}`);
    const retinaDir = path.normalize(path.join(rootDir, 'Retina'));
    const staticDir = path.join(rootDir, 'Statics');
    const outPutDir = path.join(rootDir, 'Output');
    const templatesDir = path.join(process.cwd(), 'templates', 'dcm');
    const tmpobj = tmp.dirSync();
    console.log('Dir: ', tmpobj.name);
    // tmpobj.removeCallback();
    if (!fs.existsSync(retinaDir)) {
      console.error('retina directory missing');
      reject(new Error('retina directory missing'));
    }
    if (!fs.existsSync(retinaDir)) {
      console.error('static directory missing');
      reject(new Error('static directory missing'));
    }
    let retinaImages = getImageFiles(retinaDir);
    let staticImages = getImageFiles(staticDir);
    let missingStatics = checkStaticsExist(retinaImages, staticImages);
    if (missingStatics !== null) {
      let err = new Error('static directory missing');
      err.missingStatics = missingStatics;
      console.error('statics are missing ', err.missingStatics);
      reject(err);
    }
    makeOutputDirs(tmpobj.name, retinaImages)
    if (fs.existsSync(tmpobj.name)) {
      return fs.copySync(tmpobj.name, outPutDir)
    } else {
      console.log('wtf')
    }
  })
};
let makeOutputDirs = function (rootDir, dirs) {
  
  _.each (dirs,(value)=>{
  
    let item = path.join(rootDir, value.replace('.jpg', '').replace('.gif', '').replace('.png', ''));
    fs.ensureDirSync(item);
    
  })
  
  

};
let getImageFiles = function (directory) {
  return _.map(
    glob.sync(path.join(directory, '/**/*.{png,gif,jpg}')),
    (value) => {
      return relative.toBase(directory, value)
    }
  )
};
let checkStaticsExist = function (retinas, statics) {
  let missing = _.difference(retinas, statics);
  if (missing.length !== 0) {
    return missing
  }
  return null;
};
let reductiveItterator = function (sourceArray, iteree) {
  sourceArray = _.cloneDeep(sourceArray);
  return new Promise(function (resolve, reject) {
    let run = function () {
      let item = _.remove(sourceArray, function (value, index) {
        return index === 0;
      });
      if (item.length === 0) {
        resolve();
        return;
      }
      item = item[0];
      iteree(item)
        .then(run);
    };
    run();
  })
};
module.exports = main;
if (process.env.SOLOTEST === 'true') {
  main('G:\\DOCS\\Out Loud ANEW\\internal 2018\\toolbelt-static-html5-wrapper\\testData')
}



