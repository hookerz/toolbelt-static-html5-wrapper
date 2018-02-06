'use strict';

const _ = require('lodash');
const path = require('path');
const fs = require('fs');

let main = function (rootDir) {

  console.log (`Hello world ${process.env.SOLOTEST}`);
  console.log (`Hello world ${process.cwd()}`);
  
  const retinaDir = path.join(rootDir,'Retina');
  const staticDir = path.join(rootDir,'Statics');
  
  
  if (!fs.existsSync(retinaDir)) {
    throw 'retina directory missing';
  }
  if (!fs.existsSync(retinaDir)) {
    throw 'static directory missing';
  }
  
  
  
  
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

if (process.env.SOLOTEST ==='true') {
  
  main ('G:\\DOCS\\Out Loud ANEW\\internal 2018\\toolbelt-static-html5-wrapper\\testData')
  
}


