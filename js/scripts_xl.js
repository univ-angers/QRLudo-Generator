/*
 * @Author: SALIM Youssef
 * @Date:   2018-Nov
 */

$().ready(function() {

  // desactiver les boutons s'il y a rien à lire ou generer
  if (document.getElementById('qrName').value.length == 0) {
    $('#saveQRCode, #listenField, #stop, #preview, #annuler, #ajouterTexte, #showAudio').attr('disabled', true);
  }

  //caché le button stop
  // document.getElementById("stop").style.display = "none";

  //debut Preview
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

        //le cas d'un fichier audio
        if (data.name == 'AudioName') {
          let dataAudio = {
            type: 'music',
            url: 'https://drive.google.com/uc?export=download&id=' + data.id,
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
  //Fin Preview

  //exporter le QR
  $('#saveQRCode').click(function() {
    saveQRCodeImage("/QR-Unique/QR/");
  });


  //debut annuler
  //btn annuler -> reinitialiser l'affichage
  $('#annuler').click(function() {

    document.getElementById('myFormActive').reset();

    //initialiser l'affichage de messages en haut de page
    initMessages();

    //supprimer l'image QR
    var divImgQr = document.getElementById('qrView');
    //tester si le QR existe
    if (divImgQr.hasChildNodes()) {
      divImgQr.removeChild(divImgQr.firstChild);
    }

    //buttons: play + stop -> zone QR
    // document.getElementById("listenField").style.display = "";
    // document.getElementById("stop").style.display = "none";

    //supprimer les textarea, inputs ..
    var divChamps = document.getElementById('cible');
    while (divChamps.firstChild) {
      divChamps.removeChild(divChamps.firstChild);
    }

    //desactiver les buttons
    $('#saveQRCode, #preview, #annuler, #ajouterTexte, #showAudio').attr('disabled', true);
  });
  //fin annuler

  // sur clic du bouton Lire pour ecouter les textes saisis
  // $('button#listenField').click(function(){
  //   document.getElementById("listenField").style.display = "none";
  //   $('#stop').attr('disabled', false);
  //   document.getElementById("stop").style.display = "";
  //   getForm(null);
  // });

  // sur clic du bouton Stop
  // $('button#stop').click(function(){
  //   document.getElementById("stop").style.display = "none";
  //   document.getElementById("listenField").style.display = "";
  //   stopLecture();
  // });

  // ajouter un eventlistener sur playChamp pour lire le champ sur click du bouton
  // $('button.playChamp').click(function(event){
  //   console.log(event.target);
  //   var texte = event.target.parentNode.parentNode.parentNode.parentNode.childNodes[0].childNodes[0].value;
  //   getForm(texte);
  // });

  //charger les fichiers audio dans le Modal 'listeMusic'
  remplirListeMusic();

});

//verifier le champ qrName du formulaire myFormActive puis activer le button generer
function activer_button() {
  if (document.getElementById('qrName').value.length > 0) {
    $('#preview, #annuler, #ajouterTexte, #showAudio').attr('disabled', false);
  }
}

//ajouter une nvlle legende (textarea) a chaque click sur button Texte (pour chaque textarea il faut rajouter à l'attribut class la valeur qrData class="... qrData")
function ajouterChampLegende(valeur = "") {

  var textareaLegende = document.createElement('div');
  textareaLegende.innerHTML = `<textarea id='testtexxtarea' class='form-control qrData' rows='3' name='legendeQR' placeholder='Mettre la légende'>${valeur}</textarea>
  <button type='button' class='btn btn-outline-success legendeQR-close-btn' onclick='supprimerChampLegende(this);'>
  <i class='fa fa-trash-alt'></i></button>`;
  textareaLegende.setAttribute("class", "d-flex align-items-start legendeQR");
  textareaLegende.setAttribute("id", "legendeTexarea");

  document.getElementById('cible').appendChild(textareaLegende);
}

function supprimerChampLegende(e) {
  $(e).parents('div#legendeTexarea').remove();
}

//generer un input 'pour un fichier audio' -> nom de fichier + url (pour chaque input il faut rajouter à l'attribut class la valeur qrData class=".. qrData")
function ajouterChampSon(nom, url) {

  var inputSon = document.createElement('div');
  inputSon.innerHTML = "<input type='text' id='" + url + "' name='AudioName' class='form-control qrData' value='" + nom + "' readonly>" +
    "<button type='button' class='btn btn-outline-success legendeQR-close-btn' onclick='supprimerChampSon(this);'>" +
    "<i class='fa fa-trash-alt'></i>" +
    "</button>";
  inputSon.setAttribute("class", "d-flex align-items-start legendeQR");
  inputSon.setAttribute("id", "inputAudio");
  document.getElementById('cible').appendChild(inputSon);

  $('#listeMusic .close').click();

}

//supprimer un champ Audio -> event onclick
function supprimerChampSon(e) {
  $(e).parents('div#inputAudio').remove();
}


//remplir le Modal 'listeMusic' par des fichiers audio depuis le drive
function remplirListeMusic() {
  const fs = require('fs');
  try {
    // Load client secrets from a local file.
    fs.readFile('credentials.json', function processClientSecrets(err, content) {
      if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
      }
      // Authorize a client with the loaded credentials, then call the Drive API.
      authorize(JSON.parse(content), listFiles);
      //  console.log(listFiles);
    });
  } catch (e) {
    alert('Erreur : ' + e.stack);
  }

}
