 

class QRCodeQCM {
    //Constructeur d'une Question
    constructor(title, reponses = [], reponseParIdentifiant, text_bonne_reponse, text_mauvaise_reponse, color = '#000000') {
      this.qrcode = {
        id: new Date().getTime(),
        name: title,
        type: "ExerciceReconnaissanceVocaleQCM",
        data: reponses,
        lettreReponseVocale : reponseParIdentifiant,
        text_bonne_reponse: text_bonne_reponse,
        m_text_mauvaise_rep: text_mauvaise_reponse,
        color: color
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

    getData() {
      return this.qrcode.data;
    }

    getGoodAnswer() {
      return this.qrcode.text_bonne_reponse;
    }

    getBadAnswer() {
      return this.qrcode.m_text_mauvaise_rep;
    }

    getLettreReponseVocale() {
      return this.qrcode.lettreReponseVocale
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
  
    getDataString() {
      return JSON.stringify(this.qrcode);
    }
  }
  

  /*
 * Classe permettant de créer une réponse QCM
 */
  class ReponseVocale {
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
  }

  module.exports = {
    QRCodeQCM,
    ReponseVocale
  };