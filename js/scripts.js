/**
 * @Author: alassane
 * @Date:   2018-11-10T17:52:40+01:00
 * @Last modified by:   alassane
 * @Last modified time: 2018-12-04T14:55:56+01:00
 */


let qr = new QRCodeUnique();
console.log(qr);

$(document).ready(function() {

  try {
    // pour rendre les listes sortables
    $(function() {
      $("#sortable").sortable();
      $("#sortable").disableSelection();
    });

    $(function() {
      $('#sortable > li').click(function(event) {
        $('.tab-content-liste-content > div').css('display', 'none');
        $('.tab-content-liste-content > div.' + event.target.id).css('display', 'block');
      });
    });
  } catch (e) {
    alert('Erreur : ' + e.stack);
  }

  // desactiver les boutons preview et lire s'il y a rien à lire ou preview
  // desactiver exporter, faut preview avant de pouvoir exporter
  // désactiver le bouton créer s'il s'agit de qrcode unique
  $('#btnExportFile, #preview, #read').attr('disabled', true);

  // fonction pour dispatcher
  document.addEventListener('click', function() {
    recognizeFunction(event);
  });

  $('#modalMusic').click(function() {
    selectMusic(event, null);
  }); // sur clic d'un lien de musique

  $('#setImportedFile').click(function() {
    importFile();
  });

  $('#btnExportFile, #saveFamily').click(function() {
    exportFile();
  });

  $('#previewFamily').click(function() {
    previewFamily();
  });
  $('#initView').click(function() {
    init_View();
  });

});

// fonction pour appeler la foncton sollicitée
function recognizeFunction(event) {
  try {
    var element = event.target;
    if (element.tagName == 'BUTTON' && element.classList.contains("set-music")) {
      $('#closeModal').trigger('click');
      createMusicBox();
    }
  } catch (e) {
    alert('Erreur : ' + e.stack);
  }
}

// renseigner la musique sur un champ texte et l'afficher
function selectMusic(event, imported) {
  try {
    var div2, textarea;
    if (event && imported == null) {
      var element = event.target;

      if (element.tagName == 'A') {
        textarea = createTextarea('form-control legende-music', element.getAttribute('href').substring(1), element.textContent);
        textarea.setAttribute('disabled', true);
      }
    } else if (event == null && imported) {
      textarea = createTextarea('form-control legende-music', imported[0], imported[1]);
      textarea.setAttribute('disabled', true);
    }

    div2 = createDiv('col-md-12', null, [textarea]);

    var btnAdd = createClickableImg('addChamp', 'add.png', 'Ajouter un nouveau champ');
    var btnDelete = createClickableImg('deleteChamp', 'delete.png', 'Supprimer ce champ');
    var btnPlay = createClickableImg('playChamp', 'play.png', 'Ecouter le contenu du champ');

    var span = document.createElement('SPAN');

    span.append(btnAdd, btnDelete, btnPlay);

    var div;
    if (typeQR == 'ensemble') { // on ne supprime pas ou ajouter des champs pour un qrcode ensemble
      div = createDiv('form-group', null, [createDiv('row', null, [div2])]);
    } else {
      var div3 = createDiv('col-md-12 optButton', null, [span]);
      div = createDiv('form-group', null, [createDiv('row', null, [div2, div3])]);
    }

    var idActive, form = null;

    if (typeQR == 'atomique') {
      form = $('form#myFormActive');
    }
    if (typeQR == 'ensemble') {
      form = $('form#myFormActive > div:last-child');
    }
    if (typeQR == 'famille') {
      idActive = $('li.active').attr('id');
      form = $('div#content-item.' + idActive).find($('form#myFormActive'));
    }

    form.append(div);

    // ajout un event sur click du bouton supprimer champ
    $('img.deleteChamp').click(function() {
      $(this).parents('div.form-group').remove();
      // supprimer le qrcode s'il n'y a plus de champs textarea
      if (form.find('textarea').length == 0) {
        if (typeQR == 'atomique' || typeQR == 'ensemble') {
          init_View();
        }
        if (typeQR == 'famille') {
          $('div#content-item.' + idActive + ' > input[title="Supprimer ce qrcode"]').trigger('click');
        }
      }
    });

    // ajouter un eventlistener sur playChamp pour lire le champ sur click du bouton
    $('img.playChamp').click(function(event) {
      console.log(event.target);
      var texte = event.target.parentNode.parentNode.parentNode.parentNode.childNodes[0].childNodes[0].value;
      getForm(texte);
    });

    $('button#closeModalMusique').trigger('click'); // fermer le popup de musique
  } catch (e) {
    //console.log(e.message);
    //alert('Erreur : ' + e.stack);;
  }
}

// fonction pour charger un QRCode
function importFile() {
  try {
    $('#closeModalImport').trigger('click'); // fermer le popup d'import
    // recupérer le fichier
    var importedFile = document.getElementById('importedFile').files[0];
    if (importedFile) {
      facade.importQRCode(importedFile);
    }
  } catch (e) {
    alert('Erreur : ' + e.stack);

  }
}

/*
 fonction pour enregistrer une image de qrcode si famille = false sinon une image de famille
*/
function exportFile() {
  try {
    var img, nameFile;
    if (typeQR == 'famille') { // si on a une famille à enregistrer
      img = $('#affichageFamille').find('img')[0];
      if (typeof img == "undefined") {
        previewFamily()
        img = $('#affichageFamille').find('img')[0];
      }
      nameFile = $('#nameFamily').val() + '.jpeg'; // nom de la famille
    }

    if (typeQR == 'atomique' || typeQR == 'ensemble') {
      img = $('#affichageqr').find('img')[0];
      nameFile = 'image.jpeg'; // nom du ficher par defaut
    }

    var url = img.src.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
    var xhr = new XMLHttpRequest();

    xhr.responseType = 'blob'; //Set the response type to blob so xhr.response returns a blob
    xhr.open('GET', url, true);

    xhr.onreadystatechange = function() {
      if (xhr.readyState == xhr.DONE) {
        //When request is done
        //xhr.response will be a Blob ready to save
        var filesaver = require('file-saver');
        filesaver.saveAs(xhr.response, nameFile);

        if (typeQR == 'famille') {
          // simuler un click sur chaque item et generer le qrcode du item actif et le mettre dans le tableau de qrcode
          $('ul#sortable > li').each(function() {
            $(this).trigger('click');
            previewQRCode(true);

            var filename = $(this).attr('id') + '.jpeg';
            // enegistrer le qrcode atomatiquement
            var imgData = $('#affichageqr').find('img').attr('src');

            var data = imgData.replace(/^data:image\/\w+;base64,/, '');
            fs.writeFile(filename, data, {
              encoding: 'base64'
            }, function(err) {
              if (err) {
                console.log('err', err);
              }
              //success
            });
          });
        }
      }
    };
    xhr.send(); //Request is sent
  } catch (e) {
    alert('Erreur : ' + e.stack);
  }
}

// fonction pour sauvegarder les qrcodes d'une meme famille en même temps
function exportFamily() {
  try {
    // on prend chaque item, on génére son qrcode, on l'enregistre
    tabQRCode = [];

    // simuler un click sur chaque item et generer le qrcode du item actif et le mettre dans le tableau de qrcode
    $('ul#sortable > li').each(function() {
      $(this).trigger('click');
      var qrcode = previewQRCode(true);
      tabQRCode.push(qrcode);
    });
  } catch (e) {
    alert('Erreur : ' + e.stack);
  }
}

// function appelée aprés chaque export pour réinitialiser la vue
function init_View() {
  facade = new FacadeController();
  typeQR = null;
  tabQRCode = [];
  $('div.tab-content-qrcode-unique > div:first-child, #affichageqr > div:first-child, ul#sortable, div.tab-content-liste-content, div#nameproject').empty();
  $('div.tab-content-qrcode-family, div.tab-content-qrcode-unique, #previewFamily, #initView, #nameFamily').css('display', 'none');
  $('#btnExportFile, #preview, #read').attr('disabled', true);
  $('#creer, #import').attr('disabled', false);
}

//fonction pour générer une famille de qrcode
function previewFamily() {
  try {
    exportFamily();
    var div = $('div#affichageFamille').find('div.col-md-12.text-center')[0];
    facade.genererImageFamilleQRCode(tabQRCode, div);
  } catch (e) {
    alert('Erreur : ' + e.stack);
  }
}

/*
fonction pour générer un qrcode atomique, famille est un parametre booléen
famille = true : qrcode famille; false : qrcode atomique sans famille
*/
function previewQRCode(famille) {
  try {
    var qrcode;

    if (typeQR == 'ensemble') {
      qrcode = facade.creerQRCodeEnsemble(); // instancier un objet qrcode ensemble
    } else {
      qrcode = facade.creerQRCodeAtomique(); // instancier un objet qrcode atomique
    }

    // variable pour recupérer le formulaire
    var idActive, form, tab;
    if (famille) {
      idActive = $('li.active').attr('id');
      form = $('div#content-item.' + idActive).find($('form#myFormActive'));
    } else {
      form = $('form#myFormActive');
    }

    tab = form.find('textarea');

    /* copier les données du formulaire dans le qrcode */
    if (form != null) {
      for (var i = 0; i < tab.length; i++) {
        var element = tab[i];

        if (element.tagName == "TEXTAREA") {
          copyContentToQRCode(qrcode, element);
        }
      }

      if (facade.getTailleReelleQRCode(qrcode) > 500) {
        alert("La taille de ce qr code dépasse le maximum autorisé (500).\nTaille = " + facade.getTailleReelleQRCode(qrcode));
        qrcode = null;
      } else {
        facade.genererQRCode($('#affichageqr').children()[0], qrcode); // générer le qrcode
        $('#btnExportFile').attr('disabled', false); // activer le bouton exporter
        $('#initView').css('display', 'block'); // afficher le bouton terminer

        if (famille) {
          return qrcode;
        }
      }
    }
  } catch (e) {
    alert('Erreur : ' + e.stack);
  }
}

// copier le contenu d'un element input
function copyContentToQRCode(qrcode, input) {
  try {

    if (input.disabled) { // tester s'il s'agit d'un input de musique

      if (typeQR == 'ensemble') {
        qrcode.ajouterLien(input.id, input.value);
      } // qrcode ensemble
      else {
        qrcode.ajouterFichier(input.id, input.value);
      } // qrcode atomique

    } else {
      qrcode.ajouterTexte(input.value);
    }

    // recupérer la couleur du qrcode et les options du braille
    var idActive;
    // copier la couleur du qrcode et du braille
    if ($('input#nameFamily').css('display') == 'block') { // famille de qrcode
      idActive = $('li.active').attr('id');
      qrcode.setColorQR($('div#content-item.' + idActive).find('input#colorQR').val());
      // tester si le checkbox pour les options du braille est checked
      if ($('div#content-item.' + idActive).find('input#checkBraille').prop('checked')) {
        // mettre la couleur et le texte en braille dans le qrcode
        qrcode.setTexteBraille($('div#content-item.' + idActive).find('input#braille').val());
        qrcode.setColorBraille($('div#content-item.' + idActive).find('input#colorBraille').val());
      } else {
        qrcode.setTexteBraille('');
        qrcode.setColorBraille('');
      }
    } else { // qrcode atomique
      qrcode.setColorQR($('input#colorQR').val());
      // tester si le checkbox pour les options du braille est checked
      if ($('input#checkBraille').prop('checked')) {
        // mettre la couleur et le texte en braille dans le qrcode
        qrcode.setTexteBraille($('input#braille').val());
        qrcode.setColorBraille($('input#colorBraille').val());
      } else {
        qrcode.setTexteBraille('');
        qrcode.setColorBraille('');
      }
    }

    // mettre le nom de l'onglet si on a une famille
    if (typeQR == 'famille') {
      qrcode.setNomQRCode(idActive);
      qrcode.ajouterAFamille($('#nameFamily').val(), $('#' + idActive).index() + 1);
    }

  } catch (e) {
    alert('Erreur : ' + e.stack);
  }
}

/**
 * Copyright © 12/02/2018, Corentin TALARMAIN, Thomas CALATAYUD, Rahmatou Walet MOHAMEDOUN, Jules LEGUY, David DEMBELE, Alassane DIOP
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * The Software is provided “as is”, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders X be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the Software.
 * Except as contained in this notice, the name of the Corentin TALARMAIN, Thomas CALATAYUD, Rahmatou Walet MOHAMEDOUN, Jules LEGUY, David DEMBELE, Alassane DIOP shall not be used in advertising or otherwise to promote the sale, use or other dealings in this Software without prior written authorization from the Corentin TALARMAIN, Thomas CALATAYUD, Rahmatou Walet MOHAMEDOUN, Jules LEGUY, David DEMBELE, Alassane DIOP
 */
