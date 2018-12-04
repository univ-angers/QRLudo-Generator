/**
 * @Author: alassane
 * @Date:   2018-11-14T00:45:25+01:00
 * @Last modified by:   alassane
 * @Last modified time: 2018-12-04T14:33:20+01:00
 */



/**
 * Jules Leguy
 * 2017
 **/


/*
 * Permet de créer un objet QRCode à partir d'une image QRCode ou d'instancier un tableau contenant les objets QRCodes obtenus à partir d'une image enregistrant une famille de QRCodes
 */
class QRCodeLoader {

  //Renvoie le QRCode crée à partir des informations du fichier image passé en paramètre
  static loadImage(file, callback) {
    var qrcode;
    var fileReader = new FileReader();

    fileReader.readAsDataURL(file);

    // `onload` as listener
    fileReader.addEventListener('load', function(ev) {
      console.log("dataUrlSize:", ev.target.result.length);

      // it's not a qr code xml, so load json qr code
      if (QRCodeLoader.__traiterImage(ev.target.result) == false) {
        let facade = new FacadeController();
        facade.importQRCodeJson(file, callback);
        return;
      } else
        qrcode = QRCodeLoader.__traiterImage(ev.target.result);

      if (!Array.isArray(qrcode) && qrcode.getTypeQR() == DictionnaireXml.getValTypeAtomique() && qrcode.appartientFamille()) {
        alert("Les QR Codes appartenant a une famille ne peuvent pas être chargés séparément. Merci de charger l'image de la famille complète.");
        return;
      }

      // renvoyer le qrcode créé avec la méthode en conséquence pour recréer la vue
      if (callback) {
        if (Array.isArray(qrcode)) {
          callback(qrcode);
        } else {
          let qr = QRCodeLoader.parseXMLtoJson(qrcode);
          callback(qr);
          // console.log(qr);
          // console.log(qrcode.getTailleContenu());
          // for (var i = 0; i < qrcode.getTailleContenu(); i++) {
          //   console.log(qrcode.getTexte(i));
          //   console.log(qrcode.getTypeContenu(i));
          // }
          // console.log(qrcode.getTypeQR());
          // console.log(qrcode.getDonneesUtilisateur());
          // console.log(qrcode.getColorQRCode());
          // callback(qrcode, drawQRCodeAtomique);
        }
      }
    });

  }

  static parseXMLtoJson(qrcodeXML) {
    let type = qrcodeXML.getTypeQR();
    let data = [];
    let color = qrcodeXML.getColorQRCode();

    for (var i = 0; i < qrcodeXML.getTailleContenu(); i++) {
      if (qrcodeXML.getTypeContenu(i) == "texte")
        data.push(qrcodeXML.getTexte(i));
      else if (qrcodeXML.getTypeContenu(i) == "fichier")
        data.push(qrcodeXML.getUrlFichier(i));
    }

    let qrcode;
    switch (type) {
      case "atomique":
        qrcode = new QRCodeUnique("", data, color);
        break;
      case "ensemble":
        break;
      default:
        break;
    }

    return qrcode;
  }

  /*
   * Lit le contenu des métadonnées de l'image passée en paramètre et détecte s'il s'agit d'un qrcode ou d'une famille de qrcodes, puis fait l'appel à la sous fonction en conséquence
   */
  static __traiterImage(data) {
    //On récupère les données exif de l'image
    var exifObj = piexif.load(data);
    var dataUtf8 = exifObj["0th"][700];

    if (!dataUtf8) {
      throw "L'image est invalide (ne contient pas de métadonnées)";
    }

    //On convertit les données en chaîne de caractères
    var donnees = QRCodeLoader.bin2String(dataUtf8);

    if (donnees[0] != "<")
      return false;
    //On convertit la chaine xml en données xml
    var qrxml = new window.DOMParser().parseFromString(donnees, "text/xml")

    //On vérifie qu'on a bien réussi à parser le xml
    if (!qrxml)
      throw "L'image est invalide (xml incorrect)";


    var nomPremierNoeud = qrxml.firstChild.nodeName;

    if (nomPremierNoeud == "qrcode") {
      return QRCodeLoader.__creerQRCode(qrxml.firstChild);
    } else if (nomPremierNoeud == "qrcodesfamille") {
      console.log("test:" + qrxml.getElementsByTagName(DictionnaireXml.getTagRacine()));
      return QRCodeLoader.__creerFamilleQRCodes(qrxml);
    }

  }

  /*
   * Crée et renvoie un tableau de qrcodes d'une même famille issus d'une image conteneur famille
   */
  static __creerFamilleQRCodes(xmlNode) {
    var listeFamille = new Array();

    var listeFamilleXml = xmlNode.getElementsByTagName(DictionnaireXml.getTagRacine());


    for (var i = 0; i < listeFamilleXml.length; i++) {
      listeFamille.push(QRCodeLoader.__creerQRCode(listeFamilleXml[i]));
    }

    return listeFamille;
  }

  //On crée un objet QRCode à partir des données reconstituées
  static __creerQRCode(xmlNode) {
        //On lit le type de QRCode contenu dans l'image
    var typeQRCode = xmlNode.getElementsByTagName(DictionnaireXml.getTagDonneesUtilisateur())[0].getAttribute(DictionnaireXml.getAttTypeQRCode());

    //On vérifie que le xml est bien formé (qu'il possède un noeud donneesUtilisateur et un noeud metadonnees)
    if (!xmlNode.getElementsByTagName(DictionnaireXml.getTagDonneesUtilisateur()[0]) || !xmlNode.getElementsByTagName(DictionnaireXml.getTagMetaDonnees()[0])) {
      throw "L'image est invalide (xml incorrect)";
    }


    //On instancie un objet QRCode du bon type
    var qrcode;
    switch (typeQRCode) {
      case DictionnaireXml.getValTypeAtomique():
        qrcode = new QRCodeAtomique();
        qrcode.setNoeudRacine(xmlNode);
        break;
      case DictionnaireXml.getValTypeEnsemble():
        qrcode = new QRCodeEnsemble();
        qrcode.setNoeudRacine(xmlNode);
        break;
      default:
        throw "L'image est invalide (le type de QRCode n'est pas reconnu)";
        break;
    }

    return qrcode;

  }


  //Convertit un tableau d'entiers en chaîne de caractères
  static bin2String(array) {
    var result = "";
    for (var i = 0; i < array.length; i++) {
      result += String.fromCharCode(array[i]);
    }
    return result;
  }

}

module.exports = {
  QRCodeLoader
};

/**
 * Copyright © 12/02/2018, Corentin TALARMAIN, Thomas CALATAYUD, Rahmatou Walet MOHAMEDOUN, Jules LEGUY, David DEMBELE, Alassane DIOP
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * The Software is provided “as is”, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders X be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the Software.
 * Except as contained in this notice, the name of the Corentin TALARMAIN, Thomas CALATAYUD, Rahmatou Walet MOHAMEDOUN, Jules LEGUY, David DEMBELE, Alassane DIOP shall not be used in advertising or otherwise to promote the sale, use or other dealings in this Software without prior written authorization from the Corentin TALARMAIN, Thomas CALATAYUD, Rahmatou Walet MOHAMEDOUN, Jules LEGUY, David DEMBELE, Alassane DIOP
 */
