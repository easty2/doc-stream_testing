import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';
import { Liste } from "../imports/collections.js";
import './app.html';

Meteor.subscribe('Liste');

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_ONLY',
});

LOG = true, logLevel = 9, hid = 0, CURRENT_hid = 0, col_Liste = Liste, ajax_call = [], NB_obj = 20, PAGE=1,in_load_scroll=false,LOAD=false,FIRST=true,handle=null;

if (LOG && logLevel > 1) console.groupCollapsed('%c starting app ',"background:green;color:greenYellow;border-color: red;");

Template.start.onCreated(function helloOnCreated() {
  $( document ).ready(function() {
    var url = 'home.html';
    if (typeof $('#redir').attr('href') != 'undefined') url = $('#redir').attr('href');
    callPage(url);
  });
});

Template.header.events({
  'click a'(event, instance) {
    var att = event.originalEvent.target.parentNode.attributes;
    var att2 = event.originalEvent.target.attributes;
    if (typeof att.href != 'undefined' && att.href.value != 'javascript:;' && att.href.value[0] != '#' && att.href.value != 'ws:'){
      event.preventDefault();
      event.stopPropagation();
      callPage(att.href.value );
    }else if(typeof att2.href != 'undefined' && att2.href.value != 'javascript:;' && att2.href.value[0] != '#' && att2.href.value != 'ws:'){
      event.preventDefault();
      event.stopPropagation();
      callPage(att2.href.value );
    }else if(typeof att2.href != 'undefined' && att2.href.value == 'ws:'){
      event.preventDefault();
      event.stopPropagation();
      callMeth(att2.ws_meth.value,att2.ws_id.value);
      if (typeof att2.onclick != 'undefined' && att2.onclick.value != ""){
        eval(att2.onclick.value);
      }
    }else{
      event.preventDefault();
    }
  },
  'click i'(event, instance) {
    var att = event.originalEvent.target.parentNode.attributes;
    if (typeof att.href != 'undefined' && att.href.value == 'ws:'){
      event.preventDefault();
      event.stopPropagation();
      callMeth(att.ws_meth.value,att.ws_id.value);
    }else{
      event.preventDefault();
    }
  },
});

callPage = function(url,hist0){
  Meteor.call('page', {url: '/html/'+url}, (err, res) => {
    if (err) {
      notif(err,'Erreur','error');
    } else {
      document.body.scrollTop = 0;
      var div = document.getElementById('ajax');
      div.innerHTML = res;
      if (!hist0) historyme(url,res);
      eval_script();
    }
  });
};
update_page = function(){
  var nb_total = Liste.find().fetch().length;
  $('#stats_page').html(nb_total+' éléments.');
  if (nb_total > NB_obj){

    for(var i=1;i<(nbPAGE+1);i++) {
      var button = document.createElement('button');
      button.setAttribute('onclick', 'get_page('+i+');');
      button.setAttribute('class', 'btn');
      button.setAttribute('id', 'page_'+i);
      var txt_button = document.createTextNode(i);
      button.appendChild(txt_button);
      document.getElementById('btn_page').appendChild(button);
    }
  }
};
create_pageLinks = function(){
  var group = document.createElement('div');
      group.setAttribute('class','btn-group');

/*  var button = document.createElement('button');
      button.setAttribute('href','');
      button.setAttribute('class','btn');
  var txt_button = document.createTextNode('page précédente');
      button.appendChild(txt_button);
  var group2 = document.createElement('div');
      group2.setAttribute('id','btn_page');
      group2.setAttribute('style','display: inline;');*/

  var button3 = document.createElement('button');
      button3.setAttribute('onclick','PAGE++;get_page(PAGE);');
      button3.setAttribute('class','btn suivant');
      button3.setAttribute('style','float: right;');
  var txt_button3 = document.createTextNode('page suivante');
      button3.appendChild(txt_button3);

  var p = document.createElement('p');
      p.setAttribute('id','stats_page');
  var p_txt = document.createTextNode('');
      p.appendChild(p_txt);

  //group.appendChild(button);
  //group.appendChild(group2);
  group.appendChild(button3);
  group.appendChild(p);

  document.getElementById('page_num').innerHTML = "";
  document.getElementById('page_num').appendChild(group);
  //update_page();
};

function callMeth(methode,params){
  Meteor.call(methode, {id: params}, (err, res) => {
    if (err) {
      notif(err,'Erreur','error');
    } else {
      eval(res);
    }
  });
}
function eval_script(){
  $.ajaxSetup({
    cache: true
  });
  var div = document.getElementById('ajax');
  var x = div.getElementsByTagName("script");
  for (var i = 0; i < x.length; i++) {
    src = x[i].src;
    if (src != "") $.ajax({url: src, cache: true, dataType: 'script'});
    if (x[i].text != ""){
      eval(x[i].text);
    }
  }
}
inject = function(url){
  $.ajaxSetup({cache: false});
  if (url != "") $.ajax({url: url, cache: false, dataType: 'script'});
};
inject_css = function(url){
  var l = document.createElement('link');
  l.setAttribute('href', url);
  l.setAttribute('rel', 'stylesheet');
  l.setAttribute('type', 'text/css');
  l.setAttribute('inject', 'true');
  document.getElementsByTagName('head')[0].appendChild(l);
};
inject_ajax = function(){
  if (ajax_call.length === 0) return;
  var file_ajax = ajax_call[0];
  ajax_call.shift();
  if (typeof file_ajax != 'function'){
    $.ajaxSetup({cache: false});
    $.ajax({url: file_ajax, cache: false, dataType: 'script'}).done(function(){
      inject_ajax();
    });
  }else{
    console.log(file_ajax);
    file_ajax();
  }
};
notif = function(txt,title,type){
  $('#ajax').pgNotification({
    style: 'circle',
    title: title||'John Doe',
    message: txt,
    position: 'top-right',
    timeout: '3000',
    type: type||'info',
    thumbnail: '<img width="40" height="40" style="display: inline-block;" src="assets/img/profiles/avatar2x.jpg" data-src="assets/img/profiles/avatar.jpg" data-src-retina="assets/img/profiles/avatar2x.jpg" alt="">'
  }).show();
};
document.onselectstart = new Function ("return false");
window.setTimeout(function () {
  $(window).bind('popstate', function (event) {
    if (!event.originalEvent.state || event.originalEvent.state.hid < hid) {
      if (event.originalEvent.state) {
        hid = event.originalEvent.state.hid;
        if (LOG) console.log("%c -> précédent", 'background: aqua;');
      } else {
        hid = 0;
        if (LOG) console.log("%c -> fin de l'historique ajax", 'background: aqua;');
        //alertify.log('Fin de lhistorique ajax');
        return false;
      }
    } else {
      hid = event.originalEvent.state.hid;
      if (LOG) console.log("%c -> suivant", 'background: aqua;');
    }
    callPage(document.location.pathname,true);
    console.log('url > '+document.location.pathname);
  });
}, 800);
function historyme(url,res) {
  if (typeof url != 'undefined' && url != '' && url.indexOf('connexion') == -1 && url.indexOf('creation') == -1) {
    hid++;
    history.pushState({'hid': hid, 'scroll': null}, url, url);
    var obj = {};
    obj.data = res;
    log_me('HISTO ['+hid+']','historique',obj,4,'Url: '+url+' scroll:'+document.body.scrollTop,url,true);
  }
}
function log_me(txt,mode,obj_console,level,txt_2,hid_back,start){
  if (LOG && logLevel > level) {
    var css_console, css_console_2;
    var general_css = "background:greenYellow;color:green;border-radius:0 3px 3px 0;font-size:11px;";
    if (start && CURRENT_hid < hid) {
      console.groupEnd();
      var size_console = "background:green;color:greenYellow;",
          size =Math.round((obj_console.data.length/1000)*100)/100;
      if (size == 0){
        size_console = "background:red;color:greenYellow;border-color: orange;";
        general_css = "background:orange;color:red;border-radius:0 3px 3px 0;font-size:11px;";
      }
      console.groupCollapsed('%c WS:'+hid+' %c '+size+' ko  %c '+hid_back+' ', "background:purple;color:pink;",size_console,general_css);
      CURRENT_hid++;
    }else if(start && CURRENT_hid == hid){
      CURRENT_hid = hid;
    }
    switch (mode) {
      case'error':
        css_console = "background:pink;color:red;";
        break;
      case'success':
        css_console = "background:green;color:white;";
        break;
      case'log':
        css_console = "background:rgba(128, 128, 128, 0.5);color:black;";
        break;
      case'log_2':
        css_console = "background:rgba(128, 128, 128, 0.5);color:black;";
        break;
      case'info':
        css_console = "background:purple;color:white;";
        break;
      case'json':
        css_console = "background:orange;color:white;";
        break;
      case'html':
        css_console = "background:green;color:white;";
        break;
      case'cache':
        css_console = "background:rgba(0, 128, 0, 0.47);color:white;";
        break;
      case'historique':
        css_console = "background:cornflowerblue;color:white;";
        break;
      default:
    }
    general_css += css_console;
    if (typeof obj_console == 'undefined' || mode == 'cache' || mode == 'log_2') {
      //console.group('%c ' + txt + ' ', general_css);
    } else {
      if (typeof txt_2 != 'undefined') log_me(txt_2, 'log_2', null, level);
      console.group(obj_console);
      console.groupEnd();
    }
  }
}

$(window).bind('scroll', function() {
  var box = document.getElementById('box');
    if (typeof nbPAGE != 'undefined' && document.body.scrollTop + window.innerHeight >=  box.scrollHeight) {
      if ( PAGE < nbPAGE ) {
        console.log('scroll');
        PAGE++;
        get_page(PAGE);
      }else if(PAGE = nbPAGE){
        $('.btn.suivant').addClass('disabled');
      }
    }
});
get_page_num = function(){
  var liste_film = col_Liste.find().fetch();
  var nb_loop = liste_film.length;
  if (liste_film.length > NB_obj) nb_loop = NB_obj;
  var nb_pages = Number(col_Liste.find().fetch().length) / NB_obj;
  nbPAGE = Math.round(col_Liste.find().fetch().length / NB_obj);
  if (nb_pages > nbPAGE) nbPAGE++;
  return nb_loop;
};
get_page = function(page){
  var page_var = Number(page)-1, liste_film = col_Liste.find().fetch(), nb_loop = NB_obj,depart = page_var * nb_loop,nb_loop_page = depart + nb_loop;
  if (typeof $('.gallery')[0] != 'undefined') {
    if (nb_loop_page > liste_film.length) nb_loop_page = depart+(liste_film.length - depart);
    if (depart > liste_film.length || nb_loop_page > liste_film.length){
      notif('page N°'+page+' introuvable!','Erreur','error');
    }else{
      for (var i = depart; i < nb_loop_page; i++){
        create_vignette(liste_film[i]._id,liste_film[i].titre,liste_film[i].date,liste_film[i].description);
      }
      applyIsotope();
    }
  }else if(typeof $('#tableWithSearch_wrapper')[0] != 'undefined'){
    if (nb_loop_page > liste_film.length) nb_loop_page = depart+(liste_film.length - depart);
    if (depart > liste_film.length || nb_loop_page > liste_film.length){
      notif('page N°'+page+' introuvable!','Erreur','error');
    }else{
      for (var i = depart; i < nb_loop_page; i++){
        create_row(liste_film[i]._id,liste_film[i].titre,liste_film[i].description,liste_film[i].date);
      }
    }
  }
  $('#stats_page').html($('.gallery .gallery-item').length+' éléments.');
};






function create_image(w,h,c,cont,img,click,alt,pid,lazy){
  var spinner = 'spinner';
  if (lazy) spinner = 'blank spinner';
  var divcont = document.createElement('div');
  divcont.setAttribute('id', 'img'+LastId);
  divcont.setAttribute('class', 'img centerme '+spinner);
  var imgp = document.createElement('img');
  imgp.setAttribute('width', w);
  imgp.setAttribute('height', h);
  imgp.setAttribute('id', 'imgFilm' + LastId);
  imgp.setAttribute('idimg', img);
  imgp.setAttribute('class', c);
  imgp.setAttribute('itemprop', 'thumbnailUrl');
  imgp.setAttribute('onclick', click);
  if (typeof alt != 'undefined' && alt != '') imgp.setAttribute('alt', alt);
  imgp.setAttribute('draggable', 'false');
  divcont.appendChild(imgp);
  document.getElementById(cont).appendChild(divcont);
  if (!lazy) readImage(img,LastId,null,false,pid);
}
function getblob(lid,uid,dir,bg) {
  var img='';
  if (dir == '' || dir == null){
    if (bg){
      dir = "/img/covers/";
      img = uid;
    }else{
      dir = "/img/img_prod/";
      img = $('#imgFilm'+lid).attr('idimg');
    }
  }else if(dir == 'user'){
    dir = "/img/user/";
  }
  if (img.indexOf('.') == -1){
    img += '.jpg';
  }

  var xhr = new XMLHttpRequest(),
      blob;
  xhr.open("GET", "http://"+window.location.host+dir+img, true);
  xhr.responseType = "blob";
  xhr.addEventListener("load", function (e) {
    if (xhr.status === 200) {
      var transaction = imgdb.transaction(["images"], "readwrite");
      transaction.objectStore("images").put(xhr.response, uid);
    }else if(xhr.status == 404){
      if (LOG && logLevel >= 4) console.info('%c ajax imageGD Fichier introuvable sur le serveur!'+uid,'background:pink;color:red;');
    }else{
      if (LOG && logLevel >= 4) console.info('%c ajax imageGD erreur inconnue script.js>getblob() ! %o'+uid,'background:orange;color:red;',e);
    }
    LOADi = false;
  }, false);
  xhr.send();
}
function readImage(uid,lid,dir,bg,pid){
  if (indexedDB_start != false) {
    LOADi = true;
    var transaction = imgdb.transaction(["images"], "readonly");
    transaction.onerror = function (event) {
      console.log('ERREUR: %o', event);
    };
    transaction.objectStore("images").get(uid).onsuccess = function (event) {
      var imgFile = event.target.result;
      if (imgFile) {
        log_me('cache_imageGD','cache',null,4);
        if (!bg) {
          imgd_cache(imgFile, lid, uid, false, pid);
        } else {
          imgd_cache(imgFile, lid, uid, true, pid);
        }
      } else {
        log_me('imageGD téléchargement: '+uid ,'json',null,4);
        if (!bg) {
          imgd(lid, uid, dir, false, pid);
          getblob(lid, uid, dir, false);
        } else {
          imgd(lid, uid, dir, true, pid);
          getblob(lid, uid, dir, true);
        }
      }
    }
  }else{
    imgd(lid, uid, dir, false, pid);
  }
}
function imgd_cache(blob_cache,lid,uid,bg,pid) {
  var img = document.getElementById("imgFilm" + lid);
  if (img != null) {
    img.onload = function () {
      if (!bg){
        $(this).removeClass("loads");
        $('#img' + lid).removeClass("spinner");
        $('#imgFilm' + lid).addClass("fadeIn");
        $('#prod'+uid).removeClass('spinner');
      }
      if(typeof  pid != 'undefined' && pid != ""){
        $('#prod'+pid).addClass('loaded');
      }
    };
    //TODO: hotlink ebauche:+htaccess
    /*
     img.onmouseenter = function(e){
     var img = $(this);
     var pos = img.offset();
     var overlay = $('<img src="/img/img_prod/9259487e-1465-4931-9108-9dbaca3b0738.png" width="' + img.width() + '" height="' + img.height() + '" />').css({position: 'absolute', zIndex: 9999999, left: pos.left, top: pos.top}).appendTo('body').bind('mouseleave', function() {
     overlay.remove();
     });
     if ('ontouchstart' in window) $(document).one('touchend', function(){ overlay.remove(); });
     }
     */
  }else if(!bg){
    if (LOG && logLevel >= 1) console.log('%c erreur chargement image: [LID] #imgFilm '+lid+' [UID] #prod '+uid+' [URL]'+"http://" + window.location.host + "/img/img_prod/" + $('#imgFilm'+lid).attr('idimg') + ".jpg",'background:red;color:white;');
  }

  //TODO soit url creator (blob) soit base64 (blob plus rapide)
  var mode = 'blob';
  if (bg) mode = 'b64';

  switch (mode){
    case'blob':
      var uc = window.URL || window.webkitURL;
      var imageUrl = uc.createObjectURL( blob_cache );
      if (img != null) img.src = imageUrl;
      break;
    case'b64':
      var reader = new window.FileReader();
      reader.readAsDataURL(blob_cache);
      reader.onloadend = function() {
        if (!bg){
          if (img != null) img.src = reader.result;
        }else{
          var img_file = uid.replace('.jpg','');
          //if ($('body').attr('data-bg') != img_file) $('body').css('background',"url('"+reader.result+"')").css('background-attachment',"fixed").attr('data-bg',img_file);
          //background body random
        }
      }
      break;
    default:

  }
  LOADi = false;
}
function imgd(lid, uid, dir, bg, pid) {
  var img='';
  if (dir == '' || dir == null){
    if (bg){
      dir = "/img/covers/";
      img = uid;
    }else{
      dir = "/img/img_prod/";
      img = $('#imgFilm'+lid).attr('idimg');
    }
  }else if(dir == 'user'){
    dir = "/img/user/";
  }
  if (img.indexOf('.') == -1){
    img += '.jpg';
  }
  var xhr = new XMLHttpRequest();
  xhr.open( "GET", "http://"+window.location.host+dir+img, true );
  xhr.responseType = "arraybuffer";
  xhr.onload = function( e, img ) {
    if (xhr.status === 200) {
      var arrayBufferView = new Uint8Array( this.response );
      var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
      if (!bg){
        imgd_cache(blob,lid,uid,false,pid);
      }else{
        imgd_cache(blob,lid,uid,true,pid);
      }
    }else if(xhr.status == 404){
      if (LOG && logLevel >= 4) console.info('%c ajax imageGD chargement du fichier annulé!!'+uid,'background:pink;color:red;');
    }else{
      if (LOG && logLevel >= 4) console.info('%c ajax imageGD erreur inconnue script.js>imgd() ! %o'+uid,'background:orange;color:red;',e);
    }
  };

  xhr.send();
}