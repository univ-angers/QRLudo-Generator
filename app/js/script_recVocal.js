const { ProjetExoVocal, ReponseExoVocal, QuestionExoVocal } = require(`${root}/Model/QRCodeExerciceVocal.js`);

var projet;

function genererJson(){
  var questionText = $("#projectId").val();
  var isLetter = $("#label2");
  var messageBonneReponse = $("#bonneReponse");
  var messageMauvaiseReponse = $("#mauvaiseReponse");

  var reponses = [];
  $("#repContainer .form-row").each(function(){
    var controlLabel = $("this.control-label").val();
    var isGoodAnswer = $(".isGoodAnswer").val();
    var responseText = $(".textReponse").val();
    var reponse = new ReponseExoVocal(controlLabel, isGoodAnswer, responseText);
    reponses.push(reponse);
  });

var question = new QuestionExoVocal(questionText, reponses.length, reponses, isLetter, messageBonneReponse, messageMauvaiseReponse);
var reponsesText;
var counter = 0;
reponses.forEach(element => {
  reponsesText += reponsesText + "{" + element.getId() +","+element.getName()+","+element.getIsAnswer()+","+element.getDataString()+"}";
  counter ++;
  if(reponses.length < counter){
    reponsesText += ","
  }
});
var json  = "{"+question.getId()+","+question.getName()+",["+reponsesText+"],"+messageBonneReponse+","+messageMauvaiseReponse+"}";
console.log(json)

projet = new ProjetExoVocal("ExoVocal", question, reponses);

console.log(projet);


}
// Ajouter une nouvelle Reponse une fois qu'on va clicker sur la button Ajouterreponse
var counter = 0

var alphaTab = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P"]


$("#ajouterQuestion").click(function(){
  if(counter < 15){
      var reponse = document.createElement('div');
      reponse.innerHTML = `<div class="form-row">
                            <div class="form-group col-md-2">
                                  <label class="control-label">`+alphaTab[counter]+`</label>
                                </div>
                         <div class="form-group col-md-2">
                                   <input class="form-check-input isGoodAnswer" type="checkbox" name="gridRadios" id="gridCheck`+alphaTab[counter]+`" style="width:70px;" value="option1" >
                                      <label class="form-check-label" for="gridCheck1">
                            </div>
                          <div class="form-group col-md-5">
                                 <input type="text" class="form-control col-sm-6 textReponse" id="projectId`+alphaTab[counter]+`" rows="2" name="nomprojet"
                                placeholder="Reponse" />
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
/*
$(function() {
  var $crossButton = $('#deleteType'),
    $content = $("#form-row");

  $content.on("click", ".deleteType", function() {
    if ($(this).is("#deleteType")) return false;
    var $cross = $(this);
    $(this).next().slideUp(400, function() {
      $(this).remove();
      $deleteType.remove();
    });
  });

})*/


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

  //*********************************************************************//




});