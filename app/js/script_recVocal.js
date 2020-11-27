

// Ajouter une nouvelle Reponse une fois qu'on va clicker sur la button Ajouterreponse
/*var counter = 0

var alphaTab = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P"]


$("#ajouterQuestion").click(function(){
  if(counter < 15){
      var reponse = document.createElement('div');
      reponse.innerHTML = `<div class="form-row">
                            <div class="form-group col-md-2">
                                  <label class="control-label">`+alphaTab[counter]+`</label>
                                </div>
                         <div class="form-group col-md-2">
                                   <input class="form-check-input" type="checkbox" name="gridRadios" id="gridCheck`+alphaTab[counter]+`" style="width:70px;" value="option1" >
                                      <label class="form-check-label" for="gridCheck1">
                            </div>
                          <div class="form-group col-md-5">
                                 <input type="text" class="form-control col-sm-6" id="projectId`+alphaTab[counter]+`" rows="2" name="nomprojet"
                                placeholder="Reponse" onkeyup="activerSave();" />
                           </div>
                            <div class="form-group col-md-3">
                                <button id="deleteType`+alphaTab[counter]+`" type="button"
                                    class="btn btn-outline-success align-self-center" onclick=$(this).parent().parent("div").remove();>
                                    <i class="fa fa-trash"></i></button>
                                    </div>
                            </div>`;

      let container = $("#repContainer");
      container.append(reponse);
      counter ++ 
  }

})
*/



var projet = new Projet();

var compteurReponse = 1;
//console.log(localStorage.getItem("k"));
var k = localStorage.getItem("k");
console.log(k);

//console.log(compteurReponse);
$(document).ready(function() {

  //méthode gérant la continuité
  enregistrement();

  // Ajouter une nouvelle Reponse une fois qu'on va clicker sur la button Ajouterreponse
  $("#ajouterQuestion").click(function () {
    ajouterNouvelleReponse();

  })
});

//function Ajouter une nouvelle Reponse avec arguments pour la persistance

/*function ajouterNouvelleReponse(reponse){
  compteurReponse++;
    if (compteurReponse < 30) {
      type = "Rreponse";
      let reponse = document.createElement('div');
      reponse.innerHTML = `<div class="form-row" id="divQuestion` + compteurReponse + `">
                              <div class="form-group col-md-3">
                                    <label class="control-label">Réponse `+ compteurReponse + ` :</label>
                                  </div>
                          <div class="form-group col-md-2">
                                    <input class="form-check-input" type="checkbox" name="gridRadios" id="gridCheck`+ compteurReponse + `" style="width:70px;" value="option"` + compteurReponse + ` >
                                        <label class="form-check-label" for="gridCheck`+ compteurReponse + `">
                              </div>
                            <div class="form-group col-md-6">
                                  <input type="text" class="form-control col-sm-6" value="`+reponse.getTextQuestion()+`" id="reponse`+ compteurReponse + `" rows="2" name="nomprojet"
                                  placeholder="Réponse" />
                            </div>
                              <div class="form-group col-md-1">
                                  <button id="deleteQRCode`+ compteurReponse + `" type="button"
                                      class="btn btn-outline-success align-self-center" onclick="supprLigne(` + compteurReponse + ",\'" + type + `\');">
                                      <i class="fa fa-trash"></i></button>
                                      </div>
                              </div>`;

      let container = $("#repContainer");
      container.append(reponse);
      localStorage.setItem("k",compteurReponse);

      //localStorage.setItem(`reponse`+compteurReponse,)

      
    }

}*/

function ajouterNouvelleReponse(){
  compteurReponse++;
    if (compteurReponse < 30) {
      type = "Rreponse";
      let reponse = document.createElement('div');
      reponse.innerHTML = `<div class="form-row" id="divQuestion` + compteurReponse + `">
                              <div class="form-group col-md-3">
                                    <label class="control-label">Réponse `+ compteurReponse + ` :</label>
                                  </div>
                          <div class="form-group col-md-2">
                                    <input class="form-check-input" type="checkbox" name="gridRadios" id="gridCheck`+ compteurReponse + `" style="width:70px;" value="option"` + compteurReponse + ` >
                                        <label class="form-check-label" for="gridCheck`+ compteurReponse + `">
                              </div>
                            <div class="form-group col-md-6">
                                  <input type="text" class="form-control col-sm-6" id="reponse`+ compteurReponse + `" rows="2" name="nomprojet"
                                  placeholder="Réponse" />
                            </div>
                              <div class="form-group col-md-1">
                                  <button id="deleteQRCode`+ compteurReponse + `" type="button"
                                      class="btn btn-outline-success align-self-center" onclick="supprLigne(` + compteurReponse + ",\'" + type + `\');">
                                      <i class="fa fa-trash"></i></button>
                                      </div>
                              </div>`;

      let container = $("#repContainer");
      container.append(reponse);
      localStorage.setItem("k",compteurReponse);

      //localStorage.setItem(`reponse`+compteurReponse,)

      
    }

}
//pour les nouvelles reponse 
/*class ReponseVocale {
    constructor(numeroEnigme, estBonneReponse, textQuestion) {
        this.numeroEnigme = numeroEnigme;
        this.estBonneReponse = estBonneReponse;
        this.textQuestion = textQuestion;
    }

    getNumeroEnigme() {
      return this.numeroEnigme;
    }

    getEstBonneReponse() {
      return this.estBonneReponse;
    }

    getTextQuestion() {
      return this.textQuestion;
    }
  }*/

//Pour supprimer une énigme ou bien une réponse dans cette cas c'est reponse dans recvocal
function supprLigne(idLigne, element) {
  if (element == "Rreponse") {
    compteurReponse--;
    localStorage.setItem("k",compteurReponse);
    $("#divQuestion" + idLigne).on('click', function() {
      $(this).remove();
      for(let cpt = idLigne; cpt <= compteurReponse; cpt++) {
        let id = cpt+1;
        let div = $("#divQuestion" + id)[0].getElementsByTagName("div");
        div[0].getElementsByTagName("label")[0].innerHTML = "Réponse " + cpt + " :";
        div[1].getElementsByTagName("input")[0].id = "gridCheck" + cpt;
        div[1].getElementsByTagName("label")[0].for = "gridCheck" + cpt;
        div[2].getElementsByTagName("input")[0].id = "projectId" + cpt;
        div[3].getElementsByTagName("button")[0].id = "deleteQRCode" + cpt;
        div[3].getElementsByTagName("button")[0].setAttribute("onclick", "supprLigne(" + cpt + ",\'" + element +"\')");
        $("#divQuestion" + id)[0].id = "divQuestion" + cpt;
      }
    });
  }
}

$(document).ready(function() {
  $('div.info-content').css('display', 'none');

  $("a.nav-link").click(e => {
    e.preventDefault();
    let element = e.target;
    let tab = $(element).attr('href');

    $('a').attr('class', 'nav-item nav-link');
    $('div.tab-pane').attr('class', 'tab-pane');

    $(element).addClass('active');
    $(tab).addClass('active');
  });

  $('.tab-content').find('a').click(e => {
    let href = $(e.target).attr('href');
    let display = $(href).css('display');

    if (display == 'block')
      $(href).fadeOut();
    else
      $(href).fadeIn();
  });

});

//script 
$("#emptyFields").click(function(){
    viderChamps();
  })


/*function myFunction() {
  document.getElementById("formulaireQCM").reset();
}*/

/*function viderZone(){
  controllerMultiple = new ControllerMultiple();
  $('#Question').val('');
  $('#Bonnereponse').val('');
  $('#MessageBonnereponse').val('');
  $('#MessageMauvaisereponse').val('');
  console.log("zaki");

}*/

function viderChamps(){
  $('#Question').val('');
  $('#Bonnereponse').val('');
  $('#MessageBonnereponse').val('');
  $('#MessageMauvaisereponse').val('');
  $('#reponseinitiale').val('');
  $('#QuestionQCM').val('');
  if($("#checkboxQR").is(':checked') == true){
    console.log("couco");
    $('#checkboxQR').prop('checked', false);
    console.log("dd")
  }
  $('#gridCheck1').prop('checked', false);
  $('#MessageMauvaisereponseQCM').val('');
  $('#MessageBonnereponseQCM').val('');
  //$("#repContainer").empty();
  $("#repContainer").hide();

  deleteStore(`Question`);

  deleteStore(`Bonnereponse`);

  deleteStore('MessageBonnereponse');

  deleteStore('MessageMauvaisereponse');

  deleteStore(`reponseinitiale`);

  deleteStore(`QuestionQCM`);

  deleteStore(`MessageMauvaisereponseQCM`);

  deleteStore('MessageBonnereponseQCM');
  localStorage.setItem("k",1);

   compteurReponse = 1; 


}


function enregistrement(){

  if(store.get(`Question`))
    $("#Question").val(store.get(`Question`));
  
//Question = store.get(`Question`);

  if(store.get(`Bonnereponse`) )
    $("#Bonnereponse").val(store.get(`Bonnereponse`));

  if(store.get(`MessageBonnereponse`) )
    $("#MessageBonnereponse").val(store.get(`MessageBonnereponse`));

  if(store.get('MessageMauvaisereponse'))
    $("#MessageMauvaisereponse").val(store.get('MessageMauvaisereponse'));

  if(store.get('QuestionQCM'))
    $("#QuestionQCM").val(store.get('QuestionQCM'));

  if(store.get('MessageMauvaisereponseQCM'))
    $("#MessageMauvaisereponseQCM").val(store.get('MessageMauvaisereponseQCM'));

  if(store.get('MessageBonnereponseQCM'))
    $("#MessageBonnereponseQCM").val(store.get('MessageBonnereponseQCM'));

  if(store.get('reponseinitiale'))
    $("#reponseinitiale").val(store.get('reponseinitiale'));

   for(var i = 1; i<k; i++){
      /*var p;
      if (store.get('reponse'+i)) {
        p = $("#reponse"+i).val(store.get('reponse'+i));
      }
      var ma_reponse = new ReponseVocale(p[0], p[1], p[2])
      console.log('test1');*/
      ajouterNouvelleReponse(/*ma_reponse*/);

    }
  }






function activerSave(text){
  deleteStore(text);

  var newText = $("#"+text).val();
  store.set(text,newText);
}

function deleteStore(del){
  if(store.get(del) )
    store.delete(del);
}

