/**
 * @Date : 2020-11-10
 */
/**
 * DELÉPINE Pierre-yVes
 */

const {
    MdFiveConverter
} = require(`${root}/Controller/MDFiveConverter`);

/**
 *  Classe permettant de créer un projet de serious game
 */

class ProjetSeriousGame {
    //Constructeur d'un projet
    constructor(nom = "No_Name", questionsQr = [], questionsReco = []) {
        //Génération de l'id unique 
        var dataString = nom;

        for (var i = 0; i < questionsQr.length; i++) {
            dataString += questionsQr[i];
        }
        for (var i = 0; i < questionsReco.length; i++) {
            dataString += questionsReco[i];
        }

        var md5Value = MDFiveConverter.convert(dataString);

        this.projet = {
            id: md5Value,
            nom: nom,
            questionsQrCode: questionsQr,
            questionsRecoVocale: questionsReco
        };
    }

    setQuestion(question) {
        this.projet.question = question;
    }

    addQuestionQr(question) {
        this.projet.questionsQrCode.push(question);
    }

    addQuestionReco(question) {
        this.projet.questionsRecoVocale.push(question);
    }

    setName(nom) {
        this.projet.nom = nom;
    }

    getProject() {
        return this.projet;
    }

    getName() {
        return this.projet.nom;
    }

    getQuestion() {
        return this.projet.question;
    }

    getQuestionsQr() {
        return this.projet.questionsQrCode;
    }

    // retoune le QRCodeQuestion de la question posédant cet id d'énigme sinon renvoie null
    getQuestionQrFromId(id){
        for(let i = 0 ; i < this.projet.questionsQrCode.length; i++){
            if(this.projet.questionsQrCode[i].idQR == id){
                return this.projet.questionsQrCode[i];
            }
        }
        return null;
    }

    // Retourne un tableau de toutes les réponses de toutes les questions QRCodes sous forme de ReponseQuestionsQR
    getReponsesQrCode() {
        let reponses = [];
        this.projet.questionsQrCode.forEach(function (question){
            for (let i = 0; i < question.reponsesQR.length; i++) {
                reponses.push(new ReponseQuestionQR(question.reponsesQR[i], (question.bonneReponseQR == i + 1) ? "true" : "false"));
            }
        });
        return reponses;
    }

    // Retourne un tableau des questions à QRCode formaté pour le json du qrcodeSeriousGame
    getQuestionsQrForJson() {
        let questions = [];

        this.projet.questionsQrCode.forEach(function (element) {
            let reponses = [];
            for (let i = 0; i < element.reponsesQR.length; i++) {
                reponses.push([element.reponsesQR[i], (element.bonneReponseQR == i + 1) ? "true" : "false"]);
            }
            questions.push([element.idQR.toString(), element.questionQR, reponses]);
        });
        return questions;
    }

    getQuestionsReco() {
        return this.projet.questionsRecoVocale;
    }

    // Retourne un tableau des questions à reconnaissance vocale formaté pour le json du qrcodeSeriousGame
    getQuestionsRecoForJson() {
        let questions = [];
        this.projet.questionsRecoVocale.forEach(function (element) {
            questions.push([element.idRec.toString(), element.questionRec, element.reponseRec]);
        });
        return questions;
    }

    // retoune le RecVocaleQuestion de la question posédant cet id d'énigme sinon renvoie null
    getQuestionRecoFromId(id){
        for(let i = 0 ; i < this.projet.questionsRecoVocale.length; i++){
            if(this.projet.questionsRecoVocale[i].idRec == id){
                return this.projet.questionsRecoVocale[i];
            }
        }
        return null;
    }

    getDataString() {
        return JSON.stringify(this.projet);
    }
}
/*
 * Classe qui permet de créer le json du Serious Game, sera enrengistré dans ProjetSeriousGame.question
 */
class QRCodeSeriousGame {
    //Constructeur du QRcode seriousGame
    constructor(title, textIntro, textFin, enigmesTxtID = [], questionQr = [], questionReco = [], color = '#000000') {
        this.qrcode = {
            id: new Date().getTime(),
            name: title,
            type: "SeriousGameScenario",
            introduction: textIntro,
            fin: textFin,
            enigmes: enigmesTxtID,
            questionsRecoVocale: questionReco,
            questionsQrCode: questionQr,
            color: color
        };
    }

    getId() {
        return this.qrcode.id;
    }

    getType() {
        return this.qrcode.type;
    }

    getIntro() {
        return this.qrcode.introduction;
    }

    getEnd() {
        return this.qrcode.fin;
    }

    getQuestionQRCode() {
        return this.qrcode.questionsQrCode;
    }

    getQuestionRecoVocale() {
        return this.qrcode.questionsRecoVocale;
    }

    getEnigmes(){
        return this.qrcode.enigmes;
    }

    getDataString() {
        return JSON.stringify(this.qrcode);
    }

    setColor(color) {
        this.qrcode.color = color;
    }

    getColor() {
        return this.qrcode.color;
    }

    getName() {
        return this.qrcode.name;
    }
}

/*
 * Classe permettant de créer une question QR
 */
class QRCodeQuestion {
    constructor(textQuestion, tabReponse = [], estBonneReponse, idEnigme) {
        this.questionQR = textQuestion;
        this.reponsesQR = tabReponse;
        this.bonneReponseQR = estBonneReponse;
        this.idQR = idEnigme;
    }

    setQuestion(question){
        this.questionQR = question;
    }

    setReponses(reponses = []){
        this.reponsesQR = reponses;
    }

    setBonneReponseQR(reponse){
        this.bonneReponseQR=reponse;
    }

    setId(id){
        this.idQR = id;
    }

    getQuestion(){
        return this.questionQR;
    }

    getReponses(){
        return this.reponsesQR;
    }

    getBonneReponse(){
        return this.bonneReponseQR;
    }
    getId(){
        return this.idQR ;
    }
}

/*
 * Classe permettant de créer une qrRecoVocale
 */
class RecVocaleQuestion {
    constructor(textQuestion, textReponse, idEnigme) {
        this.questionRec = textQuestion;
        this.reponseRec = textReponse;
        this.idRec = idEnigme;
    }

    setQuestion(question){
        this.questionRec = question;
    }

    setReponse(reponse){
        this.reponseRec = reponse;
    }

    setId(id){
        this.idRec = id;
    }

    getQuestion(){
        return this.questionRec ;
    }

    getReponse(){
        return this.reponseRec ;
    }

    getId(){
        return this.idRec ;
    }

}
/*
 * Classe Représentant une réponse d'un questionQR
 */
class ReponseQuestionQR {
    constructor(reponse_, isGoodAnswer_, color_ = '#000000') {
        this.qrcode = {
            id: new Date().getTime(),
            name: reponse_,
            type: "ReponseSeriousGame",
            reponse: reponse_,
            isGoodAnswer: isGoodAnswer_,
            color: color_
        };

    }

    getId() {
        return this.qrcode.id;
    }

    getType() {
        return this.qrcode.type;
    }

    getDataString() {
        return JSON.stringify(this.qrcode);
    }

    setColor(color){
        this.qrcode.color = color;
    }

    getColor() {
        return this.qrcode.color;
    }

    getName() {
        return this.qrcode.reponse;
    }
}

module.exports = {
    ProjetSeriousGame,
    QRCodeSeriousGame,
    QRCodeQuestion,
    RecVocaleQuestion
};