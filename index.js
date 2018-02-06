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
    let retinaImages = null;
    let staticImages = null;
    let missingStatics = null;
    let getImageFiles = function (directory) {
      return _.map(
        glob.sync(path.join(directory, '/**/*.{png,gif,jpg}')),
        (value) => {
          return relative.toBase(directory, value)
        }
      )
    };
    let pathBuilder = function (relDir) {
      return relDir.replace('.jpg', '').replace('.gif', '').replace('.png', '')
    };
    let copyRetinaImages = function () {
      _.each(retinaImages, (value) => {
        let source = path.join(retinaDir, value);
        let destination = path.join(tmpobj.name, pathBuilder(value),path.basename(source));
        fs.copySync(source, destination)
      })
    };
    let copyToFinal = function () {
      fs.copySync(tmpobj.name, outPutDir)
    };
    let copyTemplates = function () {
      _.each(retinaImages, (value) => {
        let item = path.join(tmpobj.name, pathBuilder(value));
        fs.copySync(templatesDir, item)
      })
    };
    let makeOutputDirs = function () {
      _.each(retinaImages, (value) => {
        let item = path.join(tmpobj.name, pathBuilder(value));
        fs.ensureDirSync(item);
      })
    };
    let checkStaticsExist = function () {
      let missing = _.difference(retinaImages, staticImages);
      if (missing.length !== 0) {
        return missing
      }
      return null;
    };
    let run = function () {
      retinaImages = getImageFiles(retinaDir);
      staticImages = getImageFiles(staticDir);
      missingStatics = checkStaticsExist();
      if (missingStatics !== null) {
        let err = new Error('static directory missing');
        err.missingStatics = missingStatics;
        console.error('statics are missing ', err.missingStatics);
        reject(err);
      }
      makeOutputDirs();
      copyTemplates();
      copyRetinaImages();
      copyToFinal();
      resolve();
    };
    run()
    // end promise
  });
};
let reductiveItterator = function (sourceArray, iteree) {
  sourceArray = _.cloneDeep(sourceArray);
  return new Promise((resolve, reject) => {
    let run = function () {
      let item = _.remove(sourceArray, (value, index) => {
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



