/**
* HARBOUL Abdessabour
* 2018
**/

/*
*Classe permettant de creer un projet de questions
*/
class Projet {
  //Constructeur d'un Projet
  constructor(nom, questions, reponses) {
    this.id = new Date().getTime();
    this.nom = nom;
    this.questions = questions || [];
    this.reponses = reponses || [];
  }
}

/*
*Classe permettant de creer une question
*/
class Question {
  //Constructeur d'une Question
  constructor(title, reponsesUIDs) {
    this.id = new Date().getTime();
    this.title = title;
    this.reponsesUIDs = reponsesUIDs || [];
  }

  addReponse(reponseUid) {
    this.reponsesUIDs[this.reponsesUIDs.length] = reponseUid;
  }
};

/*
*Classe permettant de creer une reponse
*/
class Reponse {
  //Constructeur d'une Reponse
  constructor(title) {
    this.id = new Date().getTime();
    this.title = title;
  }
}
