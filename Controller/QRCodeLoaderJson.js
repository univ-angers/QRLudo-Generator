/**
 * @Author: alassane
 * @Date:   2018-11-14T00:46:15+01:00
 * @Last modified by:   alassane
 * @Last modified time: 2018-12-04T14:36:48+01:00
 */


/*
 * Permet de créer un objet QRCode à partir d'une image QRCode ou d'instancier un tableau contenant les objets QRCodes obtenus à partir d'une image enregistrant une famille de QRCodes
 */
class QRCodeLoaderJson {

  //Renvoie le QRCode crée à partir des informations du fichier image passé en paramètre
  static loadImage(file, callback) {

    let fileReader = new FileReader();

    fileReader.readAsDataURL(file);

    // `onload` as listener
    fileReader.addEventListener('load', function(ev) {
      let data = ev.target.result;

      //On récupère les données exif de l'image
      let exifObj = piexif.load(data);
      let dataUtf8 = exifObj["0th"][700];

      if (!dataUtf8) {
        throw "L'image est invalide (ne contient pas de métadonnées)";
      }

      let qrcodeString = QRCodeLoaderJson.UTF8ArraytoString(dataUtf8);

      let qrcode;
      let qr = JSON.parse(qrcodeString);

      switch (JSON.parse(qrcodeString).type) {
        case "unique":
          qrcode = new QRCodeUnique(qr.name, qr.data, qr.color);
          break;

        case "xl":
          qrcode = new QRCodeXL(qr.name, qr.data, qr.color);
          break;

        case "ensemble":
          qrcode = new QRCodeEnsemble(qr.name, qr.data, qr.color);
          break;

        case "questionReponse":
          console.log("Créer un qr code question réponse");
          break;

        default:
          throw "QR Code invalide";
          break;
      }

      console.log("restored qr code : ", qrcode);

      if (callback)
        callback(qrcode);

    });

  }


  /*
   * Lit le contenu des métadonnées de l'image passée en paramètre et détecte s'il s'agit d'un qrcode ou d'une famille de qrcodes, puis fait l'appel à la sous fonction en conséquence
   */
  // static traiterImage(data) {
  //   const piexif = require('piexifjs');
  //   const {
  //     JsonCompressor
  //   } = require('./JsonCompressor');
  //   //On récupère les données exif de l'image
  //   let exifObj = piexif.load(data);
  //   let dataUtf8 = exifObj["0th"][700];
  //
  //   if (!dataUtf8) {
  //     throw "L'image est invalide (ne contient pas de métadonnées)";
  //   }
  //
  //   let qrcodeString = QRCodeLoaderJson.UTF8ArraytoString(dataUtf8);
  //   console.log(qrcodeString);
  //   console.log(JSON.parse(qrcodeString));
  //   // let buffer = Buffer.from(dataUtf8);
  //
  //   // decompress buffer
  //   // JsonCompressor.decompress(buffer, QRCodeLoaderJson.creerQRCode);
  //   // console.log(qrcode);
  // }

  //On crée un objet QRCode à partir d'un json recréé
  // static creerQRCode(qrcodeJson) {
  //   const path = require('path');
  //   let root = path.dirname(require.main.filename);
  //   const {
  //     QRCodeUnique
  //   } = require(`${root}/Model/QRCodeJson`);
  //
  //   let qr = JSON.parse(qrcodeJson).qrcode;
  //
  //   let qrcode = new QRCodeUnique(qr.name, qr.data, qr.color);
  //   console.log(qrcode);
  //   // if (qrcode != undefined)
  //   drawQRCode(qrcode);
  // }

  // from utf8 array return string
  static UTF8ArraytoString(array) {
    let result = "";

    for (let i = 0; i < array.length; i++)
      result += String.fromCharCode(array[i]);

    return result;
  }

}

module.exports = {
  QRCodeLoaderJson
};
