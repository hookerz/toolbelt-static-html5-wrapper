'use strict';
const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');
const relative = require('relative');
const tmp = require('tmp');
const imageinfo = require('imageinfo');
const replace = require('replace-in-file');
const del = require('del');
if (process.env.SOLOTEST !== 'true') {
  tmp.setGracefulCleanup();
}
let main = function (rootDir) {
  return new Promise((resolve, reject) => {
    console.log(`Hello world ${process.env.SOLOTEST}`);
    console.log(`Hello world ${process.cwd()}`);
    const retinaDir = path.normalize(path.join(rootDir, 'Retina'));
    const staticDir = path.join(rootDir, 'Statics');
    const outPutDir = path.join(rootDir, 'Output');
    const templatesDir = path.join(process.cwd(), 'templates', 'dcm');
    let tmpobj = null;
    // tmpobj.removeCallback();
    if (!fs.existsSync(retinaDir)) {
      console.error('retina directory missing');
      reject(new Error('retina directory missing'));
    }
    if (!fs.existsSync(retinaDir)) {
      console.error('static directory missing');
      reject(new Error('static directory missing'));
    }
    tmpobj = tmp.dirSync();
    console.log('Dir: ', tmpobj.name);
    // remove output if it exists.
    process.chdir(rootDir);
    del.sync(outPutDir);
    let retinaImages = null;
    let staticImages = null;
    let missingStatics = null;
    let imageDataObjects = null;
    // application functions.
    let getImageFiles = function (directory) {
      return _.map(
        glob.sync(path.join(directory, '/**/*.{png,gif,jpg}')),
        (value) => {
          return relative.toBase(directory, value)
        }
      )
    };
    let buildImageFileMap = function () {
      return _.map(
        retinaImages,
        (value) => {
          
          var retObject = {};
  
          retObject['rel']=value;
          retObject['data']=path.parse(value);
          retObject['retinaAbs']=path.join(retinaDir, pathBuilder(value));
          retObject['retinaAbsFile']=path.join(retinaDir, retObject.data.dir,retObject.data.base);
          retObject['staticAbs']=path.join(staticDir, pathBuilder(value));
          retObject['staticAbsFile']=path.join(staticDir, retObject.data.dir,retObject.data.base);
          retObject['tempAbs']=path.join(tmpobj.name, pathBuilder(value));
          retObject['tempAbsFile']=path.join(tmpobj.name, pathBuilder(value) ,retObject.data.base);
          
          return retObject
        }
      )
    };
    let pathBuilder = function (relDir) {
      return relDir.replace('.jpg', '').replace('.gif', '').replace('.png', '')
    };
    let cleanUp = function () {
      if (process.env.SOLOTEST === 'true') {
        return;
      }
      process.chdir(tmpobj.name);
      del.sync([
        path.join(tmpobj.name, '/**'),
        '!' + tmpobj.name,
      ]);
      process.chdir(rootDir);
      tmpobj.removeCallback();
    };
    let deleteFiles = function () {
      _.each(retinaImages, (value) => {
        let source = path.join(retinaDir, value);
        let name = path.basename(source);
        let destinationDirectory = path.join(tmpobj.name, pathBuilder(value));
        let image = path.join(destinationDirectory, name);
        let css = path.join(destinationDirectory, 'main.css');
        let html = path.join(destinationDirectory, 'index.html');
        process.chdir(destinationDirectory);
        del.sync([image, css, html]);
      })
    };
    let buildZip = function () {
      _.each(imageDataObjects, (value) => {

        let zip = new require('node-zip')();
        let image = fs.readFileSync(path.join(value.tempAbs, value.data.base));
        let css = fs.readFileSync(path.join(value.tempAbs, 'main.css'));
        let html = fs.readFileSync(path.join(value.tempAbs, 'index.html'));
        zip.file('index.html', html);
        zip.file('main.css', css);
        zip.file( value.data.base, image, {base64: true});
        let data = zip.generate({base64: false, compression: 'DEFLATE'});
        let zipFileName = path.join(value.tempAbs,  value.data.name+'.zip');
        fs.writeFileSync(zipFileName, data, 'binary');
      })
    };
    let writeValuesToTemplates = function () {
      _.each(imageDataObjects, (value) => {

        let info = imageinfo(fs.readFileSync(value.tempAbsFile));
        let finalWidth = info.width / 2;
        let finalHeight = info.height / 2;
        replace.sync({
          files: [
            path.join(value.tempAbs, '/**/*.html'),
            path.join(value.tempAbs, '/**/*.css')
          ],
          from: [/__IMAGE__/g, /__WIDTH__/g, /__HEIGHT__/g],
          to: [value.data.base, finalWidth, finalHeight]
        })
      })
    };
    let copyRetinaImages = function () {
      _.each(imageDataObjects, (value) => {
        fs.copySync(value.retinaAbsFile, value.tempAbsFile)
      })
    };
    let copyStaticsImages = function () {
      _.each(imageDataObjects, (value) => {
        fs.copySync(value.staticAbsFile, value.tempAbsFile)
      })
    };
    let copyToFinal = function () {
      fs.copySync(tmpobj.name, outPutDir)
    };
    let copyTemplates = function () {
      _.each(imageDataObjects, (value) => {
        
        fs.copySync(templatesDir, value.tempAbs)
      })
    };
    let makeOutputDirs = function () {
      _.each(imageDataObjects, (value) => {
        
        fs.ensureDirSync(value.tempAbs);
      })
    };
    let checkStaticsExist = function () {
      let missing = _.difference(retinaImages, staticImages);
      if (missing.length !== 0) {
        return missing
      }
      return null;
    };
    let buildLists = function () {
      retinaImages = getImageFiles(retinaDir);
      staticImages = getImageFiles(staticDir);
      
      missingStatics = checkStaticsExist();
      if (missingStatics !== null) {
        let err = new Error('static directory missing');
        err.missingStatics = missingStatics;
        console.error('statics are missing ', err.missingStatics);
        reject(err);
      }
      imageDataObjects = buildImageFileMap();
    };
    let run = function () {
      buildLists();
      makeOutputDirs();
      copyTemplates();
      copyRetinaImages();
      writeValuesToTemplates();
      buildZip();
      deleteFiles();
      copyStaticsImages();
      //
      copyToFinal();
      cleanUp();
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



