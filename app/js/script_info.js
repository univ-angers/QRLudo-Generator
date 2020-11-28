/**
 * @Author: alassane
 * @Date:   2018-12-10T13:37:39+01:00
 * @Last modified by:   alassane
 * @Last modified time: 2018-12-10T21:54:12+01:00
 */

$(document).ready(function () {
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

$("#unique-info").click(function(){
  $("#info-unique").css("display","block");
  $("#info-multiple").css("display","none");
  $("#info-exo").css("display","none");
  $("#info-QCM").css("display","none");
  $("#info-MusicInput").css("display","none");
  $("#info-Import").css("display","none");
});

$("#multiple-info").click(function(){
  $("#info-unique").css("display","none");
  $("#info-multiple").css("display","block");
  $("#info-exo").css("display","none");
  $("#info-QCM").css("display","none");
  $("#info-MusicInput").css("display","none");
  $("#info-Import").css("display","none");
});

$("#questRep-info").click(function(){
  $("#info-unique").css("display","none");
  $("#info-multiple").css("display","none");
  $("#info-exo").css("display","block");
  $("#info-QCM").css("display","none");
  $("#info-MusicInput").css("display","none");
  $("#info-Import").css("display","none");
});

$("#qcm-info").click(function(){
  $("#info-unique").css("display","none");
  $("#info-multiple").css("display","none");
  $("#info-exo").css("display","none");
  $("#info-QCM").css("display","block");
  $("#info-MusicInput").css("display","none");
  $("#info-Import").css("display","none");
});

$("#music-info").click(function(){
  $("#info-unique").css("display","none");
  $("#info-multiple").css("display","none");
  $("#info-exo").css("display","none");
  $("#info-QCM").css("display","none");
  $("#info-MusicInput").css("display","block");
  $("#info-Import").css("display","none");
});

$("#import-info").click(function(){
  $("#info-unique").css("display","none");
  $("#info-multiple").css("display","none");
  $("#info-exo").css("display","none");
  $("#info-QCM").css("display","none");
  $("#info-MusicInput").css("display","none");
  $("#info-Import").css("display","block");
});
