/*
 * @Author: SALIM Youssef
 * @Date:   2018-Oct
 */
//ce fichier regroupe toutes les fonctions et scripts en commun avec les autres les pages
$().ready(function() {

  //pour chaque item dans le menu on charge une page html
  $("#unique-html").click(function() {
    $("#charger-page").load(path.join(__dirname, "Views/unique.html"), loadDefaultColor);
  });
  $("#multiple-html").click(function() {
    $("#charger-page").load(path.join(__dirname, "Views/multiple.html"), loadDefaultColor);
  });
  $("#quesRep-html").click(function() {
    $("#charger-page").load(path.join(__dirname, "Views/quesRep.html"), loadDefaultColor);
  });
  $("#rec-vocale-html").click(function() {
    $("#charger-page").load(path.join(__dirname, "Views/recVocal.html"), loadDefaultColor);
  });
  $("#serious-html").click(function() {
    $("#charger-page").load(path.join(__dirname, "Views/serious-game.html"), loadDefaultColor); 
  });
  $("#qcm-html").click(function() {
    $("#charger-page").load(path.join(__dirname, "Views/qcm.html"), loadDefaultColor);
  });
  $("#parametres").click(function(){
    $("#charger-page").load(path.join(__dirname, "Views/parametres.html"));
  });
  $("#infos").click(function(){
    $("#charger-page").load(path.join(__dirname, "Views/info.html"));
  });
  


  //l'element du menu courant -> class="... active"
  $('#menu li').click(function(e) {
    e.preventDefault();
    $('li').removeClass('active');
    $(this).addClass('active');
  });

  //sert à reduire le menu ou l'afficher d'une maniere responsive
  $('#sidebarCollapse').on('click', function() {
    $('#sidebar').toggleClass('active');
  });

});

function loadDefaultColor(){
  var settings = require("electron-settings");

  if (settings.has("defaultColor")) {
    $("#qrColor").val(settings.get("defaultColor"));
  }
}

//supprimer les messages d'infos en haut de page
function initMessages() {
  var divMsg = document.getElementById('messages');
  if (divMsg.firstChild)
    divMsg.removeChild(divMsg.firstChild);
}


//message a afficher lors d'un : sauvegarde | Champ vide | Export ...
//type: success | danger | warning
function messageInfos(message, type) {
  initMessages();
  var msg = document.createElement('div');
  msg.innerHTML = message +
    "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>";
  msg.setAttribute("class", "alert alert-" + type + " fade show");
  msg.setAttribute("role", "alert");
  document.getElementById('messages').appendChild(msg);

}

//creer+sauvegarder le fichier json correspond à un qrcode qui depasse la taille 500
function sauvegarderFichierJsonUnique(nomFichier, path) {

  path += nomFichier + ".json";
  fs.writeFile(path, JSON.stringify(nomFichier), (err) => {
    if (err) {
      console.error(err);
      return;
    };
    messageInfos("votre fichier json est bien sauvegardé", "success");
  });
}
