
$("#deleteType1").prop("disabled",true);
$("#deleteType2").prop("disabled",true);
$("#deleteType3").prop("disabled",true);

function activerSave(){
    console.log("Activer Save");
}

function deleteGame(){
    console.log("Delete Game");
}

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

  $("#scanQR1").click(function(){
    $("#recVocale1").prop("disabled",true);
    $("#deleteType1").prop("disabled",false);
  });

  $("#recVocale1").click(function(){
    $("#scanQR1").prop("disabled",true);
    $("#deleteType1").prop("disabled",false);
  });

  $("#deleteType1").click(function(){
    $("#scanQR1").prop("disabled",false);
    $("#recVocale1").prop("disabled",false);
    $("#deleteType1").prop("disabled",true);
  });

  $("#scanQR2").click(function(){
    $("#recVocale2").prop("disabled",true);
    $("#deleteType2").prop("disabled",false);
  });

  $("#recVocale2").click(function(){
    $("#scanQR2").prop("disabled",true);
    $("#deleteType2").prop("disabled",false);
  });

  $("#deleteType2").click(function(){
    $("#scanQR2").prop("disabled",false);
    $("#recVocale2").prop("disabled",false);
    $("#deleteType2").prop("disabled",true);
  });

  $("#scanQR3").click(function(){
    $("#recVocale3").prop("disabled",true);
    $("#deleteType3").prop("disabled",false);
  });

  $("#recVocale3").click(function(){
    $("#scanQR3").prop("disabled",true);
    $("#deleteType3").prop("disabled",false);
  });

  $("#deleteType3").click(function(){
    $("#scanQR3").prop("disabled",false);
    $("#recVocale3").prop("disabled",false);
    $("#deleteType3").prop("disabled",true);
  });