'use strict';


let main = function () {

  console.log (`Hello world ${process.env.SOLOTEST}`)


};

module.exports = main;

if (process.env.SOLOTEST ==='true') {
  
  main ()
  
}