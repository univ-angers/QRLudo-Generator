/**
 * @Date:   2018-11-23T11:47:00+01:00
 * @Last modified by:   alassane
 * @Last modified time: 2018-12-04T14:54:38+01:00
 */


/**
 * HARBOUL Abdessabour
 * 2018
 **/

/*
 *Classe permettant de creer un projet de questions_reponses
 */
class Projet {
  //Constructeur d'un Projet
  constructor(nom = "No_Name", questions = [], reponses = []) {
    this.projet = {
      id: new Date().getTime(),
      nom: nom,
      questions: questions,
      reponses: reponses
    };
  }

  addQuestion(question) {
    this.projet.questions.push(question)
  }

  addReponse(reponse) {
    this.projet.reponses.push(reponse)
  }

  setName(nom) {
    return this.projet.nom = nom;
  }

  getName() {
    return this.projet.nom;
  }

  getQuestions() {
    return this.projet.questions;
  }

  getReponses() {
    return this.projet.reponses;
  }

  getQuestionByIndex(indice) {
    return this.projet.questions[indice];
  }

  getReponsesByIndex(indice) {
    return this.projet.reponses[indice];
  }

  getQuestionById(id) {
    for (let q of this.projet.questions) {
      if (q.getId() == id) {
        return q;
      }
    }
    return null;
  }

  getReponsesById(id) {
    for (let q of this.projet.reponses) {
      if (q.getId() == id) {
        return q;
      }
    }
    return null;
  }

  getDataString() {
    return JSON.stringify(this.projet);
  }
}

/*
 *Classe permettant de creer une question
 */
class Question {
  //Constructeur d'une Question
  constructor(title, reponsesUIDs = [], color = '#00000') {
    this.qrcode = {
      id: new Date().getTime(),
      title: title,
      reponsesUIDs: reponsesUIDs,
      type: "question",
      color: color
    };
  }

  setId(id){
    this.qrcode.id = id;
  }

  getName() {
    return this.qrcode.id;
  }

  getId() {
    return this.qrcode.id;
  }

  getTitle() {
    return this.qrcode.title;
  }

  getReponsesUIDs() {
    return this.qrcode.reponsesUIDs;
  }

  getReponseUIDByIndex(indice) {
    return this.qrcode.reponsesUIDs[indice];
  }

  getColor() {
    this.qrcode.color;
  }

  addReponse(reponseUid) {
    this.qrcode.reponsesUIDs.push(reponseUid);
  }

  getDataString() {
    return JSON.stringify(this.qrcode);
  }
}

/*
 *Classe permettant de creer une reponse
 */
class Reponse {
  //Constructeur d'une Reponse
  constructor(title, color = '#00000') {
    this.qrcode = {
      id: new Date().getTime(),
      title: title,
      type: "reponse",
      color: color
    };
  }

  setId(id){
    this.qrcode.id = id;
  }

  getName() {
    return this.qrcode.id;
  }

  getId() {
    return this.qrcode.id;
  }

  getTitle() {
    return this.qrcode.title;
  }

  getColor() {
    this.qrcode.color;
  }

  getDataString() {
    return JSON.stringify(this.qrcode);
  }
}


/*
 * Classe permettant à la vue d'interagir avec le controller.
 * La vue instancie cette classe une seule fois à son initialisation et fait systématiquement appel à cette instance quand elle a besoin d'un traitement du controller.
 */
class QuesRepController {

  constructor() {}


  //Ajouter une nouvelle valeur a la liste deroulante
  addNewValueToComboBox(new_val, selectid, modalIdToClose, array) {
    if (new_val === "") return false; // si le champ est vide on sort
    //sortir de la fonction si le champ entré existe deja
    let existe = false;
    $('select#' + selectid).find('option').each(function() {
      if ($(this).text() === new_val) {
        existe = true;
        return;
      }
    });
    if (existe) return false;
    //Ajouter a la liste deroulante la nouvelle valeur
    let nouvques = new Question(new_val);
    array.push(nouvques);
    $('#' + selectid).append($('<option>', {
      val: nouvques.getId(),
      text: new_val
    }));
    //fermer la pop-up
    $("#" + selectid).val(nouvques.getId()).change();
    $("#" + modalIdToClose + " .close").click();
    return true;
  }

  //Ajouter une nouvelle valeur a un tableau
  addNewValueToArray(new_val, my_array, modalIdToClose) {
    if (new_val === "") return false; // si le champ est vide on sort
    //sortir de la fonction si le champ entré existe deja
    let existe = false;
    $.each(my_array, function(i, val) {
      if (val.getTitle() === new_val) {
        existe = true;
        return;
      }
    });
    if (existe) return false;
    //Ajouter au tableau la nouvelle valeur
    my_array.push(new Reponse(new_val));

    //fermer la pop-up
    $("#" + modalIdToClose + " .close").click();
    return true;
  }

  //Renvoie un Array des valeur d'une liste deroulante
  selectOptionsValuesAsArray(selectId) {
    let resArray = [];
    $('select#' + selectId).find('option').each(function() {
      resArray.push($(this).val());
    });
    return resArray;
  }

  clearModalForm(modal_id) {
    $('#' + modal_id).find('form')[0].reset();
  }


}

module.exports = {
  Projet,
  Reponse,
  Question,
  QuesRepController
};
