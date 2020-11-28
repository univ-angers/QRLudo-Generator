
/**
 * BAH Marouwane
 * 2019
 */

var projet = new Projet();

nombre_reponse=0;

$(document).ready(function() {

  //méthode gérant la continuité
  enregistrement();

  if (numReponse > 0)
    document.getElementById("ajoutNewReponse").disabled = false;

  //fonction pour ajouter un nouvelle reponse
  $("#validerDataDialog").click(function(){

      let identifiant= $('#newId').val();
      let reponseVocale = $("#newContenuVocal").val();
      let qrColor = $('#qrColor').val();
      let qrData = [];

      document.getElementById("newContenuVocal").value = "";
      document.getElementById("newId").value = "";

        //On verifie qu'il y a une question de créée
        if (projet.getQuestion() == null) {
          alert ("pas de question");
          return ;
        }

        //On verifie que le texte de la reponse n'est pas vide
        if (identifiant === ""){
          alert("pas d'identifiant")
          return ; // si le champ est vide on sort
        }
        //On verifie que le texte du retour vocal n'est pas vide
        if(reponseVocale === "") {
          alert("pas de reponse vocale");
          return;
        }
        qrData.push(reponseVocale);
        var new_rep = new QRCodeUnique(identifiant, qrData,  qrColor);
        var new_rep_vocal = reponseVocale;

        //Récuperation des inforamtion de la question pour gérer la continuité
        numReponse ++;
        deleteStore('numReponse');
        store.set('numReponse',numReponse);

        deleteStore("reponse"+numReponse);
        store.set("reponse"+numReponse,new_rep.getName());

        deleteStore("data"+numReponse);
        store.set("data"+numReponse,qrData);

        deleteStore("reponseId"+numReponse);
        store.set("reponseId"+numReponse,new_rep.getId());

        deleteStore("reponseColor"+numReponse);
        store.set("reponseColor"+numReponse,qrColor);

        //sortir de la fonction si la reponse existe déjà pour la question
        let existe = false;
        $.each(projet.getReponses(), function(i, val) {
          if (projet.getReponseById(val.getId()).getName() === identifiant){
            existe = true;
            return;
          }
        });
        if (existe){
          alert ("Cette Reponse existe deja");
          return false;
        }

        //Ajouter au projet et à la question la nouvelle réponse
        projet.addReponse(new_rep);
        //console.log('id='+new_rep.getId() );

        projet.getQuestion().addReponse( (new_rep.getId() ), new_rep_vocal);
        //console.log(projet.getQuestion());

        addReponseLine(new_rep);

        // console.log(new_rep_vocal);
        console.log(projet.getQuestion());
        console.log("--------------------");
        console.log(projet.getReponses());
        console.log("--------------------");
        console.log(projet.getQuestion().getReponses());

        return true;

  });

//fonction pour e
  $("#preview").click(function() {
      previewQRCodeQuestion(); 
      $('#qrView').show();

  });



  $("#emptyFields").click(function(){
    viderZone();
  })

  function viderZone(){
     // masquage du lecteur de qr code
     $('#qrView').hide();

     //grissage des bouton qui etais grissé de basse
     $('#saveQRCode').attr('disabled', true);
     $("#ajoutNewReponse").attr('disabled', true);
     $("#preview").attr('disabled', true);

     //masquage de la zone bonne reponse
     $("#dropZone").hide();

     //reinitialisation de projet qui contient les questions
     projet = new Projet();
     //affichage du bouton question
     $("#genererQestion").show();

    controllerMultiple = new ControllerMultiple();
    $('#newQuestionText').val('');
    $('#newBonneReponseText').val('');
    $('#newMauvaiseReponseText').val('');
    $('#newNbMinimalBonneReponse').val('');

    deleteStore(`newQuestionText`);

    deleteStore(`newBonneReponseText`);
  
    deleteStore('newMauvaiseReponseText');
  
    deleteStore('newNbMinimalBonneReponse');
  
    for(var i=1; i<numReponse+1; i++){
      deleteStore('reponse'+i);
      deleteStore(''+i);
      deleteStore('reponseId'+i);
      deleteStore('reponseColor'+i);
    }
  
    deleteStore('numReponse');
    numReponse = 0;
  }
});

// fonction qui ajoute la ligne de la reponse sur la zone prévu a cet effet
function addReponseLine(reponse){
  if ($('#newNbMinimalBonneReponse').val() <= numReponse) {
  $("#preview").attr("disabled", false);
   }
  txtDragAndDrop.remove();
  var infos_rep = projet.getQuestion().getReponseById(reponse.getId());


  var newRepLine = "<div style='height:35px;' id='" + reponse.getId() + "'>" +
  "<li style='color:black;font-size:14px;'>" +
  "<label>" + reponse.getName() + "&nbsp&nbsp</label>" +
  "<em style='color:gray'>" + reponse.getDataAll() + "</em>" +
  "<button class='btn btn-outline-success float-right' id='" + reponse.getId() + "' onclick='deleteReponse(this);'><i class='fa fa-trash-alt'></i></button>" +
  "<button class='btn btn-outline-success float-right' id='" + reponse.getId() + "' onclick='lireReponse(this);'><i class='fa fa-play'></i></button>" +
  "</li>" +
  "</div>";

  $("#cible").append(newRepLine);
  document.getElementById('Nbbonne').innerHTML = numReponse;
  //console.log(numReponse);
}

   
$("#genererQestion").click(function() {
  $("#ajoutNewReponse").attr('disabled', false);

  let question= $('#newQuestionText').val();
  let bonneReponse = $('#newBonneReponseText').val();
  let mauvaiseReponse = $('#newMauvaiseReponseText').val();
  let nbMinBoneReponse = $('#newNbMinimalBonneReponse').val();
  let qrColor = $('#qrColor').val();
  let qrData = [];


  //On verifie si le texte de la question n'est pas vide
  if (question=== ""){
    $("#errorModalQuestion").modal('show');
        return; // si le champ est vide on sort
  }
  else if (bonneReponse=== ""){
    $("#errorModalBReponse").modal('show');
        return; // si le champ est vide on sort
  }
  else if (mauvaiseReponse=== ""){
    $("#errorModalMReponse").modal('show');
        return; // si le champ est vide on sort
  }
  else if (nbMinBoneReponse=== ""){ 
    $("#errorModalNombreReponse").modal('show');
        return; // si le champ est vide on sort
  }
  else {
    let nouvQuestion = new Question (question,bonneReponse,mauvaiseReponse, qrData ,nbMinBoneReponse, $("#qrColor").val());
    projet.setQuestion(nouvQuestion);

    //addQuestionLine(nouvQuestion);
    var questions = projet.getQuestion();

    //affichage de la zone de question
    $("#dropZone").show();

    //on cache le bouton question
    $("#genererQestion").hide();

  }
});








//Permet de vider la zone Exercice ainsi que les éléméent enregistré dans le store
function viderZone(){
  deleteStore(`newQuestionText`);

  deleteStore(`newBonneReponseText`);

  deleteStore('newMauvaiseReponseText');

  deleteStore('newNbMinimalBonneReponse');

  for(var i=1; i<numReponse+1; i++){
    deleteStore('reponse'+i);
    deleteStore(''+i);
    deleteStore('reponseId'+i);
    deleteStore('reponseColor'+i);
  }

  deleteStore('numReponse');
  numReponse = 0;


    $('#qrName').val('');
    $(txtZone).empty();
    $("#cible").empty();
    txtZone.appendChild(txtDragAndDrop);
}

//Permet d'effacer la valeur des champs dans la zone Exercice
function viderChamps(){
  document.getElementById("newQuestionText").value="";
  document.getElementById("newBonneReponseText").value="";
  document.getElementById("newMauvaiseReponseText").value="";
  document.getElementById("newNbMinimalBonneReponse").value="";
}

  //compteur du nombre de reponse pour  pouvoir reinitliser la zone de drad and drop



// Supprime une ligne dans la zone de drop
function effacerLigne() {

  //recuperation de id de l'element
  let idElement = $($(this).parent()).attr('id');

  $("#"+idElement).remove();


}

// Redonne l'apparance par default d'une ligne
function affichageLigneParDefault() {
    $('#txtZone').find('span').css('background-color', '')
  }

  /*Permet d'exporter un Projet
  On enregistre toutes les questions et réponses du projet dans le répertoire sélectionné
  par l'utilisateur*/
  $("#saveQRCode").click(e => {
    saveQRCodeImage();
  });

  var dropZone = document.getElementById('dropZone');
  var txtZone = document.getElementById('txtZone');
  var txtDragAndDrop = document.createElement("P");

  txtDragAndDrop.setAttribute("id", "txtDragAndDrop");
  txtDragAndDrop.setAttribute("class", "col-sm-7");
  txtDragAndDrop.setAttribute("style", "text-align: center; margin-top: 15%");
  txtDragAndDrop.innerText = "Déposez vos réponses ici";

  txtZone.appendChild(txtDragAndDrop);
  // Ce declenche quand un element entre dans la zone de drop
  dropZone.ondragenter = function(e) {};

  // Ce declenche quand un element quitte la zone de drop
  dropZone.ondragleave = function(e) {};

  // Ce declenche quand un element se deplace dans la zone de drop
  dropZone.ondragover = function(e) {
    e.preventDefault();
  };

  // Ce declenche quand un element est depose dans la zone de drop
  dropZone.ondrop = function(e) {
    e.preventDefault();
    //On verifie qu'il y a une question de créée
    if (projet.getQuestion() == null) {
      $("#errorModalQuestion").modal('show');
      return ;
    }
    else {
      txtDragAndDrop.remove();
    }

    // Parcours le ou les fichiers drop dans la zone
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      let qrFile = e.dataTransfer.files[i];

      facade =  new FacadeController();
      facade.importQRCodeJson(qrFile, qrCode =>{
        if (qrCode.getType() == 'xl' || qrCode.getType() == 'unique' || qrCode.getType() == 'reponse'){
          let qrId = qrCode.getId();
          let qrDatad = qrCode.getData();
          let qrName = qrCode.getName();
          let qrData =[];

          //console.log(qrDatad[0]);

          qrData.push(qrDatad);
          var new_rep = new QRCodeUnique(qrName,qrData, $("#qrColor").val()); // cretation d'une nouvelle reponse
          new_rep.setId(qrId);        // changemnt de l'id de la nouvelle reponse avec l'id du qr imprté
          new_rep.setData(qrData);
          var new_rep_vocal = qrData;

          //Récuperation des inforamtion de la question pour gérer la continuité
          numReponse ++;
          deleteStore('numReponse');
          store.set('numReponse',numReponse);

          deleteStore("reponse"+numReponse);
          store.set("reponse"+numReponse,new_rep.getName());

          deleteStore("data"+numReponse);
          store.set("data"+numReponse,qrData);

          deleteStore("reponseId"+numReponse);
          store.set("reponseId"+numReponse,qrId);

          deleteStore("reponseColor"+numReponse);
          store.set("reponseColor"+numReponse,$("#qrColor").val());

          console.log(qrData);

          //sortir de la fonction si la reponse existe déjà pour la question
          let existe = false;
          $.each(projet.getReponses(), function(i, val) {
            if (projet.getReponseById(val.getId()).getName() === qrName){
              existe = true;
            }
          });
          if (existe){
            alert ("Cette Reponse exite deja");
            return ;
          }

          //verification que le QR code a un id     &&
          if(qrCode.getId() == null){
            alert ("Votre Qr Code n'a pas d'identifiant ERROR!");
            return ;
          }

          //Ajouter au projet et à la question la nouvelle réponse
          projet.addReponse(new_rep);
          //console.log('id='+new_rep.getId() );
          projet.getQuestion().addReponse( (new_rep.getId() ), new_rep_vocal);
          //console.log(projet.getQuestion());
          addReponseLine(new_rep);


        //  console.log(new_rep_vocal);
          console.log(projet.getQuestion());
          console.log("--------------------");
          console.log(projet.getReponses());
          console.log("--------------------");
          console.log(projet.getQuestion().getReponses());
        }
        else
          alert("Mauvais format de qr Code ! ");
     });
    }
  };


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

//fonction pour Supprimer une réponse du     &&
function deleteReponse(button){
  var k = $('#newNbMinimalBonneReponse').val();
  var id_reponse = $(button).attr('id');
  console.log(k);
  console.log(numReponse);
  numReponse--;
  if (k > numReponse){
  $("#preview").attr("disabled", true);
  console.log("test");}
  projet.removeReponse(id_reponse);
  $("div#" + id_reponse).remove();

  //retour a l'initiale quand toutes les reponses sont suprimées
  nombre_reponse--;
  console.log(nombre_reponse);
  console.log(projet.getQuestion());
  if(nombre_reponse==0)
  {
    txtDragAndDrop.setAttribute("id", "txtDragAndDrop");
    txtDragAndDrop.setAttribute("class", "col-sm-7");
    txtDragAndDrop.setAttribute("style", "text-align: center; margin-top: 15%");
    txtDragAndDrop.innerText = "Déposez vos réponses ici";
    txtZone.appendChild(txtDragAndDrop);
  }

  //Permet de gérer la conuité en suppriant la "bonne" reponse du store
  for(var i = 1; i<numReponse+1; i++){
    if(store.get('reponseId'+i) == id_reponse ){
      deleteStore('reponse'+i);
      deleteStore('data'+i);
      deleteStore('reponseId'+i);
      deleteStore('reponseColor'+i);
    }
  

  }
  document.getElementById('Nbbonne').innerHTML = numReponse;

 

}

//Méthode appliqué au chargement pour récupérer les élément enregistrés
function enregistrement(){

  //nombre de zone texte courant
  if(store.get(`numReponse`))
    numReponse = store.get(`numReponse`);
  else
    store.set(`numReponse`,numReponse);

  if(store.get(`newQuestionText`) )
    $("#newQuestionText").val(store.get(`newQuestionText`));

  if(store.get(`newBonneReponseText`) )
    $("#newBonneReponseText").val(store.get(`newBonneReponseText`));

  if(store.get('newMauvaiseReponseText'))
    $("#newMauvaiseReponseText").val(store.get('newMauvaiseReponseText'));

  if(store.get('newNbMinimalBonneReponse'))
    $('#newNbMinimalBonneReponse').val(store.get('newNbMinimalBonneReponse'));

  //créé une nouvelles question si le nombre de réponse est superieur à 0
  if(numReponse > 0){
    let nouvQuestion = new Question (store.get(`newQuestionText`), store.get(`newBonneReponseText`), store.get('newMauvaiseReponseText'), [], store.get('newNbMinimalBonneReponse'), $("#qrColor").val());
    projet.setQuestion(nouvQuestion);
    //affichage de la zone de question
    $("#dropZone").show();
    //on cache le bouton question
    $("#genererQestion").hide();
  }
  else{
    $("#dropZone").hide();
    $("#play-sound-div").hide();
  }

  //recréation des question
  for(var i = 1; i<numReponse+1; i++){
    if(store.get('reponse'+i)){


      var new_rep = new QRCodeUnique(store.get('reponse'+i),store.get('data'+i), store.get('reponseColor'+i)); // cretation d'une nouvelle reponse
      new_rep.setId(store.get('reponseId'+i));
      projet.addReponse(new_rep);

      projet.getQuestion().addReponse(new_rep.getId(), new_rep.getData());
      addReponseLine(new_rep);

    }
  }
}


//Cette fonction sauvegarde l'image du qrcode dans un div pour le pouvoir generer apres

function saveQRCodeImages(div, qrcode, directoryName) {
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

function saveQRCodeImage() {


  var dir_path = dialog.showOpenDialog({title: 'Sélectionnez un dossier', properties: ['openDirectory']})[0];
  if(dir_path !== undefined){
    var facade = new FacadeController();
    projet.setName($("#newQuestionText").val());

    var dir_path = path.join(dir_path, projet.getName());

    var fs = require('fs');
    if(!fs.existsSync(dir_path)){
      fs.mkdirSync(dir_path);
    }

    //On enregistre la question
    let div = document.createElement('div');
    facade.genererQRCode(div, projet.getQuestion());
    saveQRCodeImages(div, projet.getQuestion(), dir_path);


    //Idem pour les réponses
    $.each(projet.getReponses(), function(id, reponse){
      let div = document.createElement('div');
      facade.genererQRCode(div, reponse);
      saveQRCodeImages(div, reponse, dir_path);
    });
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

function lireReponse(button){
  var id_reponse = $(button).attr('id');
  var text_reponse = $("div#" + id_reponse + " label").text();
  var text_retourVocal = $("div#" + id_reponse + " em").text();

  playTTS(text_reponse + text_retourVocal);
}

//méthode gérant al continuité sur les eones de texte Question, Bonne Reponse, Mauvaise Reponse et nb reponse
function activerSave(text){
  deleteStore(text);

  var newText = $("#"+text).val();
  store.set(text,newText);
}

//methode de suppression dans le store
function deleteStore(del){
  if(store.get(del) )
    store.delete(del);
}

//pour ouvrir la page info.html quand on clique sur le bouton info du haut
$("#infos-questRep").click(function () {
  require('electron').remote.getGlobal('sharedObject').someProperty = 'questRep'
  $("#charger-page").load(path.join(__dirname, "Views/info.html"));
});