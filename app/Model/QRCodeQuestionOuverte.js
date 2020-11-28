
 

class QRCodeQuestionOuverte {
    //Constructeur d'une question question ouverte
    constructor(title, reponse, text_bonne_reponse, text_mauvaise_reponse, color = '#000000') {
      this.qrcode = {
        id: new Date().getTime(),
        name: title,
        type: "ExerciceReconnaissanceVocaleQuestionOuverte",
        data: [reponse],
        color: color,
        text_bonne_reponse: text_bonne_reponse,
        text_mauvaise_reponse: text_mauvaise_reponse
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
    getGoodAnswer() {
      return this.qrcode.text_bonne_reponse;
    }

    getBadAnswer() {
      return this.qrcode.text_mauvaise_reponse;
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
  
    getReponse() {
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
  
  module.exports = {
    QRCodeQuestionOuverte
  };