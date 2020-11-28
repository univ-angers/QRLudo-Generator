/**
 * @Date:   2018-11-23T11:47:00+01:00
 * @Last modified by:   alassane
 * @Last modified time: 2018-12-04T21:15:05+01:00
 */


var projet = new ProjetQCM();


$(document).ready(function() {

  var nombreReponsesAttendues;

  //con cache la zonne de la reponse    &&
  $('#zoneReponse').hide();

  enregistrement();
  store.delete(`numReponseQCM`);
  store.set(`numReponseQCM`,numReponseQCM);

  //$('#zoneReponse').hide();



  $("#play-sound-div").hide();

  //Ajout d'une nouvelle question
  $("#addNewQuesBtnId").click(function(e) {

    //On verifie si le texte de la question n'est pas vide
    if ($('#newQuestionText').val() === ""){
      $("#alertQuestionVideError").show();
      return; // si le champ est vide on sort
    }

    //On vérifie si le texte du nombre de réponses n'est pas vide ou incorrect
    if ($('#nombreReponse').val() === "" || parseInt($('#nombreReponse').val(),10) < 2 || parseInt($('#nombreReponse').val(),10) > 4 ){
      $("#alertNombreReponseVideError").show();
      return; // si le champ est vide on sort
    }

    $("#alertNombreReponseVideError").hide();
    $("#alertQuestionVideError").hide();
    $("#alertQuestionExistError").hide();

    //afficher la zone cahé     &&
    $('#zoneReponse').show();

    //On cache le bouton car un QCM ne contient qu'une seule question
    $("#addNewQuesBtnId").hide();


    //Creation de la question dans le projet
    nombreReponsesAttendues = $('#nombreReponse').val();
    let nouvques = new QuestionQCM($('#newQuestionText').val(), $('#nombreReponse').val(), [], $("#qrColor").val());
    projet.setQuestion(nouvques);

    addQuestionLine(nouvques);

    $('#newQuestionText').val("");
   return true;
  });


  $("#addNewRep").click(function(e){
    e.preventDefault();
    $("#messageReponseSansQuestionError").hide();
    $("#messageReponseVideError").hide();
    $("#messageRetourVocalVideError").hide();
    $("#messageReponseExistError").hide();
    $("#messageReponseMaxError").hide();

    //On verifie qu'il y a une question de créée
    if (projet.getQuestion() == null) {
      $("#messageReponseSansQuestionError").show();
      return false;
    }

    //On verifie la condition que l'on a pas plus de réponse qu'attendu
    if(projet.getReponses().length >= nombreReponsesAttendues) {
      $("#messageReponseMaxError").show();
      return false;
    }

    //On verifie que le texte de la reponse n'est pas vide
    if ($('#newReponseText').val() === ""){
      $("#messageReponseVideError").show();
      return false;
    }

    //On verifie que le texte du retour vocal n'est pas vide
    if($('#newReponseVocalText').val() === "") {
      $("#messageRetourVocalVideError").show();
      return false;
    }

    let isAnswer = false;
    if($("#isBonneRepCheckBox").is(":checked")) {
      isAnswer = true;
    }

    //Si il y a trois reponses et aucune n'est une bonne reponse, alors on force la 4eme et derniere reponse à etre la reponse correct
    if(projet.getReponses().length == nombreReponsesAttendues-1 && !isReponseOk()) {
      isAnswer = true;
    }

    var new_rep = new ReponseQCM($('#newReponseText').val(),isAnswer,$("#qrColor").val());
    var new_rep_vocal = $('#newReponseVocalText').val();

    //sortir de la fonction si la reponse existe déjà pour la question
    let existe = false;
    $.each(projet.getReponses(), function(i, val) {
      if (projet.getReponseById(val.getId()).getName() === $('#newReponseText').val()) {
        existe = true;
        return;
      }
    });
    if (existe){
      $("#messageReponseExistError").show();
      return false;
    }

    //Ajouter au projet et à la question la nouvelle réponse
    projet.addReponse(new_rep);
    projet.getQuestion().addReponse(new_rep.getId(), new_rep_vocal);


    //On gère la continuité sur l'ajour d'une reponse
    var infos_rep = projet.getQuestion().getReponseById(new_rep.getId());

    store.delete("numReponseQCM");
    numReponseQCM ++;
    store.set("numReponseQCM",numReponseQCM);
    store.set(`reponseQCM${numReponseQCM}`,new_rep.getName());
    store.set(`reponseMessageQCM${numReponseQCM}`,infos_rep.message);
    store.set(`reponseQCMisAnswer${numReponseQCM}`,new_rep.getIsAnswer());

    addReponseLine(new_rep, numReponseQCM);


    console.log("----->DEBUG<-------");
    console.log(projet.getQuestion());
    console.log("-------------------");
    console.log(projet.getReponses());
    console.log("----->FIN<--------\n");


    //Si la reponse est la bonne et qu'elle a été ajouté dans erreurs alors on decoche la checkbox et on la cache (une seule reponse est possible)
    if(isAnswer) {
      $("#isBonneRepCheckBox").prop("checked", false);
      $("#bonneRepCheckBox").hide();
    }

    //Suppression des données dans les champs de tests pour ecrire une nouvelle reponses
    $('#newReponseText').val('');
    $('#newReponseVocalText').val('');

    return true;
  });

  /*Permet d'exporter un Projet
  On enregistre la questions et les réponses du projet dans le répertoire sélectionné
  par l'utilisateur*/
  $("#saveQRCode").click(function() {
    //Permet de sélectinner le répertoire où le projet va être enregistré
    var dir_path = dialog.showOpenDialog({title: 'Sélectionnez un dossier', properties: ['openDirectory']})[0];
    if(dir_path !== undefined){
      var facade = new FacadeController();
      projet.setName($("#projectId").val());

      var dir_path = path.join(dir_path, projet.getName());

      var fs = require('fs');
      if(!fs.existsSync(dir_path)){
        fs.mkdirSync(dir_path);
      }

      //On enregistre la question
      let div = document.createElement('div');
      facade.genererQRCode(div, projet.getQuestion());
      saveQRCodeImage(div, projet.getQuestion(), dir_path);


      //Idem pour les réponses
      $.each(projet.getReponses(), function(id, reponse){
        let div = document.createElement('div');
        facade.genererQRCode(div, reponse);
        saveQRCodeImage(div, reponse, dir_path);
      });

      $("#alertExportationOk").show();
      setTimeout(function () {
        $('#alertExportationOk').hide();
      }, 10000);
    }
  });

  //Import d'un projet existant à partir d'un répertoire
  $('#importProjectBtnId').click(function(){
    //Permet de sélectionner le répertoire du projet
    var dir_path = dialog.showOpenDialog({title: 'Sélectionnez le projet', properties: ['openDirectory']})[0];
    projet = new ProjetQCM();
    var path_split = dir_path.split(path.sep);
    //On récupère le nom du projet
    projet.setName(path_split[path_split.length-1]);
    $("#projectId").val(path_split[path_split.length-1]);
    store.set("titreQCM",$("#projectId").val());
    $("#reponsesListModal").empty();
    $("#questionsDivLabelsId").empty();

    let facade = new FacadeController();

    var fs = require('fs');


    //Pour chaque fichier du répertoire
    fs.readdir(dir_path, (err, files) => {
      $.each(files, function(i, file){
        console.log(file);
        var file_path = path.join(dir_path,file);
        let blob = null;
        //On crée une requête xmlhttp pour récupérer le blob du fichier
        let xhr = new XMLHttpRequest();
        xhr.open("GET", file_path);

        xhr.responseType = "blob";
        xhr.onload = function() {
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

  //Changement couleur
  $("#qrColor").on('change', function(){
    var color = $(this).val();

    projet.getQuestion().setColor(color);

    $.each(projet.getReponses(), function(i, reponse){
      reponse.setColor(color);
    });
  });
});

//Permet de gérer la continuité dans l'application au chargement du script
function enregistrement(){

  if(store.get(`numReponseQCM`)){
    numReponseQCM = store.get(`numReponseQCM`);
  }

  if(store.get(`nombreReponsesAttendues`)){
    nombreReponsesAttendues = store.get(`nombreReponsesAttendues`);
  }

  //verification pour le titre
  if(store.get("titreQCM")){
    projet.setName(store.get("titreQCM"));
    $("#projectId").val(store.get("titreQCM"));
  }

  if(store.get("questionQCM")){
    $("#addNewQuesBtnId").hide();
    $('#zoneReponse').show();
  }

  //verification pour la présence d'une // QUESTION:
  if(store.get("questionQCM")){
    let nouvques = new QuestionQCM(store.get("questionQCM"), [], $("#qrColor").val());
    projet.setQuestion(nouvques);

    addQuestionLine(nouvques);

    $("#addNewQuesBtnId").hide();
    //si question deja générer on affiche toujour ajout de reponse   &&&
    $('#zoneReponse').show();

  }

  for(var i = 1 ; i<numReponseQCM+1; i++){
    if(store.get(`reponseQCM${i}`)){
      var new_rep = new ReponseQCM(store.get(`reponseQCM${i}`),store.get(`reponseQCMisAnswer${i}`),$("#qrColor").val());

      projet.addReponse(new_rep);
      projet.getQuestion().addReponse(new_rep.getId(), store.get(`reponseMessageQCM${i}`));
      addReponseLine(new_rep, i);
    }
  }
}

function addQuestionLine(question){
  var newQuestLine = "" +
  "<div class='form-control divQuestion' id='" + question.getId() + "' style='margin-top:10px;'>" +
    "<div class='form-group'>" +
      "<label class='control-label text-left questionNameLabel' id='" + question.getId() + "' style='text-align:left!important; color:black;'>" + question.getName() + "</label>" +
      "<button class='btn btn-outline-success float-right' id='" + question.getId() + "' onclick='deleteQuestion();'>" +
        "<i class='fa fa-trash-alt'></i>" +
      "</button>" +
      "<button class='btn btn-outline-success float-right' id='" + question.getId() + "' onclick='previewQRCodeQuestion();' onmouseover='afficheInfoBtnQrCode(this,\"question\")' onmouseout='supprimeInfoBtnQrCode(this,\"question\")'>" +
        "<i class='fa fa-qrcode'></i>" +
      "</button>" +
      "<button class='btn btn-outline-success float-right' id='" + question.getId() + "' onclick='lireQuestion();'>" +
        "<i class='fa fa-play'></i>" +
      "</button>" +
      "<div class='alert alert-success fade show float' role='alert' id='infoGenererQrCodeQuestion' style='display:none;font-size:14px;'>" +
        "Ce bouton permet de pré-visualiser le Qr Code de la question" +
      "</div>" +
    "</div>" +
    "<label class='control-label'>Réponse(s)</label>" +
    "<div class='reponseDiv' id='" + question.getId() + "'></div>" +
  "</div>";

  $("#questionsDivLabelsId").append(newQuestLine);

  //On gère la continuité sur l'ajout d'une question
  store.set("questionQCM",question.getName());
}

//Ajout de la reponse dans le div d'une question
function addReponseLine(reponse, idReponse){
  var infos_rep = projet.getQuestion().getReponseById(reponse.getId());
  var newRepLine = "<div style='height:35px;' id='" + reponse.getId() + "'>" +
  "<li style='color:black;font-size:14px;'>" +
  "<label>" + reponse.getName() + "&nbsp&nbsp</label>" +
  "<em style='color:gray'>" + infos_rep.message + "&nbsp&nbsp&nbsp</em>";

  if(reponse.getIsAnswer()) {
    newRepLine += "<i class='fas fa-check-circle'></i>";
  }

  newRepLine += "<button class='btn btn-outline-success float-right' id='" + reponse.getId() + "' onclick='deleteReponse(this,"+ idReponse +");'><i class='fa fa-trash-alt'></i></button>" +
  "<button class='btn btn-outline-success float-right' id='" + reponse.getId() + "' onclick='previewQRCodeReponse(this)' onmouseover='afficheInfoBtnQrCode(this,\"reponse\")' onmouseout='supprimeInfoBtnQrCode(this,\"reponse\")'><i class='fa fa-qrcode'></i></button>" +
  "<button class='btn btn-outline-success float-right' id='" + reponse.getId() + "' onclick='lireReponse(this);'><i class='fa fa-play'></i></button>" +
  "<div class='alert alert-success fade show float' role='alert' id='infoGenererQrCodeReponse" + reponse.getId() +"' style='display:none;font-size:15px;'>Ce bouton permet de pré-visualiser le Qr Code de la réponse</div>" +
  "</li>" +
  "</div>";

  $("div#" + projet.getQuestion().getId() + " .reponseDiv").append(newRepLine);

}


//Permet d'afficher une information sur le bouton pour generer les qr code
function afficheInfoBtnQrCode(button, cible){
  if(cible == "question") {
    $("#infoGenererQrCodeQuestion").show();
  }
  else if(cible == "reponse"){
    var id_reponse = $(button).attr('id');
    $("div#infoGenererQrCodeReponse" + id_reponse).show();
  }
}

//Permet d'enlever l'information sur le bouton pour generer les qr code
function supprimeInfoBtnQrCode(button, cible){
  if(cible == "question") {
    $("#infoGenererQrCodeQuestion").hide();
  }
  else if(cible == "reponse"){
      var id_reponse = $(button).attr('id');
      $("#infoGenererQrCodeReponse" + id_reponse).hide();
  }
}



//Supprimer une question du projet
function deleteQuestion(){

  //on cache la zone de reponse   &&&
  $('#zoneReponse').hide();

  //Suppression dans le store de la question et des réponses alliées
  for(var i = 1 ; i<numReponseQCM+1; i++){
    if(store.get(`reponseQCM${i}`)){
      store.delete(`reponseQCM${i}`);
      store.delete(`reponseMessageQCM${i}`);
      store.delete(`reponseQCMisAnswer${i}`);
    }
  }
  numReponseQCM = 0;
  store.delete("questionQCM");

  var id_question = projet.getQuestion().getId();
  $("div#" + id_question + '.divQuestion').remove();

  projet.removeQuestion();

  //On peut ré-afficher le bouton pour ajouter une question et pour cocher la bonne reponse
  $("#addNewQuesBtnId").show();
  $("#bonneRepCheckBox").show();

  //On cache les erreurs des réponses si elles sont présentes
  $("#messageReponseSansQuestionError").hide();
  $("#messageReponseVideError").hide();
  $("#messageRetourVocalVideError").hide();
  $("#messageReponseExistError").hide();
  $("#messageReponseMaxError").hide();
}

//Supprimer une réponse du projet
function deleteReponse(button, idReponse){
  numReponseQCM--;
  //suppression des éléments permettant de contruire
  store.delete(`reponseQCM${idReponse}`);
  store.delete(`reponseMessageQCM${idReponse}`);
  store.delete(`reponseQCMisAnswer${idReponse}`);

  var id_reponse = $(button).attr('id');

  //Si on supprime la bonne reponse, alors on ré-affiche la checkbox
  if(projet.getReponseById(id_reponse).getIsAnswer()) {
    $("#bonneRepCheckBox").show();
  }

  projet.removeReponse(id_reponse);
  $("div#" + id_reponse).remove();

  $("#messageReponseMaxError").hide();
}

//Méthode appelée lors de l'import d'un qrcode QCM
//Permet d'ajouter au projet les qrcodes importés
function importQCM(qrcode){

  if(qrcode.getType()==='questionQCM'){
    // Si la qr code est la question, on l'ajoute au projet, on l'affiche et on cache le bouton d'ajout d'une nouvelle question
    projet.setQuestion(qrcode);
    addQuestionLine(qrcode);

    $("#addNewQuesBtnId").hide();
  }
  else if (qrcode.getType()==='reponseQCM') {

    // Si le qr code est une reponse, on l'ajoute au projet
    projet.addReponse(qrcode);
    //On gère la continuité sur l'ajour d'une reponse
    var infos_rep = projet.getQuestion().getReponseById(qrcode.getId());

    store.delete("numReponseQCM");
    numReponseQCM ++;
    store.set("numReponseQCM",numReponseQCM);
    store.set("nombreReponsesAttendues",nombreReponsesAttendues);
    store.set(`reponseQCM${numReponseQCM}`,qrcode.getName());
    store.set(`reponseMessageQCM${numReponseQCM}`,infos_rep.message);
    store.set(`reponseQCMisAnswer${numReponseQCM}`,qrcode.getIsAnswer());

    if(infos_rep !== null) {
      // On ajoute la reponse a la question et on affiche la reponse
      addReponseLine(qrcode,numReponseQCM);
    }
  }
}

//Cette fonction sauvegarde l'image du qrcode dans un div pour le pouvoir generer apres
function saveQRCodeImage(div, qrcode, directoryName) {
  let img = $(div).children()[0].src;
  //let data = img.replace(/^data:image\/\w+;base64,/, '');
  let matches = img.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let data = new Buffer(matches[2], 'base64');
  var file_name = qrcode.getName().replace(/[^a-zA-Z0-9]+/g, "") + '.jpeg';
  fs.writeFile(path.join(directoryName, file_name), data, (err) => {
    if (err){
      $("#questionsDivLabelsId").append("<div>" + err + "</div>");
    }
    console.log('The file has been saved!');
  });
}

function activerSave(){
  //enregistrement du titre dans le store permettant la continuité
  store.delete('titreQCM');
  var txt = $("#projectId").val();
  store.set('titreQCM',txt);

  if($("#projectId").val().length > 0){
    $("#saveQRCode").attr('disabled', false);
  }
  else{
    $("#saveQRCode").attr('disabled', true);
  }
}

function previewQRCodeQuestion(){
  var question = projet.getQuestion();
  previewQRCode(question, $('#qrView')[0]);
}

// Previsualiser les reponses
function previewQRCodeReponse(button) {
  var id_reponse = $(button).attr('id');
  let rep = projet.getReponseById(id_reponse);
  previewQRCode(rep, $('#qrView')[0]);
}

// generate and print qr code
function previewQRCode(qrcode, div) {
  let facade = new FacadeController();

  facade.genererQRCode(div, qrcode);
}

function lireQuestion(){
  var id_question = projet.getQuestion().getId();
  var text_question = $("label#" + id_question + ".questionNameLabel").text();

  playTTS(text_question);
}

function lireReponse(button){
  var id_reponse = $(button).attr('id');
  var text_reponse = $("div#" + id_reponse + " label").text();
  var text_retourVocal = $("div#" + id_reponse + " em").text();

  playTTS(text_reponse + text_retourVocal);
}


//Retourne vrai si il y a une bonne reponse, faux sinon
function isReponseOk() {
  for(let reponse of projet.getReponses()) {
    if(reponse.getIsAnswer()) {
      return true;
    }
  }
  return false;
}
