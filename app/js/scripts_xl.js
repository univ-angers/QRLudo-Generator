
/*
 * @Author: SALIM Youssef
 * @Date:   2018-Nov
 */

 $().ready(function() {

     // desactiver les boutons s'il y a rien à lire ou generer
     $('#saveQRCode,#preview, #annuler, #ajouterTexte, #showAudio, #showJson').attr('disabled', true);


     //debut Preview
         // trigger preview qrcode action
         $('#preview').click(e => {

           //enlever les messages en haut de page
           initMessages();

    let inputArray = $('input, textarea');
      let qrColor = $('#qrColor').val();
      let qrName = $('#qrName').val();
      let qrData = [];

             for (data of $('.qrData')) {

               //le cas d'un fichier audio
               if(data.name == 'AudioName'){
                 let dataAudio = {
                               type: 'music',
                               url: 'https://drive.google.com/uc?export=download&id='+data.id,
                               name: data.value
                             }

                 let jsonAudio = JSON.stringify(dataAudio);
                 qrData.push(JSON.parse(jsonAudio));
               }else if(data.name == 'JsonName'){ //le cas d'un fichier json
                 let dataJson = {
                               type: 'json',
                               url: 'https://drive.google.com/uc?export=download&id='+data.id,
                               name: data.value
                             }

                 let json = JSON.stringify(dataJson);
                 qrData.push(JSON.parse(json));
               }
               else
                 qrData.push($(data).val());

             }

             qrType = $('#typeQRCode').val();

             // Generate in a div, the qrcode image for qrcode object
             let div = $('#qrView')[0];

      $('#annuler').attr('disabled', false);
  });
  //Fin Preview



     //debut reinitialiser
       //btn reinitialiser l'affichage
       $('#annuler').click(function(){

         document.getElementById('myFormActive').reset();

         //initialiser l'affichage de messages en haut de page
         initMessages();

         //supprimer l'image QR
         var divImgQr = document.getElementById('qrView');
         //tester si le QR existe
         if (divImgQr.hasChildNodes()) {
           divImgQr.removeChild(divImgQr.firstChild);
          }

         //supprimer les textarea, inputs ..
         var divChamps = document.getElementById('cible');
          while (divChamps.firstChild) {
            divChamps.removeChild(divChamps.firstChild);
          }

          //desactiver les buttons
          $('#saveQRCode, #preview, #annuler, #ajouterTexte, #showAudio, #showJson').attr('disabled', true);
       });
     //fin reinitialiser


       //charger les fichiers audio dans le Modal 'listeMusic', et les fichiers json dans le Modal 'listeJson'
       remplirUnModalParDesFichiers();

 });

   //ajouter une nvlle legende (textarea) a chaque click sur button Texte (pour chaque textarea il faut rajouter à l'attribut class la valeur qrData class="... qrData")
   function ajouterChampLegende(valeur=null){

     var textareaLegende = document.createElement('div');
     textareaLegende.innerHTML = "<textarea class='form-control qrData' rows='3' name='legendeQR' placeholder='Mettre la légende'></textarea>"
                       +"<button type='button' class='btn btn-outline-success legendeQR-close-btn' onclick='supprimerChampLegende(this);'>"
                       +"<i class='fa fa-trash-alt'></i>"
                       +"</button>";
     textareaLegende.setAttribute("class", "d-flex align-items-start legendeQR");
     textareaLegende.setAttribute("id", "legendeTextarea");
     if(valeur != null){
       textareaLegende.setAttribute("value",valeur);
     }
     document.getElementById('cible').appendChild(textareaLegende);

   }

   //supprimer la legende selectionnée -> event onclick
   function supprimerChampLegende(e){
       $(e).parents('div#legendeTextarea').remove();
     }

     //generer un input 'pour un fichier audio' -> nom de fichier + url (pour chaque input il faut rajouter à l'attribut class la valeur qrData class=".. qrData")
     function ajouterChampSon(nom,url){

       var inputSon = document.createElement('div');
       inputSon.innerHTML = "<input type='text' id='"+url+"' name='AudioName' class='form-control qrData' value='"+nom+"' readonly>"
                         +"<button type='button' class='btn btn-outline-success legendeQR-close-btn' onclick='supprimerChampSon(this);'>"
                         +"<i class='fa fa-trash-alt'></i>"
                         +"</button>";
       inputSon.setAttribute("class", "d-flex align-items-start legendeQR");
       inputSon.setAttribute("id", "inputAudio");
       document.getElementById('cible').appendChild(inputSon);

       $('#listeMusic .close').click();

     }

     //supprimer le champ Audio selectionné -> event onclick
     function supprimerChampSon(e){
         $(e).parents('div#inputAudio').remove();
       }


       //generer un input 'pour un fichier json' -> nom de fichier + url (pour chaque input il faut rajouter à l'attribut class la valeur qrData class=".. qrData")
       function ajouterChampJson(nom,url){

         var inputJson = document.createElement('div');
         inputJson.innerHTML = "<input type='text' id='"+url+"' name='JsonName' class='form-control qrData' value='"+nom+"' readonly>"
                           +"<button type='button' class='btn btn-outline-success legendeQR-close-btn' onclick='supprimerChampJson(this);'>"
                           +"<i class='fa fa-trash-alt'></i>"
                           +"</button>";
         inputJson.setAttribute("class", "d-flex align-items-start legendeQR");
         inputJson.setAttribute("id", "inputJson");
         document.getElementById('cible').appendChild(inputJson);

         $('#listeJson .close').click();

       }

       //supprimer le champ Json selectionné -> event onclick
       function supprimerChampJson(e){
           $(e).parents('div#inputJson').remove();
         }


    //remplir le Modal 'listeMusic' par des fichiers audio, et le Modal 'listeJson' par des fichiers json, depuis le drive
    //dans quickstart.js, il faut preciser la/les liste(s) a charger depuis la fonction listFiles() -> exemple de type d'une liste : listMusic() , listJson() ...
    function remplirUnModalParDesFichiers(){

      try {
        // Load client secrets from a local file.
        fs.readFile('credentials.json', function processClientSecrets(err, content) {
          if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
          }
          // Authorize a client with the loaded credentials, then call the Drive API.
          authorize(JSON.parse(content), listFiles);
        //  console.log(listFiles);
        });
      } catch (e) {
        alert('Erreur : ' + e.stack);
      }

    }

    //desactiver les buttons
    $('#saveQRCode, #preview, #annuler, #ajouterTexte, #showAudio').attr('disabled', true);
  });
  //fin annuler
});

//verifier le champ qrName du formulaire myFormActive puis activer le button generer
function activer_button() {
  if (document.getElementById('qrName').value.length > 0) {
    $('#preview, #annuler, #ajouterTexte, #showAudio').attr('disabled', false);
  }
}

    //creer+sauvegarder le fichier json correspond à un qrcode qui depasse la taille 500
    //voir FacadeController.js -> fonction genererQRCode -> dans le message msg -> onclick='sauvegarderFichierJsonUnique(...)
    function sauvegarderFichierJsonUnique(nomFichier,path){

      let nouveauNomduFichier = $('#qrName').val()+'-'+nomFichier;

      path += nouveauNomduFichier+".json";

      const zlib = require('zlib');

      fs.writeFile(path, zlib.gzipSync(JSON.stringify(qrcode)).toString('base64'), (err) => {
          if (err) {
              console.error(err);
              return;
          };

          // console.log("********** zlib **********\n");
          // console.log(zlib.gzipSync(JSON.stringify(qrcode)));
          // console.log("zipped data --- : "+zlib.gzipSync(JSON.stringify(qrcode)).toString('base64'));

          //upload le fichier json vers le drive on donnant le nom du fichier géneré dans le dossier QR-Unique/json/
          uploadFileToDrive(nouveauNomduFichier);
          messageInfos("votre fichier json est bien sauvegardé","success");

      });

    }

//supprimer un champ Audio -> event onclick
function supprimerChampSon(e) {
  $(e).parents('div#inputAudio').remove();
}
