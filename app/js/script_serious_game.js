var projetSeriousGame = new ProjetSeriousGame();

var audioSource = "";

$("#addAudioIntro").click(function () {
  audioSource = "intro";
});
$("#addAudioFin").click(function () {
  audioSource = "fin";
});
function addAudioQRCode(idEnigme) {
  currentEnigme = idEnigme;
  audioSource = "qrcode";
};
function addAudioReco(idEnigme) {
  currentEnigme = idEnigme;
  audioSource = "vocale";
};

// Fonction pour ajouter un fichier audio

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
    xhr.onload = function (e) {

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
          fileReader.onload = function () {
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

    xhr.onloadstart = function (e) {
      console.log('load start');
      $(loader).addClass('loader');
      $(modal).find('.errorLoader').remove();
      $(modal).prepend(loader); // show loader when request progress
    };

    xhr.onerror = function (e) {
      showError(modal, errorMsg);
    };

    xhr.send();
  });
}

// Fonction pour ajouter au bon endroit le fichier audio
function ajouterChampSon(nom, url) {
  if (audioSource == "intro") {
    let textArea = document.getElementById("textAreaIntro");
    textArea.value = nom;
    textArea.name = url;
    textArea.setAttribute("disabled", "true");
  } else if (audioSource == "fin") {
    let textArea = document.getElementById("textAreaFin");
    textArea.value = nom;
    textArea.name = url;
    textArea.setAttribute("disabled", "true");
  }
  else if (audioSource == "qrcode") {
    let text = document.getElementById("questQRCode" + currentEnigme);
    text.value = nom;
    text.name = url;
    text.setAttribute("disabled", "true");
  }
  else if (audioSource == "vocale") {
    console.log(currentEnigme);
    let text = document.getElementById("questRecVocal" + currentEnigme);
    text.value = nom;
    text.name = url;
    text.setAttribute("disabled", "true");
  }
}

function showError(modal, errorMsg, message = "Veuillez coller un lien de fichier téléchargeable. Reportez vous à la rubrique Info pour plus d'informations.") {
  console.log('error ');
  $(modal).find('.loader').remove();
  $(errorMsg).text(message);
  $(errorMsg).css('color', '#f35b6a');
  $(errorMsg).addClass('errorLoader');
  $(modal).prepend(errorMsg); // add error message
}

$(document).ready(function () {
  //Use to implement information on the audio import
  var info = document.createElement('div'); // balise div : contain html information
  var info_activ = false; // boolean : give the etat of info (up/off)

  //Show the information about the audio file import (help)
  $('button#showInfo').click(e => {
    e.preventDefault();
    if (info_activ == false) {
      info.innerHTML = ``;
      fetch('Views/unique/audioinfo.html').then(function (response) {
        return response.text();
      }).then(function (string) {
        // console.log(string);
        info.innerHTML = string;
      }).catch(function (err) {
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

  $('#closeModalListeMusic').click(e => {
    $('#musicUrl').val('');
    $('#listeMusic').find('.errorLoader').remove();
  });

  $("#play-sound-div").hide();
});

// Fonction pour vérifier l'écriture dans un champ texte
function activerSave() {
  console.log("Activer Save");
}

// Réinitialise les champs du Scénario
function deleteGame() {
  for (let i = compteurEnigme; i >= 1; --i) {
    supprLigne(i, "enigme");
  }
  document.getElementById("projectId").value = "";
  document.getElementById("textAreaIntro").value = "";
  if(document.getElementById("textAreaIntro").disabled == true){
    document.getElementById("textAreaIntro").disabled = false;
  }
  document.getElementById("textAreaFin").value = "";
  if(document.getElementById("textAreaFin").disabled == true)
    document.getElementById("textAreaFin").disabled = false;
}

//Import d'un projet existant à partir d'un répertoire
$('#importProjectBtnId').click(function () {
  //Permet de sélectionner le répertoire du projet
  var dir_path = dialog.showOpenDialog({ title: 'Sélectionnez le projet', properties: ['openDirectory'] })[0];
  projet = new ProjetQCM();
  var path_split = dir_path.split(path.sep);
  //On récupère le nom du projet
  projet.setName(path_split[path_split.length - 1]);
  $("#projectId").val(path_split[path_split.length - 1]);
  store.set("titreQCM", $("#projectId").val());
  $("#reponsesListModal").empty();
  $("#questionsDivLabelsId").empty();

  let facade = new FacadeController();

  var fs = require('fs');


  //Pour chaque fichier du répertoire
  fs.readdir(dir_path, (err, files) => {
    $.each(files, function (i, file) {
      console.log(file);
      var file_path = path.join(dir_path, file);
      let blob = null;
      //On crée une requête xmlhttp pour récupérer le blob du fichier
      let xhr = new XMLHttpRequest();
      xhr.open("GET", file_path);

      xhr.responseType = "blob";
      xhr.onload = function () {
        blob = xhr.response;
        //Puis on importe le qrcode à partir du blob récupéré

        //importQCM est un callback, il s'agit de la méthode appliquée
        //par la façade sur le qrcode importé
        //(cf méthode importQCM)
        facade.importQRCode(blob, importQCM);
      }
      xhr.send();
    });
  });
  $("#saveQRCode").attr('disabled', false);
});

//Pour ajouter autant d'énigme que souhaité
var type = "";
var compteurEnigme = 0;
var currentEnigme = 1;
$("#ajouterEnigme").click(function () {
  compteurEnigme++;
  if (compteurEnigme < 30) {
    type = "enigme";
    let reponse = document.createElement('div');
    let popUpQRCode = document.createElement('div');
    let popUpRecVocale = document.createElement('div');
    reponse.innerHTML = `<div class="form-group">
                            <div class="form-inline" class="col-sm-12" id="divEnigme` + compteurEnigme + `">
                              <label class="control-label"
                              style="color:#28a745;padding-top:10px;padding-right:54px;">Énigme `+ compteurEnigme + ` : </label>
                              <input type="text" class="form-control" id="enigme`+ compteurEnigme + `" name="nombreReponse"
                              placeholder="Nom de l'énigme `+ compteurEnigme + `" onkeyup="activerSave();" />
                              <i class="fas fa-info-circle mt-1 ml-1 mr-3"
                                        title="Nous vous conseillons de choisir un nom d'énigme court et facilement prononçable par l'utilisateur. Ne pas oublier les accents dans votre nom."
                                        data-toggle="tooltip" data-placement="right"></i>
                              &nbsp;
                              <div class="btn-group" style="display:block" id="menuDeroulant`+ compteurEnigme + `">
                                <button type="button" class="btn btn-outline-success align-self-center dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Type énigme        &nbsp;&nbsp; &nbsp;
                                </button>
                                <div class="dropdown-menu" >
                                  <button type="button" id="scanQR`+ compteurEnigme + `" name="ajouterQR` + compteurEnigme + `" data-toggle="modal"
                                  data-target="#popupQRCode` + compteurEnigme + `" class="dropdown-item">
                                  <i class="fa fa-qrcode"></i>&nbsp;&nbsp;Scan de QR Codes</button>&nbsp;
                                  <button id="recVocale`+ compteurEnigme + `" type="button" class="dropdown-item"
                                  data-toggle="modal" data-target="#popupRecVocale` + compteurEnigme + `">
                                  <i class="fa fa-microphone"></i>&nbsp;&nbsp;Reconnaissance vocale</button>
                                  </div>
                                </div>
                                <div id="modification`+ compteurEnigme + `">
                                </div>
                                &nbsp;
                                <button id="deleteEnigme`+ compteurEnigme + `" type="button" onclick="supprLigne(` + compteurEnigme + ",\'" + type + `\');" class="btn btn-outline-success align-self-center">
                                <i class="fa fa-trash"></i></button>
                              </div>
                          </div>`;

    popUpQRCode.innerHTML = `<div class="modal fade bd-example-modal-lg" id="popupQRCode` + compteurEnigme + `" tabindex="-1" role="dialog" data-backdrop="static"
    aria-labelledby="exampleModalCenterTitle" aria-hidden="true" data-keyboard="false">
    <div class="modal-dialog modal-lg modal-dialog-centered" role="dialog" style="max-width: 53% !important">
        <div class="modal-content" style="padding: 20px;">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalCenterTitle">QR Code</h5>
                <button type="button" class="close" id="closeModalQRCode" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="alert alert-danger" role="alert" id="alertQuestionEmptyError" style="display:none"> Veuillez d'abord saisir une question </div>
            <div class="row">
                <div class="col-lg-12 form-inline">
                    <label class="control-label" style="color:#28a745;padding-right:32px;">Enoncé et Question :</label>

                    <textarea class="form-control input-lg" id="questQRCode` + compteurEnigme + `"
                        name="nomprojet" rows="4" cols="45" placeholder="Saisissez l'énoncé de l'énigme et la question" ></textarea>
                    <button type="button" id="addAudioQRCode` + compteurEnigme + `" class="btn btn-outline-success btn-unique-xl  "
                        name="ajouterSon" data-toggle="modal" data-target="#listeMusic" onclick="addAudioQRCode(` + compteurEnigme + `)">
                        <i class="fa fa-music"></i>&nbsp;&nbsp;Audio
                    </button>
                    <button id="deleteAudioQRCode` + compteurEnigme + `" type="button" onclick="deleteAudioQRCode(` + compteurEnigme + `)"
                        class="btn btn-outline-success align-self-center"><i class="fa fa-trash"></i>
                    </button>
                </div>
            </div>
            <hr>
            <div class="alert alert-danger" role="alert" id="alertReponsesEmptyError" style="display:none"> Veuillez d'abord saisir toutes vos réponses </div>
            <div class="form-row" style="text-align: right;">
                <div class="form-group col-md-10" id="labelBonneReponse` + compteurEnigme + `">
                    <label>Bonne réponse :</label>
                </div>
            </div>
            <div id="repContainer` + compteurEnigme + `">
                <div class="form-row" id="divQuestion` + compteurEnigme + `1">
                  <div class="form-group col-md-3">
                      <label class="control-label">Réponse 1 :</label>
                  </div>
                  <div class="form-group col-md-6">
                    <input type="text" class="form-control col-sm-6" id="projectId` + compteurEnigme + `1" rows="2" name="nomprojet"
                    placeholder="Réponse" onkeyup="activerSave();" />
                  </div>
                  <div class="form-group col-md-2">
                      <input class="form-check-input" type="radio" name="gridRadios` + compteurEnigme + `" id="gridCheck` + compteurEnigme + `1" checked style="width:70px;" value="option1">
                      <label class="form-check-label" for="gridCheck` + compteurEnigme + `1">
                  </div>
                  <div class="form-group col-md-1">
                    <button id="deleteQRCode` + compteurEnigme + `1" type="button"
                        class="btn btn-outline-success align-self-center" onclick="supprLigne(1,\'qrcode\');">
                        <i class="fa fa-trash"></i></button>
                  </div>
                </div>
              </div>
              <hr>
              <div class="form-group col-md-4">
                    <label for="ajouterQuestion" style="color:#a5b2af;">Ajouter une réponse</label>
                    <button id="ajouterQuestion` + compteurEnigme + `" type="button" class="btn btn-outline-success align-self-center"
                        style="color:#a5b2af;" name="ajouterQuestion" onclick="ajouterQuestions(` + compteurEnigme + `)">
                        <i class="fa fa-plus" aria-hidden="true"></i>
                    </button>
              </div>
              <div class="modal-footer">
                  <button type="button" class="btn btn-outline-success" data-dismiss="modal"
                      id="cancelQRCode` + compteurEnigme + `" onclick="annulerQuestion(` + compteurEnigme + `, \'qrcode\')">Annuler</button>
                  <button type="button" class="btn btn-outline-success" id="addQRCode` + compteurEnigme + `" onclick="validerQuestion(` + compteurEnigme + `, \'qrcode\')">Valider</button>
              </div>
          </div>
      </div>
  </div>`;

    popUpRecVocale.innerHTML = `<div class="modal fade" id="popupRecVocale` + compteurEnigme + `" tabindex="-1" role="dialog" data-backdrop="static"
    aria-labelledby="exampleModalCenterTitle" aria-hidden="true" data-keyboard="false">
    <div class="modal-dialog modal-lg modal-dialog-centered" role="dialog" style="max-width: 50% !important">
        <div class="modal-content" style="padding: 20px;">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalCenterTitle">Reconnaissance Vocale</h5>
                <button type="button" class="close" id="closeModalQRCode" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="alert alert-danger" role="alert" id="alertQuestionEmptyError" style="display:none"> Veuillez d'abord saisir une question </div>
            <div class="form-group">
                <div class="col-lg-12 form-inline">
                    <label class="control-label" style="color:#28a745;padding-right:32px;">Enoncé et Question :</label>

                        <textarea class="form-control input-lg" id="questRecVocal` + compteurEnigme + `"
                          name="nomprojet" rows="4" cols="45" placeholder="Saisissez l'énoncé de l'énigme et la question" ></textarea>
                        <button type="button" id="addAudioReco` + compteurEnigme + `" class="btn btn-outline-success btn-unique-xl  "
                        name="ajouterSon" data-toggle="modal" data-target="#listeMusic" onclick="addAudioReco(` + compteurEnigme + `)">
                        <i class="fa fa-music"></i>&nbsp;&nbsp;Audio
                    </button>
                    <button id="deleteAudioReco` + compteurEnigme + `" type="button" onclick="deleteAudioReco(` + compteurEnigme + `)"
                        class="btn btn-outline-success align-self-center"><i class="fa fa-trash"></i>
                    </button>
                </div>
                <hr>
                <div class="alert alert-danger" role="alert" id="alertReponseEmptyError" style="display:none"> Veuillez d'abord saisir une réponse </div>
                <div class="col-lg-12 form-inline">
                    <label class="control-label" style="color:#28a745;padding-right:32px;">Réponse :</label>
                    <input type="text" class="form-control input-lg" style="width:500px;" id="repRecVocal` + compteurEnigme + `" cols="10"
                        name="nomprojet" placeholder="Saisissez votre réponse" onkeyup="activerSave();" />
                    <i class="fas fa-info-circle mt-1 ml-2"
                        title="Nous vous conseillons de choisir une réponse courte et facilement prononçable par l'utilisateur. Ne pas oublier les accents dans votre réponse."
                        data-toggle="tooltip" data-placement="right"></i>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-success" data-dismiss="modal"
                    id="cancelRecVocal` + compteurEnigme + `" onclick="annulerQuestion(` + compteurEnigme + `, \'vocale\')">Annuler</button>
                <button type="button" class="btn btn-outline-success" id="addRecVocal` + compteurEnigme + `" onclick="validerQuestion(` + compteurEnigme + `, \'vocale\')">Valider</button>
            </div>
        </div>
    </div>
</div>`;
    let container = $("#containerEnigme");
    reponse.firstChild.append(popUpQRCode);
    reponse.firstChild.append(popUpRecVocale);
    container.append(reponse);

  }
});
// On ajoute une enigme de base
$("#ajouterEnigme").trigger("click");

//Ajouter autant de réponses que souhaité dans la popup QRCode
var compteurQuestion = 1;
function ajouterQuestions(idEnigme) {
  currentEnigme = idEnigme;
  compteurQuestion = document.getElementById("repContainer" + idEnigme).childElementCount;
  compteurQuestion++;
  if (compteurQuestion < 30) {
    type = "qrcode";
    let reponse = document.createElement('div');
    reponse.setAttribute("class", "form-row");
    reponse.setAttribute("id", "divQuestion" + idEnigme + compteurQuestion);
    reponse.innerHTML = `<div class="form-group col-md-3">
                            <label class="control-label">Réponse `+ compteurQuestion + ` :</label>
                         </div>
                         <div class="form-group col-md-6">
                            <input type="text" class="form-control col-sm-6" id="projectId` + idEnigme + compteurQuestion + `" rows="2" name="nomprojet"
                              placeholder="Réponse" onkeyup="activerSave();" />
                          </div>
                         <div class="form-group col-md-2">
                            <input class="form-check-input" type="radio" name="gridRadios` + idEnigme + `" id="gridCheck` + idEnigme + compteurQuestion + `" style="width:70px;" value="option` + compteurQuestion + `">
                            <label class="form-check-label" for="gridCheck` + idEnigme + compteurQuestion + `">
                          </div>
                          <div class="form-group col-md-1">
                            <button id="deleteQRCode` + idEnigme + compteurQuestion + `" type="button"
                                class="btn btn-outline-success align-self-center" onclick="supprLigne(` + compteurQuestion + ",\'" + type + `\');">
                            <i class="fa fa-trash"></i></button>
                          </div>`;

    let container = $("#repContainer" + idEnigme);
    container.append(reponse);
  }
};

//Pour supprimer une énigme ou bien une réponse des QRCode
function supprLigne(idLigne, element) {
  if (element == "enigme") {
    // On regarde le nombre d'énigme crée, et si il y en a qu'une seule on supprime juste la value de l'input text
    if ($("[name=nombreReponse]").length > 1) {
      compteurEnigme--;
      verifEnigmeValide(idLigne);
      $("#divEnigme" + idLigne).parent().parent().remove();
      // On parcourt les div enigmes suivants pour changer les valeurs
      for (let cpt = idLigne; cpt <= compteurEnigme; cpt++) {
        console.log("Compteur Enigme: " + compteurEnigme);
        console.log(" Compteur : " + cpt);
        let id = cpt + 1;
        console.log("id compteur : " + id);
        let div = $("#divEnigme" + id)[0];
        div.getElementsByTagName("label")[0].innerHTML = "Énigme " + cpt + " :";
        div.getElementsByTagName("input")[0].id = "enigme" + cpt;
        div.getElementsByTagName("input")[0].placeholder = "Nom de l'énigme " + cpt;

        // Bouton Qr
        if ($("#divEnigme" + id + " #scanQR" + id).length > 1) {
          $("#divEnigme" + id + " #scanQR" + id)[0].id = "scanQR" + cpt;
          $("#divEnigme" + id + " #scanQR" + cpt)[0].setAttribute("data-target", "#popupQRCode" + cpt);
          $("#divEnigme" + id + " #scanQR" + cpt)[0].name = "ajouterQR" + cpt;
          $("#modification" + id + " #scanQR" + id).attr("id", "scanQR" + cpt);
          $("#modification" + id + " #scanQR" + cpt).attr("data-target", "#popupQRCode" + cpt);
          $("#modification" + id + " #scanQR" + cpt).attr("name", "ajouterQR" + cpt);
          $("#modification" + id + " #scanQR" + cpt).attr("onclick", "chargerQuestion(" + cpt + ",'qrcode');");
        } else {
          $("#divEnigme" + id + " #scanQR" + id).attr("id", "scanQR" + cpt);
          $("#divEnigme" + id + " #scanQR" + cpt).attr("data-target", "#popupQRCode" + cpt);
          $("#divEnigme" + id + " #scanQR" + cpt).attr("name", "ajouterQR" + cpt);
        }

        // Bouton Reco
        if ($("#divEnigme" + id + " #recVocale" + id).length > 1) {
          $("#divEnigme" + id + " #recVocale" + id)[0].setAttribute("id", "recVocale" + cpt);
          $("#divEnigme" + id + " #recVocale" + cpt)[0].setAttribute("data-target", "#popupRecVocale" + cpt);
          $("#modification" + id + " #recVocale" + id).attr("id", "recVocale" + cpt);
          $("#modification" + id + " #recVocale" + cpt).attr("data-target", "#popupRecVocale" + cpt);
          $("#modification" + id + " #recVocale" + cpt).attr("onclick", "chargerQuestion(" + cpt + ",'vocale');");
        } else {
          $("#divEnigme" + id + " #recVocale" + id).attr("id", "recVocale" + cpt);
          $("#divEnigme" + id + " #recVocale" + cpt).attr("data-target", "#popupRecVocale" + cpt);
        }

        // Bouton delete enigme
        document.getElementById("deleteEnigme" + id).id = "deleteEnigme" + cpt;
        document.getElementById("deleteEnigme" + cpt).setAttribute("onclick", "supprLigne(" + cpt + ",\'" + element + "\')");

        div.id = "divEnigme" + cpt;
        document.getElementById("modification" + id).id = "modification" + cpt;
        document.getElementById("menuDeroulant" + id).id = "menuDeroulant" + cpt;
        document.getElementById("popupQRCode" + id).id = "popupQRCode" + cpt;
        document.getElementById("questQRCode" + id).id = "questQRCode" + cpt;
        document.getElementById("addAudioQRCode" + id).id = "addAudioQRCode" + cpt;
        document.getElementById("deleteAudioQRCode" + id).id = "deleteAudioQRCode" + cpt;
        document.getElementById("labelBonneReponse" + id).id = "labelBonneReponse" + cpt;
        for (let i = 1; i <= document.getElementById("repContainer" + id).childElementCount; ++i) {
          document.getElementById("divQuestion" + id + i).id = "divQuestion" + cpt + i;
          document.getElementById("gridCheck" + id + i).name = "gridRadios" + cpt;
          if (i == 1) document.getElementById("gridCheck" + id + i).checked = true;
          document.getElementById("gridCheck" + id + i).id = "gridCheck" + cpt + i;
          document.getElementById("projectId" + id + i).id = "projectId" + cpt + i;
          document.getElementById("deleteQRCode" + id + i).setAttribute("onclick", "supprLigne(" + cpt + ",\'qrcode\')");
          document.getElementById("deleteQRCode" + id + i).id = "deleteQRCode" + cpt + i;
        }
        document.getElementById("ajouterQuestion" + id).setAttribute("onclick", "ajouterQuestions(" + cpt + ")");
        document.getElementById("ajouterQuestion" + id).id = "ajouterQuestion" + cpt;
        document.getElementById("cancelQRCode" + id).setAttribute("onclick", "annulerQuestion(" + cpt + ",\'qrcode\')");
        document.getElementById("cancelQRCode" + id).id = "cancelQRCode" + cpt;
        document.getElementById("addQRCode" + id).setAttribute("onclick", "validerQuestion(" + cpt + ",\'qrcode\')");
        document.getElementById("addQRCode" + id).id = "addQRCode" + cpt;
        document.getElementById("repContainer" + id).id = "repContainer" + cpt;
        document.getElementById("popupRecVocale" + id).id = "popupRecVocale" + cpt;
        document.getElementById("questRecVocal" + id).id = "questRecVocal" + cpt;
        document.getElementById("repRecVocal" + id).id = "repRecVocal" + cpt;
        document.getElementById("cancelRecVocal" + id).setAttribute("onclick", "annulerQuestion(" + cpt + ",\'vocale\')");
        document.getElementById("cancelRecVocal" + id).id = "cancelRecVocal" + cpt;
        document.getElementById("addRecVocal" + id).setAttribute("onclick", "validerQuestion(" + cpt + ",\'vocale\')");
        document.getElementById("addRecVocal" + id).id = "addRecVocal" + cpt;
        document.getElementById("addAudioReco" + id).id = "addAudioReco" + cpt;// button audio
        document.getElementById("deleteAudioReco" + id).id = "deleteAudioReco" + cpt; // button delete audio


        for (let i = 0; i < projetSeriousGame.getQuestionsQr().length; ++i) {
          if (projetSeriousGame.getQuestionsQr()[i].getId() == id) {
            projetSeriousGame.getQuestionsQr()[i].setId(cpt);
          }
        }
        for (let i = 0; i < projetSeriousGame.getQuestionsReco().length; ++i) {
          if (projetSeriousGame.getQuestionsReco()[i].getId() == id) {
            projetSeriousGame.getQuestionsReco()[i].setId(cpt);
          }
        }
      }
  } else {
    document.getElementsByName("nombreReponse")[0].value = "";
    $("#questQRCode1").val("");
    $("#projectId11").val("");
    $("#menuDeroulant" + idLigne).attr("style", "display:block");
    $("#modification" + idLigne).empty();
    $("#modification" + idLigne).attr("style", "display:none");
  }
} else if (element == "qrcode") {
  if(compteurQuestion > 1){
    compteurQuestion--;
    $("#divQuestion" + currentEnigme + idLigne).on('click', function () {
      $(this).remove();
      for (let cpt = idLigne; cpt <= compteurQuestion; cpt++) {
        let id = cpt + 1;
        let div = $("#divQuestion" + currentEnigme + id)[0].getElementsByTagName("div");
        div[0].getElementsByTagName("label")[0].innerHTML = "Réponse " + cpt + " :";
        div[2].getElementsByTagName("input")[0].id = "gridCheck" + currentEnigme + cpt;
        div[2].getElementsByTagName("label")[0].for = "gridCheck" + currentEnigme + cpt;
        div[1].getElementsByTagName("input")[0].id = "projectId" + currentEnigme + cpt;
        div[3].getElementsByTagName("button")[0].id = "deleteQRCode" + currentEnigme + cpt;
        div[3].getElementsByTagName("button")[0].setAttribute("onclick", "supprLigne(" + cpt + ",\'" + element + "\')");
        $("#divQuestion" + currentEnigme + id)[0].id = "divQuestion" + currentEnigme + cpt;
      }
    });
  }
  else {
    let div = $("#divQuestion" + currentEnigme + "1")[0].getElementsByTagName("div");
    console.log(div);

    div[1].getElementsByTagName("input")[0].value = "";
  }
}
}

// Fonction pour réinitialise les champs question dans la popup QRCode
function annulerQuestion(idEnigme, type) {
  if (type == "qrcode") {
    let nbQuestions = document.getElementById("repContainer" + idEnigme).childElementCount;
    for (let i = 2; i <= nbQuestions; ++i) {
      let reponse = document.getElementById("divQuestion" + idEnigme + i);
      reponse.remove();
    }
    let reponse = document.getElementById("divQuestion" + idEnigme + "1").getElementsByTagName('div');
    reponse[2].getElementsByTagName('input')[0].value = "";
    let question = document.getElementById("questQRCode" + idEnigme);
    question.disabled = false;
    question.value = "";
  }
  else if (type == "vocale") {
    document.getElementById("questRecVocal" + idEnigme).value = "";
    document.getElementById("repRecVocal" + idEnigme).value = "";
  }
}

// Fonction pour valider une question à ajouter dans une enigme
function validerQuestion(idEnigme, type) {
  currentEnigme = idEnigme;
  let tousLesChampsSontRemplies = true; // Variable pour vérifier le remplissage des champs
  // On regarde le type de l'énigme
  if (type == "qrcode") {
    let textQuestion = document.getElementById("questQRCode" + idEnigme).value;

    if (textQuestion == "") {
      tousLesChampsSontRemplies = false;
      $("#popupQRCode" + idEnigme + "  #alertQuestionEmptyError").attr("style", "display:block");
    } else {
      $("#popupQRCode" + idEnigme + "  #alertQuestionEmptyError").attr("style", "display:none");
    }

    if (textQuestion.substring(textQuestion.length - 3, textQuestion.length) == "mp3") {
      textQuestion = document.getElementById("questQRCode" + idEnigme).name;
    }

    let tabReponses = new Array();
    let estBonneReponse = 1;
    let nbReponses = document.getElementById("repContainer" + idEnigme).childElementCount;
    for (let i = 1; i <= nbReponses; ++i) {
      let divs = document.getElementById("divQuestion" + idEnigme + i).getElementsByTagName('div');
      let reponse = divs[1].getElementsByTagName('input')[0].value;
      if (reponse == "") {
        tousLesChampsSontRemplies = false;
        $("#popupQRCode" + idEnigme + "  #alertReponsesEmptyError").attr("style", "display:block");
      } else if (tousLesChampsSontRemplies) {
        $("#popupQRCode" + idEnigme + "  #alertReponsesEmptyError").attr("style", "display:none");
      }
      tabReponses.push(reponse);
      if (divs[2].getElementsByTagName('input')[0].checked == true) {
        estBonneReponse = i;
      }
    }
    if (tousLesChampsSontRemplies == true) {
      console.log(projetSeriousGame.getQuestionQrFromId(idEnigme));
      // On regarde s'il n'y a pas déjà une question avec cet idEnigme
      if (projetSeriousGame.getQuestionQrFromId(idEnigme) !== null) {
        // Si c'est le cas on change les champs de cette question
        projetSeriousGame.getQuestionQrFromId(idEnigme).setQuestion(textQuestion);
        projetSeriousGame.getQuestionQrFromId(idEnigme).setReponses(tabReponses);
        projetSeriousGame.getQuestionQrFromId(idEnigme).setBonneReponseQR(estBonneReponse);
      } else {
        // Sinon on ajout une question au projet
        projetSeriousGame.getQuestionsQr().push(new QRCodeQuestion(textQuestion, tabReponses, estBonneReponse, idEnigme));
      }
      console.log(projetSeriousGame.getQuestionsQr());
    }

  }
  else if (type == "vocale") {
    let textQuestion = document.getElementById("questRecVocal" + idEnigme).value;
    if (textQuestion.substring(textQuestion.length - 3, textQuestion.length) == "mp3") {
      textQuestion = document.getElementById("questRecVocal" + idEnigme).name;
    }
    if (textQuestion == "") {
      tousLesChampsSontRemplies = false;
      $("#popupRecVocale" + idEnigme + "  #alertQuestionEmptyError").attr("style", "display:block");
    } else {
      $("#popupRecVocale" + idEnigme + "  #alertQuestionEmptyError").attr("style", "display:none");
    }
    let textReponse = document.getElementById("repRecVocal" + idEnigme).value;
    if (textReponse == "") {
      tousLesChampsSontRemplies = false;
      $("#popupRecVocale" + idEnigme + "  #alertReponseEmptyError").attr("style", "display:block");
    } else {
      $("#popupRecVocale" + idEnigme + "  #alertReponseEmptyError").attr("style", "display:none");
    }
    if (tousLesChampsSontRemplies == true) {
      // On regarde s'il n'y a pas déjà une question avec cet idEnigme
      if (projetSeriousGame.getQuestionRecoFromId(idEnigme) !== null) {
        // Si c'est le cas on change les champs de cette question
        projetSeriousGame.getQuestionRecoFromId(idEnigme).setQuestion(textQuestion);
        projetSeriousGame.getQuestionRecoFromId(idEnigme).setReponse(textReponse);
      } else {
        // Sinon on ajout une question au projet
        projetSeriousGame.getQuestionsReco().push(new RecVocaleQuestion(textQuestion, textReponse, idEnigme));
      }
      console.log(projetSeriousGame.getQuestionsReco());
    }


  }

  if (tousLesChampsSontRemplies == true) {
    annulerQuestion(idEnigme, type);

    // On cache le menu déroulant pour mettre et afficher un bouton modifier dans le div id="modification"
    $("#menuDeroulant" + idEnigme).attr("style", "display:none");
    let modification = document.getElementById("modification" + idEnigme);
    if (type == "qrcode") {
      // On rajoute l'attribut bootstrap pour fermer le modal sur le bouton valider
      jQuery("#addQRCode" + idEnigme).attr("data-dismiss", "modal");
      // On simule l'appuie du bouton
      $("#addQRCode" + idEnigme).trigger({ type: "click" });
      $("#addQRCode" + idEnigme).removeAttr("data-dismiss");

      modification.innerHTML = `<button type="button" id="scanQR` + idEnigme + `" name="ajouterQR` + idEnigme + `" data-toggle="modal"
      data-target="#popupQRCode` + idEnigme + `" class="btn btn-outline-success align-self-center" onclick="chargerQuestion(` + idEnigme + `,'qrcode');">
      <i class="fa fa-qrcode"></i>&nbsp;&nbsp;Modifier</button>&nbsp;`;

      modification.setAttribute("style", "display:block");

    }
    else if (type == "vocale") {
      // On rajoute l'attribut bootstrap pour fermer le modal sur le bouton valider
      $("#addRecVocal" + idEnigme).attr("data-dismiss", "modal");
      // On simule l'appuie du bouton
      $("#addRecVocal" + idEnigme).trigger({ type: "click" });
      $("#addRecVocal" + idEnigme).removeAttr("data-dismiss");

      modification.innerHTML = `<button id="recVocale` + idEnigme + `" type="button" class="btn btn-outline-success align-self-center"
      data-toggle="modal" data-target="#popupRecVocale` + idEnigme + `" onclick="chargerQuestion(` + idEnigme + `,'vocale');">
      <i class="fa fa-microphone"></i>&nbsp;&nbsp;Modifier</button>`;
      modification.setAttribute("style", "display:block");
    }

  }
}

// Fonction qui charger les données des popup qrcode
function chargerQuestion(idEnigme, type) {
  currentEnigme = idEnigme;

  // On affecte les valeurs rentrées à la popup pour la modification
  if (type == "qrcode") {
    $("#popupQRCode" + idEnigme + " #questQRCode" + idEnigme).val(projetSeriousGame.getQuestionQrFromId(idEnigme).getQuestion()); // le champs de question
    console.log(projetSeriousGame.getQuestionQrFromId(idEnigme).getReponses().length);
    for (let i = 0; i < projetSeriousGame.getQuestionQrFromId(idEnigme).getReponses().length; i++) {// les champs de réponses
      if (i > 0 && i >= $("#repContainer" + idEnigme)[0].childElementCount) {ajouterQuestions(idEnigme);}// La popup n'a qu'1 reponse donc on en ajoute
      $("#popupQRCode" + idEnigme + " #projectId" + idEnigme + "" + (i + 1)).val(projetSeriousGame.getQuestionQrFromId(idEnigme).getReponses()[i]);
    }
    $("#popupQRCode" + idEnigme + " #gridCheck" + idEnigme + "" + projetSeriousGame.getQuestionQrFromId(idEnigme).getBonneReponse()).prop("checked", true);
    // On cache les messages d'erreurs
    $("#popupQRCode" + idEnigme + "  #alertQuestionEmptyError").attr("style", "display:none");
    $("#popupQRCode" + idEnigme + "  #alertReponsesEmptyError").attr("style", "display:none");
  } if (type == "vocale") {
    console.log(projetSeriousGame.getQuestionRecoFromId(idEnigme));
    $("#popupRecVocale" + idEnigme + " #questRecVocal" + idEnigme).val(projetSeriousGame.getQuestionRecoFromId(idEnigme).getQuestion()); // le champs de la question
    $("#popupRecVocale" + idEnigme + " #repRecVocal" + idEnigme).val(projetSeriousGame.getQuestionRecoFromId(idEnigme).getReponse()); // le champs de la reponse
    // On cache les messages d'erreurs
    $("#popupRecVocale" + idEnigme + "  #alertQuestionEmptyError").attr("style", "display:none");
    $("#popupRecVocale" + idEnigme + "  #alertReponseEmptyError").attr("style", "display:none");

  }

}


// Supprime la question dans la liste des questions du projetSeriousGame
// Fonction qui vérifie si une énigme est valide
function verifEnigmeValide(idEnigme) {
  for (let i = 0; i < projetSeriousGame.getQuestionsQr().length; ++i) {
    if (projetSeriousGame.getQuestionsQr()[i].getId() == idEnigme) {
      projetSeriousGame.getQuestionsQr().splice(i, 1);
      return;
    }
  }
  for (let i = 0; i < projetSeriousGame.getQuestionsReco().length; ++i) {
    if (projetSeriousGame.getQuestionsReco()[i].getId() == idEnigme) {
      projetSeriousGame.getQuestionsReco().splice(i, 1);
      return;
    }
  }
}

$("#deleteAudioIntro").click(function () {
  document.getElementById('textAreaIntro').value = "";
  $("#textAreaIntro").prop('disabled', false);
});

$("#deleteAudioFin").click(function () {
  document.getElementById('textAreaFin').value = "";
  $("#textAreaFin").prop('disabled', false);
});

function deleteAudioQRCode(idEnigme) {
  document.getElementById('questQRCode' + idEnigme).value = "";
  $("#questQRCode" + idEnigme).prop('disabled', false);
}

function deleteAudioReco(idEnigme) {
  document.getElementById('questRecVocal' + idEnigme).value = "";
  $("#questRecVocal" + idEnigme).prop('disabled', false);
}

// Appeler lorsqu'on click sur Générer
$("#generateSG").on("click", function () {
  // Si genereJSonSeriousGame renvoie true, cela veut dire qu'on as bien générer le json sinon il renvoie false car les champs ne sont pas remplis
  if (genereJsonSeriousGame()) {
    $("#alertChampsEmptyError").attr("style", "display:none");
    // On génére le QrCode a afficher
    previewQRCodeQuestion();
    console.log("Preview faite")
    // On affiche le qrCode
    $('#qrView').show();
  } else {
    // Affiche un message d'erreur
    $("#alertChampsEmptyError").attr("style", "display:block");
  }

});

/* On générère le QRCodeSeriousGame en récupérant les valeurs des champs la page html et des question QRCOde et Reco qui ont été stockées dans le projetSeriousGame
 *
 */
function genereJsonSeriousGame() {
  let tousLesChampsSontRemplies = true;
  console.log("Generating Json Serious Game");
  // On extrait les valeurs des champs utiles du html
  let nomSeriousGame = $("#projectId").val();
  let textIntro = $("#textAreaIntro").val();
  if (textIntro.substring(textIntro.length - 3, textIntro.length) == "mp3") {
    textIntro = document.getElementById("textAreaIntro").name;
  }
  let textFin = $("#textAreaFin").val();
  console.log(textFin);
  if (textFin.substring(textFin.length - 3, textFin.length) == "mp3") {
    textFin = document.getElementById("textAreaFin").name;
  }
  let qrColor = $('#qrColor').val();

  if (nomSeriousGame == "" || textIntro == "" || textFin == "" || qrColor == "") {
    tousLesChampsSontRemplies = false;
  }

  // On affecte le nom du seriousGame au nom du projet
  projetSeriousGame.setName(nomSeriousGame);

  let enigmes = [];
  if (projetSeriousGame.getQuestionsQr().length == 0 && projetSeriousGame.getQuestionsReco().length == 0) tousLesChampsSontRemplies = false;
  // On rempli le tableau d'enigme à partir les tableaux de questions QR et RecoVocale
  for (let i = 0; i < projetSeriousGame.getQuestionsQr().length; i++) {
    let detailEnigme = $("#enigme" + projetSeriousGame.getQuestionsQr()[i].idQR).val();
    if (detailEnigme == "") tousLesChampsSontRemplies = false;
    console.log("Ajout Qrcode");
    console.log(projetSeriousGame.getQuestionsQr()[i]);
    enigmes.push([projetSeriousGame.getQuestionsQr()[i].idQR.toString(), detailEnigme, "questionQRCode"]);
  }
  for (let i = 0; i < projetSeriousGame.getQuestionsReco().length; i++) {
    let detailEnigme = $("#enigme" + projetSeriousGame.getQuestionsReco()[i].idRec).val();
    if (detailEnigme == "") tousLesChampsSontRemplies = false;
    console.log("Ajout Reco");
    console.log(projetSeriousGame.getQuestionsReco()[i]);
    enigmes.push([projetSeriousGame.getQuestionsReco()[i].idRec.toString(), detailEnigme, "questionRecoVocale"]);
  }

  // On tri le tableau en fonction des id de question
  enigmes.sort(function (a, b) {
    return a[0] > b[0];
  });

  console.log(projetSeriousGame.getQuestionsQr());
  console.log(projetSeriousGame.getQuestionsReco());

  if (tousLesChampsSontRemplies) {
    console.log("Generation successfull");
    // On crée le Json de SeriousGame avec QRCodeSeriousGame
    let jsonSeriousGame = new QRCodeSeriousGame(nomSeriousGame, textIntro, textFin, enigmes, projetSeriousGame.getQuestionsQrForJson(), projetSeriousGame.getQuestionsRecoForJson(), qrColor);
    projetSeriousGame.setScenario(jsonSeriousGame);
    console.log(projetSeriousGame.getScenario());
    return true;
  } else {
    console.log("Generation failed");
    return false;
  }

}

function previewQRCodeQuestion() {
  var scenario = projetSeriousGame.getScenario();
  if ($('#qrView')[0].childElementCount == 0) {
    document.getElementById("qrView").append(document.createElement("div"));
  }
  previewQRCode(scenario, $('#qrView')[0]);
}

// generate and print qr code
function previewQRCode(qrcode, div) {
  let facade = new FacadeController();

  facade.genererQRCode(div, qrcode);
}

/*Permet d'exporter un Projet
 On enregistre la questions et les réponses du projet dans le répertoire sélectionné
 par l'utilisateur*/
$("#saveQRCode").click(function () {
  //Permet de sélectinner le répertoire où le projet va être enregistré
  var dir_path = dialog.showOpenDialog({ title: 'Sélectionnez un dossier', properties: ['openDirectory'] })[0];
  if (dir_path !== undefined) {
    var facade = new FacadeController();
    //projet.setName($("#projectId").val());

    var dir_path = path.join(dir_path, projetSeriousGame.getName());

    var fs = require('fs');
    if (!fs.existsSync(dir_path)) {
      fs.mkdirSync(dir_path);
    }

    //On enregistre le scénario
    let div = document.createElement('div');
    facade.genererQRCode(div, projetSeriousGame.getScenario());
    saveQRCodeImage(div, projetSeriousGame.getScenario(), dir_path);


    // Enregistrement des réponses aux énigmes de type QR Code dans des sous-repertoires
    projetSeriousGame.getQuestionsQrForJson().forEach(function(question) {

      // Recherche du nom de l'enigme auquelle est associé la question
      var nomEnigmeQuestion = "";
      projetSeriousGame.getScenario().getEnigmes().forEach(function(enigme) {
          if(enigme[0] == question[0]) {
            nomEnigmeQuestion = enigme[1];
            return;
          }
      });

      //Création du sous-repertoire
      var sub_dir_path = dir_path + "/" + nomEnigmeQuestion;
      if (!fs.existsSync(sub_dir_path)) {
        fs.mkdirSync(sub_dir_path);
      }

      var reponses = question[2];
      reponses.forEach(function(reponse) {
          var reponseObj = new ReponseQuestionQR(reponse[0], reponse[1], $('#qrColor').val());

          let div2 = document.createElement('div');
          facade.genererQRCode(div2, reponseObj);
          saveQRCodeImage(div2, reponseObj, sub_dir_path);
      });
    });

    $("#alertExportationOk").show();
    setTimeout(function () {
      $('#alertExportationOk').hide();
    }, 10000);
  }
});

//Cette fonction sauvegarde l'image du qrcode dans un div pour le pouvoir generer apres
function saveQRCodeImage(div, qrcode, directoryName) {
  let img = $(div).children()[0].src;
  //let data = img.replace(/^data:image\/\w+;base64,/, '');
  let matches = img.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let data = new Buffer(matches[2], 'base64');
  var file_name = qrcode.getName().replace(/[^a-zA-Z0-9]+/g, "") + '.jpeg';
  fs.writeFile(path.join(directoryName, file_name), data, (err) => {
    if (err) {
      $("#questionsDivLabelsId").append("<div>" + err + "</div>");
    }
    console.log('The file has been saved!');
  });
}


//pour ouvrir la page info.html quand on clique sur le bouton info du haut
$("#infos-serious-game").click(function () {
  require('electron').remote.getGlobal('sharedObject').someProperty = 'seriousGame'
  $("#charger-page").load(path.join(__dirname, "Views/info.html"));
});
