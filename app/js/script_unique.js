/**
 * @Author: alassane
 * @Date:   2018-11-10T17:59:11+01:00
 * @Last modified by:   alassane
 * @Last modified time: 2019-02-04T21:09:51+01:00
 */

// fichier script concernant les qr codes uniques
var qrcode;
var qrType;

var {
  remote,
  ipcRenderer
} = require('electron');
var {
  Menu,
  MenuItem
} = remote;

var menu = new Menu();

$(document).ready(function() {

  //appel à la focntion qui permet de lire les enregistrement
  chargement();
  SetProgressBar();

  //Use to implement information on the audio import
  var info = document.createElement('div'); // balise div : contain html information
  var info_activ = false; // boolean : give the etat of info (up/off)


  // desactiver les boutons s'il y a rien à lire ou generer
  if (document.getElementById('qrName').value.length === 0) {
    $('#preview').attr('disabled', true);
  }

  $("#saveQRCode").click(e => {
    saveQRCodeImage();
  });

  $('#closeModalListeMusic').click(e => {
    $('#musicUrl').val('');
    $('#listeMusic').find('.errorLoader').remove();
  }); // close modal add music

  // enable right click
  menu.append(new MenuItem({
    label: 'Coller le lien',
    click() {
      const {
        clipboard
      } = require('electron');
      let url = clipboard.readText();
      $('input#musicUrl').val(url);
      getMusicFromUrl();
    }
  }));

  $('input#musicUrl').contextmenu(e => {
    menu.popup(remote.getCurrentWindow())
    if(info_activ == true){
      document.getElementById('elementsAudio').removeChild(info);
      info_activ = false;
    }
  });
   //Show the information about the audio file import (help)
  $('button#showInfo').click(e => {
    e.preventDefault();
    if (info_activ==false){
      info.innerHTML = ``;
      fetch('Views/unique/audioinfo.html').then(function(response) {
        return response.text();
      }).then(function(string) {
        // console.log(string);
        info.innerHTML = string;
      }).catch(function(err) {
        console.log(info.innerHTML);
        info.innerHTML = `Erreur`;
      });
      document.getElementById('elementsAudio').appendChild(info);
      info_activ = true;
    }
    else {
      document.getElementById('elementsAudio').removeChild(info);
      info_activ = false;
    }
    //ipcRenderer.send('showInfoWindow', null);
  });

  $('button#emptyFields').click(function() {

    //mise ajour des données sur le progress bar
    $("#progressbarId").attr('aria-valuenow',0);
    $("#progressbarId").attr("style","width:"+0+"%");
    $("#progressbarId").text(0);
    $("#textarea1").val("");
    $("#qrName").val("");
    console.log("1");
    //FIN progress bar gestion
    //aficher popup quand on click sur reinitialiser
    // cache le qr générer & desactivation du bouton exporter
      //Les différents store sont clean ici
      //if(store.get(`titreUnique`)){
        store.delete(`titreUnique`);
      //implémentation des différentes zones de txt enregistrées
      for(var i = 0; i<=numZoneCourante; i++){
        if (store.get(`zone${i}`)){
          store.delete(`zone${i}`);
        }
    //  }
      console.log("2");
      //On parcours le store pour afficher les texte enregistré dans les zones correspondantes
      for(var i = 0; i<=numZoneCourante; i++){
        if (store.get(`text${i}`)){
          store.delete(`text${i}`);
        }
      }
      console.log("3");
      store.delete("numZoneCourante");
      numZoneCourante = 0;
      store.set(`numZoneCourante`,numZoneCourante);
      store.delete("nbZoneDonne")
      nbZoneDonne = 0;
      store.set(`nbZoneDonne`,nbZoneDonne);

      console.log("4");

      //supprimer les textarea, inputs ..
      var divChamps = $('#cible');
      divChamps.children($('.legendeQR')).remove();
      ajouterChampLegendeInitial();


      $('#qrView').hide();
      $('#saveQRCode').attr('disabled', true);
      $('#preview').attr('disabled', true);

      var settings = require("electron-settings");
      if (settings.has("defaultColor")) {
        $("#qrColor").val(settings.get("defaultColor"));
      }

      $("#ajouterTexte").attr('disabled', false);
    }
  /*  else {
      $("button#annuler").removeAttr('type');
    }*/
  });
});

// trigger preview qrcode action
$('#preview').click(e => {

  //re-afficher le qr generer si le bouton est reinitialiser a deja été utilisé
  $("#qrView").show();

  console.log('preview');
  //enlever les messages en haut de page
  initMessages();
  let inputArray = $('input, textarea');

  // if (validateForm(inputArray)) { // all fields are filled
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

  let newQrUnique = new QRCodeUnique(qrName, qrData, qrColor);
  console.log(newQrUnique);
  previewQRCode(qrName, qrData, qrColor, div);
  //console.log();
  $('#emptyZones').attr('disabled', false);
});


//Fonction permettant la continuité entre les onglet avec la gestion de l'objet store
function chargement(){

  //nombre de zone texte courant
  if(store.get(`nbZoneDonne`))
    numZoneDonne = store.get(`nbZoneDonne`);
  else
    store.set(`nbZoneDonne`,nbZoneDonne);

  if(nbZoneDonne >= 3) {
    disableButtonAddNewData();
  }

  //indice des zones textes presente, peut etre superieur au zone texte presente
  if(store.get(`numZoneCourante`))
    numZoneCourante = store.get(`numZoneCourante`);
  else
    store.set(`numZoneCourante`,numZoneCourante);

  if(store.get(`titreUnique`)){
    $('#qrName').val(store.get(`titreUnique`));
  }

  //implémentation des différentes zones de txt enregistrées
  for(var i = 1; i<=numZoneCourante; i++){
    if (store.get(`zone${i}`)){
      var text = document.createElement('div');
      text.innerHTML = store.get(`zone${i}`);
      text.setAttribute("class", "d-flex align-items-start legendeQR");

      // L'id du div est différent si c'est une zone de texte ou un fichier audio
      if(store.get(`zone${i}`).indexOf("textarea") != -1) {
        text.setAttribute("id", "legendeTextarea");
      }
      else {
        text.setAttribute("id", "inputAudio");
      }

      $('#cible').append(text);
    }
  }

  //On parcours le store pour afficher les texte enregistré dans les zones correspondantes
  for(var i = 0; i<=numZoneCourante; i++){
    if (store.get(`text${i}`)){
      $('#textarea'+(i)).val(store.get(`text${i}`));
    }
  }

  //insertion du premier champ Texte
  if(nbZoneDonne == 0){
    ajouterChampLegendeInitial();
  }

  //On desactive le bouton supprimer quand il y a qu'un seul text area
  if(nbZoneDonne == 1) {
    disableButtonDelete();
  }
}

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

  var data = img.replace(/^data:image\/[^;]/, 'data:application/octet-stream');

  var xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';
  console.log(data);
  xhr.open('GET', data, true);

  xhr.onreadystatechange = function() {
    if (xhr.readyState == xhr.DONE) {
      var filesaver = require('file-saver');
      console.log(xhr.response);
      //Dans les deux cas filsaver.saveAs renvoie rien qui s'apparente à un bolléen
      if(filesaver.saveAs(xhr.response, qrcode.getName() + '.jpeg') == true ){
        console.log(filesaver.saveAs(xhr.response, qrcode.getName() + '.jpeg').getName);
        messageInfos("Le QR code a bien été enregistré", "success"); //message a afficher en haut de la page
      }

    }
  }
  xhr.send();
}


function getMusicFromUrl() {
  let modal = $('#listeMusic').find('div.modal-body.scrollbar-success');
  let loader = document.createElement('div');
  let errorMsg = document.createElement('label');

  const {
    clipboard
  } = require('electron');

  let url = clipboard.readText();
  let xhr = new XMLHttpRequest();

  Music.getDownloadLink(url, link => {
    if (link == null) {
      showError(modal, errorMsg);
      return
    }

    try {
      xhr.open('GET', link, true);
    } catch (e) {
      showError(modal, errorMsg);
    }
    xhr.responseType = 'blob';
    xhr.onload = function(e) {

      if (this.status == 200) {
        let blob = this.response; // get binary data as a response
        let contentType = xhr.getResponseHeader("content-type");
        console.log(contentType);

        if (contentType == 'audio/mpeg' || contentType == 'audio/mp3') {
          // get filename
          let filename = xhr.getResponseHeader("content-disposition").split(";")[1];
          filename = filename.replace('filename="', '');
          filename = filename.replace('.mp3"', '.mp3');

          // save file in folder projet/download
          let fileReader = new FileReader();
          fileReader.onload = function() {
            fs.writeFileSync(`${temp}/Download/${filename}`, Buffer(new Uint8Array(this.result)));

            $(loader, errorMsg).remove();
            $('#closeModalListeMusic').click(); // close modal add music
          };
          fileReader.readAsArrayBuffer(blob);

          ajouterChampSon(filename, link);
        } else {
          showError(modal, errorMsg, "Le fichier n'est pas un fichier audio");
        }
      } else {
        // request failed
        showError(modal, errorMsg);
      }
    };

    xhr.onloadstart = function(e) {
      console.log('load start');
      $(loader).addClass('loader');
      $(modal).find('.errorLoader').remove();
      $(modal).prepend(loader); // show loader when request progress
    };

    xhr.onerror = function(e) {
      showError(modal, errorMsg);
    };

    xhr.send();
  });
}

function showError(modal, errorMsg, message = "Veuillez coller un lien de fichier téléchargeable. Reportez vous à la rubrique Info pour plus d'informations.") {
  console.log('error ');
  $(modal).find('.loader').remove();
  $(errorMsg).text(message);
  $(errorMsg).css('color', '#f35b6a');
  $(errorMsg).addClass('errorLoader');
  $(modal).prepend(errorMsg); // add error message
}

//verifier le champ qrName du formulaire myFormActive puis activer le button generer
//Le nom du QR Code doit contenir au moins un caractère, sinon le bouton generer n'est pas accessible
function activer_button() {
  //Permet l'enregistrement du titre dans le store Titre
  store.delete(`titreUnique`);
  var titre = document.getElementById('qrName').value;
  store.set(`titreUnique`, titre);

  $('#preview').attr('disabled', true); //Par defaut le bouton generer est toujours activé, on le desactive dans la condition suivante si necessaire
  if (document.getElementById('qrName').value.length > 0) {

    $('#preview, #emptyZones, #showAudio').attr('disabled', false);
  }
}


//ajouter une nvlle legende (textarea) a chaque click sur button Texte (pour chaque textarea il faut rajouter à l'attribut class la valeur qrData class="... qrData")
function ajouterChampLegende(valeur = "") {


    var textareaLegende = document.createElement('div');
    textareaLegende.innerHTML = `<i class='fa fa-play align-self-center icon-player'></i><i class="fa fa-pause align-self-center icon-player"></i>
      <textarea id='textarea${numZoneCourante}' class='form-control qrData test' rows='3' name='legendeQR' placeholder='Tapez votre texte (255 caractères maximum)' maxlength='255'  onkeydown="verifNombreCaractere(${numZoneCourante});" onchange="verifNombreCaractere(${numZoneCourante});">${valeur}</textarea>
      <button id='delete${numZoneCourante}' type='button' class='btn btn-outline-success align-self-center legendeQR-close-btn' onclick='supprimerChampLegende(this, ${numZoneCourante});'>
      <div class="inline-block">
        <i class='fa fa-trash-alt'></i></button>
        <button type='button' class='btn btn-outline-success align-self-center legendeQR-close-btn' onclick='moveUp(this, ${numZoneCourante});'>
        <i class='fa fa-arrow-up'></i></button>
        <button type='button' class='btn btn-outline-success align-self-center legendeQR-close-btn' onclick='moveDown(this, ${numZoneCourante});'>
        <i class='fa fa-arrow-down'></i></button>`;
    textareaLegende.setAttribute("class", "d-flex align-items-start legendeQR");
    textareaLegende.setAttribute("id", `legendeTextarea${numZoneCourante}`);
  
    document.getElementById('cible').appendChild(textareaLegende);

  activateAllButtonDelete();
  incrementerNbZoneDonne();
  incrementerNumZoneCourante();
  //Permet d'enregistrer l'ajout de case texte
  store.set(`zone${numZoneCourante}`,textareaLegende.innerHTML);

  //limiter zone de texte a 3 par example
  if (nbZoneDonne>=3){
    //disableButtonAddNewData();
  }
  //reasignation du nombre total de caractère restant pour la nouvelle zone
  var totatCaractere= SetProgressBar();
  $('#textarea'+numZoneCourante).attr('maxlength',(255-totatCaractere));
}

function ajouterChampLegendeInitial(valeur = "") {

  incrementerNbZoneDonne();

  incrementerNumZoneCourante();
  var textareaLegende = document.createElement('div');
  textareaLegende.innerHTML = `<i class='fa fa-play align-self-center icon-player'></i><i class="fa fa-pause align-self-center icon-player"></i>
    <textarea id='textarea${numZoneCourante}' class='form-control qrData' rows='3' name='legendeQR' placeholder='Tapez votre texte (255 caractères maximum)' maxlength='255'  onkeydown="verifNombreCaractere(${numZoneCourante});" onchange="verifNombreCaractere(${numZoneCourante});">${valeur}</textarea>
    <button id='delete${numZoneCourante}' type='button' class='btn btn-outline-success align-self-center legendeQR-close-btn' onclick='supprimerChampLegende(this, ${numZoneCourante});'>
    <div class="inline-block">
      <i class='fa fa-trash-alt'></i></button>
      <button type='button' class='btn btn-outline-success align-self-center legendeQR-close-btn' onclick='moveUp(this, ${numZoneCourante});'>
      <i class='fa fa-arrow-up'></i></button>
      <button type='button' class='btn btn-outline-success align-self-center legendeQR-close-btn' onclick='moveDown(this, ${numZoneCourante});'>
      <i class='fa fa-arrow-down'></i></button>`;
  textareaLegende.setAttribute("class", "d-flex align-items-start legendeQR");
  textareaLegende.setAttribute("id", "legendeTextareaInitiale");

  document.getElementById('cible').appendChild(textareaLegende);

  activateAllButtonDelete();

  //Permet d'enregistrer l'ajout de case texte
  store.set(`zone${numZoneCourante}`,textareaLegende.innerHTML);

  //limiter zone de texte a 3 par example
  if (nbZoneDonne>=3){
    //disableButtonAddNewData();
  }
  //reasignation du nombre total de caractère restant pour la nouvelle zone
  var totatCaractere= SetProgressBar();
  $('#textarea'+numZoneCourante).attr('maxlength',(255-totatCaractere));
}



//foncion qui  calcule le nombre de caractère dans les zones de texte et met la valeur sur les progress bar
function SetProgressBar() {
  //progress bar gestion
  var total = 0;
  var nombreCaratereMAX=255;

  $("#cible textarea").each( function(){
     total += $(this).val().length;
     //console.log(total);
  });
  //$("#cible input").val().length;
  var totalSeted = Math.round((total  * 100)/nombreCaratereMAX) ;


  //mise ajour des données sur le progress bar
  $("#progressbarId").attr('aria-valuenow',totalSeted);
  $("#progressbarId").attr("style","width:"+totalSeted+"%");
  $("#progressbarId").text(totalSeted+"%");
  //FIN progress bar gestion
    return total;
}

//verifier si le nombre de caractère maximal est respecté, si ce n'est pas le cas on affiche une pop up d'informations
function verifNombreCaractere(num) {
  //Permet l'enregistrement du text dans le store
  store.delete(`text${num}`);
  var txt = document.getElementById('textarea'+num).value;
  store.set(`text${num}`, txt);

  var nombreCaratereMAX =255;
  //progress bar gestion
   var total = SetProgressBar();

  //console.log($('#textarea'+num).attr('maxlength'));
  $('#messages').empty();
  if( total >= nombreCaratereMAX)  {
    messageInfos("La limite de caractère est atteinte (255 caractères)","warning");
    disableButtonAddNewData();
    //si nombre de caractére max attein toute les zone de texte sont fermer a l'jout de caractère
    $("#cible textarea").each( function(){
      $(this).attr('maxlength',0);
    });
  }
  else {
    activateButtonAddNewData();
    //reassignation du nombre de caractére disponible pour toutes les zones
    $("#cible textarea").each( function(){
      $(this).attr('maxlength',255);
    });
  }
}


//supprimeun le textarea correspondant au numText
function supprimerChampLegende(e, numText) {


  decrementerNbZoneDonne();

  //suppression dans le store de la zone de txt correspondante
  store.delete(`text`+numText);
  store.delete(`zone`+numText);

  $(e).parents('div#legendeTextarea').remove();

  activateButtonAddNewData();

  if(nbZoneDonne == 1) {
    disableButtonDelete();
  }
  //calcul et mise a jour de la bar de progression
  SetProgressBar();
}

//generer un input 'pour un fichier audio' -> nom de fichier + url (pour chaque input il faut rajouter à l'attribut class la valeur qrData class=".. qrData")
function ajouterChampSon(nom, url) {
  incrementerNbZoneDonne();
  incrementerNumZoneCourante();

  var inputSon = document.createElement('div');
  inputSon.innerHTML = `<i class='fa fa-play align-self-center icon-player'></i><i class='fa fa-pause align-self-center icon-player'></i>
      <!-- <input type='text' id='${url}' name='AudioName' class='form-control qrData' value='${nom}' readonly>  -->
    <textarea id='${url}' class='form-control qrData'  name='AudioName'  maxlength='255'  readonly>${nom}'</textarea>
    <button id='delete${numZoneCourante}' type='button' class='btn btn-outline-success legendeQR-close-btn align-self-center' onclick='supprimerChampSon(this,${numZoneCourante});'>
    <div class="inline-block">
      <i class='fa fa-trash-alt'></i></button>
      <button type='button' class='btn btn-outline-success align-self-center legendeQR-close-btn' onclick='moveUp(this,${numZoneCourante});'>
      <i class='fa fa-arrow-up'></i></button>
      <button type='button' class='btn btn-outline-success align-self-center legendeQR-close-btn' onclick='moveDown(this,${numZoneCourante});'>
      <i class='fa fa-arrow-down'></i></button>
    </div>`;
  inputSon.setAttribute("class", "d-flex align-items-start legendeQR");
  inputSon.setAttribute("id", "inputAudio");
  document.getElementById('cible').appendChild(inputSon);

  $('#listeMusic .close').click();

  store.set(`zone${numZoneCourante}`,inputSon.innerHTML);

  activateAllButtonDelete();

  if (nbZoneDonne>=3){
    //disableButtonAddNewData();
  }
   //calcul et mise a jour de la bar de progression
    SetProgressBar();
}

//supprimer un champ Audio -> event onclick
function supprimerChampSon(e, numText) {
  decrementerNbZoneDonne();


  //suppression dans le store de la zone de txt correspondante
  store.delete(`text`+numText);
  store.delete(`zone`+numText);

  $(e).parents('div#inputAudio').remove();

  activateButtonAddNewData();

  if(nbZoneDonne == 1) {
    disableButtonDelete();
  }
  SetProgressBar();
}

// déplacer au dessus du champ précédent
function moveUp(e, numTxt) {
  let prev = $(e).parents('.legendeQR').prev();
  let div = $(e).parents('.legendeQR');

  let divVal = $(e).parents('.legendeQR').children('textarea').val();
  let prevVal = $(e).parents('.legendeQR').prev().children('textarea').val()

  if (prev.length > 0) {

    for(var i = 1; i<numZoneCourante+1; i++){
      if(store.get("text"+i) == prevVal)
        store.set("text"+i,divVal);
    }
    store.set("text"+numTxt,prevVal);

    div.remove();
    div.insertBefore(prev);
  }
}

// déplacer en dessous du champ suivant
function moveDown(e,numTxt) {
  let next = $(e).parents('.legendeQR').next();
  let div = $(e).parents('.legendeQR');

  let divVal = $(e).parents('.legendeQR').children('textarea').val();
  let nextVal = $(e).parents('.legendeQR').next().children('textarea').val();

  if (next.length > 0) {

    for(var i = 1; i<numZoneCourante+1; i++){
      if(store.get("text"+i) == nextVal)
        store.set("text"+i,divVal);
    }
    store.set("text"+numTxt,nextVal);

    div.remove();
    div.insertAfter(next);
  }


}

// Fonction qui incremente de 1 le nombre de zones de données
function incrementerNbZoneDonne() {
  store.delete(`nbZoneDonne`);
  nbZoneDonne++; // Nouveau numero pour le prochain textarea
  store.set(`nbZoneDonne`,nbZoneDonne);
}

// Fonction qui décremente de 1 le nombre de zones de données
function decrementerNbZoneDonne() {
  store.delete(`nbZoneDonne`);
  nbZoneDonne--; // Nouveau numero pour le prochain textarea
  store.set(`nbZoneDonne`,nbZoneDonne);
}

//Permet de set le numero de la nouvelle zone de donnée courante
function incrementerNumZoneCourante() {
  store.delete(`numZoneCourante`);
  numZoneCourante++; // Nouveau numero pour le prochain textarea
  store.set(`numZoneCourante`,numZoneCourante);
}

//Permet de desactiver le bouton supprimer de la zone de donnée restante
function disableButtonDelete() {
  for(var i = 1; i<numZoneCourante+1; i++){
    if(store.get(`zone${i}`))
      $("#delete" + i).attr('disabled', true);
  }
}

//Permet d'activer tous les boutons supprimer des zones de données
function activateAllButtonDelete() {
  for(var i = 1; i<numZoneCourante+1; i++){
    if(store.get(`zone${i}`))
      $("#delete" + i).attr('disabled', false);
  }
}

//Permet d'activer les boutons qui ajoutes des nouvelles zones de données
// => Le bouton 'Ajouter Nouveau Contenu' et le bouton 'Audio'
function activateButtonAddNewData() {
  $('#ajouterTexte').attr('disabled', false);
  $('#showAudio').attr('disabled', false);
}

//Permet de desactiver les boutons qui ajoutes des nouvelles zones de données
// => Le bouton 'Ajouter Nouveau Contenu' et le bouton 'Audio'
function disableButtonAddNewData() {
  $('#ajouterTexte').attr('disabled', true);
  $('#showAudio').attr('disabled', true);
}


//pour ouvrir la page info.html quand on clique sur le bouton info du haut
$("#infos-unique").click(function () {
  require('electron').remote.getGlobal('sharedObject').someProperty = 'unique'
  $("#charger-page").load(path.join(__dirname, "Views/info.html"));
});