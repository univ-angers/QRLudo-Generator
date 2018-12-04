/**
 * @Author: alassane
 * @Date:   2018-11-10T17:59:11+01:00
 * @Last modified by:   alassane
 * @Last modified time: 2018-12-04T14:56:50+01:00
 */

// fichier script concernant les qr codes uniques

var qrcode;
var qrType;

$(document).ready(function() {
  var settings = require("electron-settings");

  if (settings.has("defaultColor")) {
    $("#qrColor").val(settings.get("defaultColor"));
  }
});

// trigger preview qrcode action
$('#preview').click(e => {

  //enlever les messages en haut de page
  initMessages();
  let inputArray = $('input, textarea');

  if (validateForm(inputArray)) { // all fields are filled
    // get all required attributes for qrcode
    let qrColor = $('#qrColor').val();
    let qrName = $('#qrName').val();
    let qrData = [];

    for (data of $('.qrData')) {
      if (data.name == 'AudioName') {
        let dataAudio = {
          type: 'music',
          url: data.id,
          name: data.value
        }

        let jsonAudio = JSON.stringify(dataAudio);
        qrData.push(JSON.parse(jsonAudio));
      } else
        qrData.push($(data).val());

    }

    qrType = $('#typeQRCode').val();

    // Generate in a div, the qrcode image for qrcode object
    let div = $('#qrView')[0];

    previewQRCode(qrName, qrData, qrColor, div);

    $('#annuler').attr('disabled', false);
  }
});


// form validation return true if all fields are filled
function validateForm(inputArray) {
  //cet index pour enlever un input de type file
  let index = 0;
  initMessages();
  for (input of inputArray) {
    // eliminer les input de type file
    if ($(input).attr('type') != 'file') {
      if (!$(input).val() || $(input).val() == "") {
        messageInfos("Veuillez renseigner tous les champs", "danger"); //message a afficher en haut de la page
        return false;
      }
    } else {
      //enlever l'element input de type file
      inputArray.splice(index, 1);
    }

    ++index;
  }

  return true;
}


// generate and print qr code
function previewQRCode(name, data, color, div) {

  // instanciate a qrcode unique object
  if (qrType == 'xl')
    qrcode = new QRCodeXL(name, data, color);
  else
    qrcode = new QRCodeUnique(name, data, color);

  let facade = new FacadeController();
  facade.genererQRCode(div, qrcode);
}

// save image qr code
function saveQRCodeImage() {
  const fs = require('fs');

  let img = $('#qrView img')[0].src;

  // var data = img.replace(/^data:image\/\w+;base64,/, '');

  var data = img.replace(/^data:image\/[^;]/, 'data:application/octet-stream');

  var xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';
  console.log(data);
  xhr.open('GET', data, true);

  xhr.onreadystatechange = function() {
    if (xhr.readyState == xhr.DONE) {
      var filesaver = require('file-saver');
      console.log(xhr.response);
      filesaver.saveAs(xhr.response, qrcode.getName() + '.jpeg');
    }
  }

  xhr.send();


  // fs.writeFile(`${root}/QR-Unique/QR/${qrcode.getName()}.jpeg`, data, {
  //   encoding: 'base64'
  // }, (err) => {
  //   if (err) throw err;
  //   messageInfos("votre QR est bien sauvegardé","success");
  // });

}
