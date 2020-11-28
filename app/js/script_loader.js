/**
 * @Author: alassane
 * @Date:   2018-12-04T14:28:52+01:00
 * @Last modified by:   alassane
 * @Last modified time: 2019-01-28T01:41:24+01:00
 */

//Déclaration du store permettant la continuité entre les differents onglets
const Store = require('electron-store');
const store = new Store();

// Boolean qui permet de detecter si l'onglet unique est load dans le cas de l'importation d'un QR unique
isImportationQRUnique = false;

//Déclaration de l'entier renseignant le nombre de zones de donnee dans l'onglet qr unique (les zones de textes ou les fichier audio)
nbZoneDonne = 0;

//Déclaration de l'entier permettant l'implémentation des différentes zones de données dans l'onglet qr unique
numZoneCourante = 0;

//nombre de fichier ajouté dans l'onglet multiple
numFich = 0;

//numero de la reponse dans QR Exercice
numReponse = 0;


const path = require('path');
const root = path.dirname(require.main.filename);
const piexif = require('piexifjs');
const fs = require('fs');
window.$ = window.jQuery = require(__dirname + "/Views/assets/js/jquery.min.js");
require(__dirname + "/Views/assets/js/jquery.qrcode.min.js");
require(__dirname + "/Views/assets/js/jquery-qrcode-0.14.0.min.js");
require(__dirname + "/Views/assets/js/jquery-qrcode-0.14.0.js");
require(__dirname + "/Views/assets/js/bootstrap.min.js");
require(__dirname + "/Views/assets/js/solid.js");
require(__dirname + "/Views/assets/js/fontawesome.js");

// Create QRLudo temp folder if not exist
const {
  exec
} = require('child_process');
switch (process.platform) {
  case 'linux':
    var temp = path.join(process.env.HOME, 'temp/QRLudo');
    fs.access(temp, fs.constants.F_OK, (err) => {
      if (err) {
        var {
          ipcRenderer
        } = require('electron');

        exec(`mkdir -p ${temp}/Download`, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            ipcRenderer.send('exitApp', null);
            return;
          }
        });

        exec(`mkdir -p ${temp}/tts`, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            ipcRenderer.send('exitApp', null);
            return;
          }
        });
      }
    });
    break;

  case 'win32':
    var temp = path.join(process.env.temp, 'QRLudo');
    fs.access(temp, fs.constants.F_OK, (err) => {
      if (err) {
        var {
          ipcRenderer
        } = require('electron');

        exec(`mkdir ${temp}\\Download`, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            ipcRenderer.send('exitApp', null);
            return;
          }
        });

        exec(`mkdir ${temp}\\tts`, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            ipcRenderer.send('exitApp', null);
            return;
          }
        });
      }
    });
    break;

  default:
    console.log('Unknown operating system');
    break;
}

// Check internet connection
if (!navigator.onLine) {
  alert("L'application ne peut pas se lancer sans une liaison à internet. Veuillez vérifier votre connexion internet");
  window.close();
}

var {
  remote,
  ipcRenderer
} = require('electron');
const {
  dialog
} = remote;

const {
  CompresseurTexte
} = require(`${root}/Controller/CompresseurTexte`);

const {
  ControllerMultiple
} = require(`${root}/Controller/ControllerMultiple`);

const {
  FacadeController
} = require(`${root}/Controller/FacadeController`);

const {
  ImageGenerator
} = require(`${root}/Controller/ImageGenerator`);

const {
  ImageGeneratorJson
} = require(`${root}/Controller/ImageGeneratorJson`);

const {
  JsonCompressor
} = require(`${root}/Controller/JsonCompressor`);

const {
  MDFiveConverter
} = require(`${root}/Controller/MDFiveConverter`);

const {
  QRCodeLoader
} = require(`${root}/Controller/QRCodeLoader`);

const {
  QRCodeLoaderJson
} = require(`${root}/Controller/QRCodeLoaderJson`);

const {
  DictionnaireXml
} = require(`${root}/Model/DictionnaireXml`);

const {
  Music
} = require(`${root}/Model/Music`);

const {
  QRCode
} = require(`${root}/Model/QRCode`);

const {
  QRCodeAtomique
} = require(`${root}/Model/QRCodeAtomique`);

const {
  QRCodeMultiple
} = require(`${root}/Model/QRCodeMultiple`);

const {
  QRCodeMultipleJson
} = require(`${root}/Model/QRCodeMultipleJson`);

const {
  QRCodeUnique,
  QRCodeXL
} = require(`${root}/Model/QRCodeJson`);

const {
  QRCodeXMLJson
} = require(`${root}/Model/QRCodeXMLJson`);

const {
  Projet,
  Reponse,
  Question
} = require(`${root}/Model/QRCodeQuestionReponse`);

const { 
  QRCodeQCM,
  ReponseVocale  
} = require(`${root}/Model/QRCodeQCM.js`);

const { 
  ProjetSeriousGame, 
  QRCodeSeriousGame, 
  QRCodeQuestion, 
  RecVocaleQuestion 
} = require('./Model/QRCodeSeriousGame');

const {
  QRCodeQuestionOuverte 
}
= require(`${root}/Model/QRCodeQuestionOuverte.js`);

// Instanciate object
let controllerMultiple = new ControllerMultiple();
