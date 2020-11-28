/**
 * @Date:   2018-12-04T08:24:59+01:00
 * @Last modified by:   louis cuegniet
 * @Last modified time: 25/11/2020
 */


$().ready(function() {
  //require("./js/script_unique.js");

  $('#setImportedFile').click(function() {
    var nomfichier = document.getElementById("importedFile").files[0].path;
    importQRCodeImport(nomfichier);
  });
});
//fonction permettant de charger, importer un qr code
function importQRCodeImport(filename) {
  let facade = new FacadeController();

  let blob = null;
  let xhr = new XMLHttpRequest();
  xhr.open("GET", filename);
  xhr.responseType = "blob"; //force the HTTP response, response-type header to be blob
  xhr.onload = function() {
    blob = xhr.response; //xhr.response is now a blob object
    facade.importQRCode(blob, drawQRCodeImport);
  }
  xhr.send();
}

// fonction permettant de recréer visuellement un qr code
function drawQRCodeImport(qrcode) {
  if (qrcode.getType() == 'unique' || qrcode.getType() == 'xl') {
    $("#charger-page").load(path.join(__dirname, "Views/unique.html"), function() {
      $('input#qrColor').val(qrcode.getColor()); // restaurer la couleur du qrcode
      $('input#qrName').val(qrcode.getName()); //restaurer le nom du qrcode
      store.set(`titreUnique`, qrcode.getName());
      isImportationQRUnique = true;
      $('#preview, #empty').attr('disabled', false);
      drawQRCodeData(qrcode);
    });
    //TODO Changer ici en multiple quand le type sera bien défini
  } else if (qrcode.getType() == 'ensemble') {
    $("#charger-page").load(path.join(__dirname, "Views/multiple.html"), function() {
      $('input#qrColor').val(qrcode.getColor()); // restaurer la couleur du qrcode
      $('input#qrName').val(qrcode.getName()); //restaurer le nom du qrcodemultiple
      controllerMultiple.setQRCodeMultiple(qrcode);
      $('#preview, #empty').attr('disabled', false);
      drawQRCodeMultipleUnique(qrcode);
      $('#txtDragAndDrop').remove();

    });
  } else if (qrcode.getType() == 'question') {
    $("#charger-page").load(path.join(__dirname, "Views/quesRep.html"), function() {
      $("#newQuestionText").val(qrcode.getName());
      $("#newBonneReponseText").val(qrcode.getGoodAnswer());
      $("#newMauvaiseReponseText").val(qrcode.getBadAnswer());
      $("#newNbMinimalBonneReponse").val(qrcode.getMinAnswer());
    });
  } else if (qrcode.getType() == 'ExerciceReconnaissanceVocaleQCM') {
    $("#charger-page").load(path.join(__dirname, "Views/recVocal.html"), function() {
      $("#questionOuverteOnglet").removeClass("active");
      $("#onglet-QuesOuverte").removeClass("active");
      $("#questionQCMOnglet").addClass("active");
      $("#onglet-QCM").addClass("active");
      $("#QuestionQCM").val(qrcode.getName());
      if(qrcode.getLettreReponseVocale()){
        $("#reponseParIdentifiant").prop( "checked", true );;
      }
      $("#MessageBonnereponseQCM").val(qrcode.getGoodAnswer());
      $("#MessageMauvaisereponseQCM").val(qrcode.getBadAnswer());
      drawQRCodeDataRecVocale(qrcode);
    });
}else if (qrcode.getType() == 'ExerciceReconnaissanceVocaleQuestionOuverte') {
  $("#charger-page").load(path.join(__dirname, "Views/recVocal.html"), function() {
    $("#Question").val(qrcode.getName());
    $("#Bonnereponse").val(qrcode.getReponse());
    $("#MessageBonnereponse").val(qrcode.getGoodAnswer());
    $("#MessageMauvaisereponse").val(qrcode.getBadAnswer());
  });
}else if (qrcode.getType() == 'SeriousGameScenario') {
  $("#charger-page").load(path.join(__dirname, "Views/serious-game.html"), function() {
    $("#projectId").val(qrcode.getName());
    $("#textAreaIntro").val(qrcode.getIntro());
    $("#textAreaFin").val(qrcode.getEnd());
    var projet = new ProjetSeriousGame(qrcode.getName(), qrcode.getQuestionQRCode(), qrcode.getQuestionRecoVocale());
    drawQRCodeSeriousGameEnigma(qrcode);
  });
}
}

// recréer les input d'un qrcode unique
function drawQRCodeData(qrcode) {
  let data = qrcode.getData();
  
  for (var i = 1; i <= store.get(`numZoneCourante`); i++) {
    store.delete(`zone${i}`);
  }

  for (var i = 0; i < data.length; i++) {
    if (typeof data[i] === "string") {
      ajouterChampLegende(data[i]);
    } else if (typeof data[i] === "object") {
      ajouterChampSon(data[i].name, data[i].url);
    }
  }
  let musics = data.filter(d => d.type == 'music');

  if(musics.length !==0){
    restoreSavedMusic(musics);
  }
}

// recréer les qrcode unique d'un qrcode multiple
function drawQRCodeMultipleUnique(qrcode) {
  for (var i = 0; i < qrcode.getData().length; i++) {
    let qrJson = qrcode.getData()[i].qrcode;
    let qr = null;

    if (qrJson.type == "unique"){
      qr = new QRCodeUnique(qrJson.name, qrJson.data, qrJson.color);
    }
    else if (qrJson.type == "xl"){
      qr = new QRCodeXL(qrJson.name, qrJson.data, qrJson.color);
    }
    else if (qrJson.type == "ensemble"){
      qr = new QRCodeMultipleJson(qrJson.name, qrJson.data, qrJson.color);
    }
    else if (qrJson.type == "question"){
      qr = new QRCodeQuestionReponse(qrJson.name, qrJson.data, qrJson.color);
    }


    genererLigne(qr.getName());
    controllerMultiple.setQRCodeAtomiqueInArray(qr);
  }
  // recuperationQrCodeUnique(qrcode);
}

// recréer les inputs d'un qrcode RecVocal
function drawQRCodeDataRecVocale(qrcode) {
  let data = qrcode.getData();
  console.log(data);
  for (var i = 0; i < data.length; i++) {
    console.log(i);
    var reponse = new ReponseVocale(data[i][0], data[i][1], data[i][2])
    if(i==0) {

      $("#reponseinitiale").val(reponse.getTextQuestion());
      if(reponse.getEstBonneReponse()){
        $("#gridCheck1").prop("checked", true);
      }
    }
    else {
      ajouterLigneReponse(reponse);
    }
    
  }
}

// recréer les inputs d'un qrcode Scenario Serious Game
function drawQRCodeSeriousGameEnigma(qrcode) {
  let enigmes = qrcode.getEnigmes();
  console.log(enigmes);
  for (var i = 0; i < enigmes.length; i++) {
    if(i==0){
      $("#enigme1").val(enigmes[i][1]);
      
    }else{
      ajouterEnigme(enigmes[i]);
    }

    
  }
}
var compteurReponse = 1;
function ajouterLigneReponse(data) {
  compteurReponse++;
  if (compteurReponse < 30) {
    type = "Reponse";
    let reponse = document.createElement('div');
    reponse.innerHTML = `<div class="form-row" id="divQuestion` + compteurReponse + `">
                            <div class="form-group col-md-3">
                                  <label class="control-label">Réponse `+ compteurReponse + ` :</label>
                                </div>
                         <div class="form-group col-md-2">
                                   <input class="form-check-input" type="checkbox" name="gridRadios" id="gridCheck`+ compteurReponse + `" style="width:70px;" 
                                      value="option"` + compteurReponse + `" value ="`+data.getEstBonneReponse()+`">
                                      <label class="form-check-label" for="gridCheck`+ compteurReponse + `">
                            </div>
                          <div class="form-group col-md-6">
                                 <input type="text" class="form-control col-sm-6" id="reponse`+ compteurReponse + `" rows="2" name="nomprojet"
                                placeholder="Réponse" value ="`+data.getTextQuestion()+`"/>
                           </div>
                            <div class="form-group col-md-1">
                                <button id="deleteQRCode`+ compteurReponse + `" type="button"
                                    class="btn btn-outline-success align-self-center" onclick="supprLigne(` + compteurReponse + ",\'" + type + `\');">
                                    <i class="fa fa-trash"></i></button>
                                    </div>
                            </div>`;

    let container = $("#repContainer");
    container.append(reponse);
  }
}




//Pour ajouter autant d'énigme que souhaité
var type = "";
var compteurEnigme = 1;
var currentEnigme = 1;

function ajouterEnigme(enigme) {
  compteurEnigme++;
  if (compteurEnigme < 30) {
    type = "enigme";
    let reponse = document.createElement('div');
    reponse.innerHTML = `<div class="form-group">
                            <div class="form-inline" class="col-sm-12" id="divEnigme` + compteurEnigme + `">
                              <label class="control-label"
                              style="color:#28a745;padding-top:10px;padding-right:54px;">Énigme `+ compteurEnigme + ` : </label>
                              <input type="text" class="form-control" id="enigme`+ compteurEnigme + `" name="nombreReponse"
                              placeholder="Nom de l'énigme `+ compteurEnigme + `" onkeyup="activerSave();" value="`+enigme[1]+`"/>
                              &nbsp;
                              <div class="btn-group" style="display:true" id="menuDeroulant`+ compteurEnigme + `">
                                <button type="button" class="btn btn-outline-success align-self-center dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Type énigme        &nbsp;&nbsp; &nbsp;
                                </button>
                                <div class="dropdown-menu" >
                                  <button type="button" id="scanQR`+ compteurEnigme + `" name="ajouterQR` + compteurEnigme + `" data-toggle="modal"
                                  data-target="#popupQRCode` + compteurEnigme + `" class="dropdown-item">
                                  <i class="fa fa-qrcode"></i>&nbsp;&nbsp;QR CODE</button>&nbsp;
                                  <button id="recVocale`+ compteurEnigme + `" type="button" class="dropdown-item"
                                  data-toggle="modal" data-target="#popupRecVocale` + compteurEnigme + `">
                                  <i class="fa fa-microphone"></i>&nbsp;&nbsp;Reconnaissance vocale</button>
                                  </div>
                                </div>
                                <div id="modification`+ compteurEnigme + `">
                                &nbsp;
                                <button id="deleteEnigme`+ compteurEnigme + `" type="button" onclick="supprLigne(` + compteurEnigme + ",\'" + type + `\');" class="btn btn-outline-success align-self-center">
                                <i class="fa fa-trash"></i></button>
                              </div>                              
                          </div>`;

    let container = $("#containerEnigme");
    container.append(reponse);
  }
};





// télécharger la musique correspondante et l'enregistrer
function restoreSavedMusic(data) {
  let loader = document.createElement('div');
  let content = $('.tab-content');

  $(loader).addClass('loader');
  $('.card-body')[0].insertBefore(loader, content[0]); // show loader when request progress
  content.hide();

  let nbMusic = 0;

  for (let music of data) {
    let xhr = new XMLHttpRequest();
    try {
      xhr.open('GET', music.url, true);
    } catch (e) {
      console.log(e);
    }

    xhr.responseType = 'blob';
    xhr.onload = function(e) {

      if (this.status == 200) {
        let blob = this.response; // get binary data as a response
        let contentType = xhr.getResponseHeader("content-type");

        if (contentType == 'audio/mpeg') {
          // save file in folder download
          let fileReader = new FileReader();
          fileReader.onload = function() {
            // fs.writeFileSync(`${temp}/Download/${music.name}`, Buffer(new Uint8Array(this.result)));
            fs.writeFile(`${temp}/Download/${music.name}`, Buffer(new Uint8Array(this.result)), (err) => {
              if (err) throw err;
              console.log('The file has been saved!');
              nbMusic++;
              if (nbMusic == data.length) {
                $(loader).remove();
                content.show();
              }
            });
          };
          fileReader.readAsArrayBuffer(blob);
        } else {
          console.log('error on download, le fichier nexiste peut etre plus');
        }
      } else {
        // request failed
        console.log('error on download, request fails');
      }
    };

    xhr.onerror = function(e) {
      console.log('error');
    };

    xhr.send();
  }
}
