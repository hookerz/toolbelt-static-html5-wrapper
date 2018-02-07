"use strict";
let fs = require('fs');
let path = require('path');
let process = require('process');
let _ =require('lodash');
let folderPath = '';
let input = null;
let button = null;
let outputLog = null;
let taskRunner = null;
plugin.onload = init; // triggered when Toolbelt is ready to display this plugin.
function init() {
  console.log ('!! plugin init',process.cwd(),plugin.path);
  
  
   renderInterface();
  //setupCheckbox();
  plugin.init(); // We've rendered our elements, now to tell Toolbelt the plugin is ready to be displayed.
  //openFrame();
}

function renderInterface() {
  // Plugins have access to the DOM of the index.html file this script was loaded in.
  input = document.getElementById('folderFinder');
  input.addEventListener('change', updateFolderList);
  button = document.getElementById('run');
  button.addEventListener('click', clickHandler);
  outputLog = document.getElementById('outputLog');
}

function updateFolderList(e) {
  console.log("!!", input.files[0].path);
  folderPath = input.files[0].path;
}

function buildLogger() {
  return {
    info: function () {
      _.forOwn(arguments,(value,key)=>{
        outputLog.innerHTML += value + "<br />"
    
      });
      console.info.apply(console, arguments);
    },
    log: function () {
      _.forOwn(arguments,(value,key)=>{
        outputLog.innerHTML += value +"<br />"
    
      });
      
      
      
      
      console.log.apply(console, arguments);
    },
    error: function () {
      _.forOwn(arguments,(value,key)=>{
        outputLog.innerHTML += value + "<br />"
    
      });
      console.error.apply(console, arguments);
    }
  }
}

function run() {
  
  let log = buildLogger();
  
  taskRunner = require('./wrapper')(folderPath, log,plugin.path)
  taskRunner.then(function () {
    
      log.log ('!!!! Job Completed' )
    
    })
    .catch(function (errr){
  
      log.log ('!!!! promise rejected',errr )
    })
  
}

function clickHandler() {
  if (folderPath === '') {
    outputLog.innerHTML = "Please select a valid folder first";
  } else {
    outputLog.innerHTML = "Starting The Run"+"<br />";
    run()
  }
}

/*
function setupCheckbox() {
  let settingsCheckbox = document.querySelector('#some-setting');
  // The Plugin config object can be modified and added to for saving settings and state of the plugin. This is saved to the project when a user runs "Save Project".
  let isChecked = plugin.config.someSetting; // Retrieve the latest value from the plugin config. When a plugin is loaded, it pulls in the most recent saved config for this plugin into plugin.config.

  settingsCheckbox.checked = plugin.config.someSetting || false; // Default is false if plugin.config.someSetting doesn't exist.

  settingsCheckbox.onclick = () => {
    plugin.config.someSetting = settingsCheckbox.checked; // Update our config with the checkbox's latest state.
  }
}
*/
function openFrame() {
  let frame = plugin.createFrame('Plugin Template Frame', {
    width: 300,
    height: 250,
    x: plugin.frame.width - 5,
    y: plugin.frame.y
  });
  frame.document.body.innerHTML = 'Hello World!';
}

