/**
 * @Date:   2018-11-23T11:47:00+01:00
 * @Last modified by:   alassane
 * @Last modified time: 2018-12-04T21:01:33+01:00
 */

 const {
   MdFiveConverter
 } = require(`${root}/Controller/MDFiveConverter`);

/*
 *Classe permettant de creer un projet de QCM
 */
class ProjetQCM {
  //Constructeur d'un Projet
  constructor(nom = "No_Name", question = [], reponses = []) {
    //Génération de l'id unique
    var dataString =  nom;
    for (var i = 0; i < question.length; i++) {
      dataString += question[i];
    }
    for (var i = 0; i < reponses.length; i++) {
      dataString += reponses[i];
    }

    var md5Value = MDFiveConverter.convert(dataString);

    this.projet = {
      id: md5Value,
      nom: nom,
      question: question,
      reponses: reponses
    };
  }

  setQuestion(question) {
    this.projet.question = question;
  }

  addReponse(reponse) {
    this.projet.reponses.push(reponse);
  }

  removeReponse(reponseId){
    //On supprime la reponse du projet
    for(let reponse of this.projet.reponses){
      if(reponse.qrcode.id == reponseId){
        var index = this.projet.reponses.indexOf(reponse);
        this.projet.reponses.splice(index, 1);
      }
    }

    //On supprime aussi la reponse dans la question
    if(this.projet.question != null) {
      this.projet.question.removeReponse(reponseId);
    }
  }

  removeQuestion(){
    //On supprime tout les reponses de la question
    for(let reponse of this.projet.question.qrcode.data) {
      this.projet.question.removeReponse(reponse.id);
    }

    //On supprime la question et les reponses du projet
    this.projet.reponses = [];
    this.projet.question = null;
  }

  setName(nom) {
    this.projet.nom = nom;
  }

  getName() {
    return this.projet.nom;
  }

  getQuestion() {
    return this.projet.question;
  }

  getReponses() {
    return this.projet.reponses;
  }

  getReponsesByIndex(indice) {
    return this.projet.reponses[indice];
  }

  getReponseById(id) {
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
class QuestionQCM {
  //Constructeur d'une Question
  constructor(title, nombreReponse, reponsesUIDs = [], color = '#000000') {
    this.qrcode = {
      id: new Date().getTime(),
      name: title,
      nbReponse: nombreReponse,
      data: reponsesUIDs,
      type: "questionQCM",
      color: color,
      text: "",
      text_bonne_reponse: "Bonne réponse",
      text_mauvaise_reponse: "Mauvaise réponse"
    };
  }

  setId(id) {
    this.qrcode.id = id;
  }

  getId() {
    return this.qrcode.id;
  }

  getName() {
    return this.qrcode.name;
  }

  setName(name){
    this.qrcode.name = name;
  }

  getText(){
    return this.qrcode.text;
  }

  setText(){
    this.qrcode.text = this.qrcode.name;

    for(let i=0; i<this.qrcode.data.length; ++i) {
      this.qrcode.text += " réponse " + (i+1) + " " + this.qrcode.data[i].message + " ";
    }
  }

  getReponses() {
    return this.qrcode.data;
  }

  getColor() {
    return this.qrcode.color;
  }

  setColor(color){
    this.qrcode.color = color;
  }

  getType(){
    return this.qrcode.type;
  }

  getReponseUIDByIndex(indice) {
    return this.qrcode.data[indice];
  }

  getReponseById(reponseUid){
    for(let rep of this.qrcode.data){
      if(rep.id == reponseUid){
        return rep;
      }
    }
    return null;
  }

  addReponse(reponseUid, message) {
    this.qrcode.data.push({"id": reponseUid, "message":message});

    this.setText();
  }

  removeReponse(reponseUid){
    for(let rep of this.qrcode.data){
      if(rep.id == reponseUid){
        var index = this.qrcode.data.indexOf(rep);
        this.qrcode.data.splice(index, 1);
      }
    }

    this.setText();
  }

  getDataString() {
    return JSON.stringify(this.qrcode);
  }
}

/*
 *Classe permettant de creer une reponse
 */
class ReponseQCM {
  //Constructeur d'une Reponse
  constructor(name, isAnswer, color = '#000000') {
    this.qrcode = {
      id: new Date().getTime(),
      name: name,
      data: [],
      type: "reponseQCM",
      color: color,
      isAnswer: isAnswer
    };
  }

  setId(id) {
    this.qrcode.id = id;
  }

  getId() {
    return this.qrcode.id;
  }

  getName() {
    return this.qrcode.name;
  }

  getColor() {
    return this.qrcode.color;
  }

  getIsAnswer() {
      return this.qrcode.isAnswer;
  }

  setColor(color){
    this.qrcode.color = color;
  }

  getType(){
    return this.qrcode.type;
  }

  getDataString() {
    return JSON.stringify(this.qrcode);
  }
}

module.exports = {
  ProjetQCM,
  ReponseQCM,
  QuestionQCM
};
