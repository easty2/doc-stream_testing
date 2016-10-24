"use strict";
window.onbeforeunload=function(){createCookie('javascript',false,-1);};

var indexedDB_obj = self.indexedDB || self.webkitIndexedDB || self.mozIndexedDB || self.OIndexedDB || self.msIndexedDB,
    IDBTransaction = self.IDBTransaction || self.webkitIDBTransaction || self.OIDBTransaction || self.msIDBTransaction,
    data_imgdb, dbVersion = 3;
var logLevel = 99, LOG=true, indexedDB_start=true;

if (indexedDB_start != false){
    var imgDB = indexedDB_obj.open("IMGGD", dbVersion), imgdb;
    imgDB.onsuccess = function (event) {
        imgdb = imgDB.result;
        data_imgdb = imgdb.transaction(["images"], "readwrite");
        if (LOG && logLevel >= 4) console.info('Cache image chargé. ver: %c[' +dbVersion+'.0] %c statut: [ok]','color:red;','color:green;');
    };
    imgDB.onupgradeneeded = function (event) {
        createObjectStore(event.target.result,'images');
    };
}else{
    redirect("/cinematheque/tout/@*",'null','js','prodDB()->success','script');
}

var AjaxMe = window, display_json=null, LAZY_selector=[], DISPLAY_scroll=false, display_ui=[], TIMER = 'off',SELECTION,VUES,INTERVAL, CREATE=[], DISPLAY_prods, display_links = [],coms_update=false, LECTURE_ON=false, LECTURE_AUTO=true, Film, VIDEO_ID = null, in_load_scroll = false, view_prods=[], Colonne_films  = 0, HumanEvents = 0, chart = null, LOGIN = false, AjaxEvents =0, hid = 0, b = [], LOAD = false, LOADi = false, id = 1, LastId = 3333, TRI = 'prix.moins', FORCE=false, FILTRE=false, uid_DISPLAY_prods=[], VUE_TRI = '', view_prods=[], INT=[], REVERSE=false, CURRENT_hid = hid;

window.fbAsyncInit = function() {
    FB.init({
        appId      : '1018340871564331',
        xfbml      : true,
        version    : 'v2.5'
    });
};
$(document).ready(function () {
    $('body a').on('click',function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
    });
    load_films();
    alertify.logPosition("bottom right").closeLogOnClick(true);
    $('a[class^="close"]').each(function(){eval($(this).attr('href'));});
    document.onselectstart = new Function ("return false");
    if(window.sidebar) {
        document.onmousedown = returnFalse;
        document.onclick = returnTrue;
    }
    function returnFalse(){return false;}
    function returnTrue(){return true;}
    //alertify.delay(0).success("En poursuivant votre navigation sur ce site, vous acceptez l’utilisation de cookies pour vous proposer une expérience de naviguation optmisée.");

});
window.onerror = function (msg, url, line, col, error) {
    pushme(45,msg + "\r\n > ligne:" + line,true);
    $('#txt_load').css('color','#F3E1E1');
    alertify.delay(0).error('Erreur JS: '+error+' | '+msg+' ligne: '+line);
    return false;
};
$(window).bind('scroll', function() {
    var box = document.getElementById('box');
    if (window.location.pathname.indexOf('cinematheque') != -1) {
        if (box.scrollTop + box.offsetHeight >= window.innerHeight) {
            if (!LOAD && !LOADi && !FORCE && PAGE < nbPAGE && !in_load_scroll) {
                in_load_scroll = true;
                page_suivante(true);
            }
        }else if(window.document.body.scrollTop != 0 && $('#ajax').css('display') != 'none'){
            //window.document.body.scrollTop = 0;
            //bloquer scrool bas
        }
    }else{
        if(window.document.body.scrollTop != 0){
            if (typeof display_ui != 'undefined' && typeof display_ui == 'object' && display_ui.length > 0){
                for (var i=0;i<display_ui.length;i++){
                    var commande = display_ui[i].commande;
                    var delay = display_ui[i].delay;
                    var scroll_value = display_ui[i].scroll;
                    if (window.document.body.scrollTop >= scroll_value){
                        if (typeof delay != 'undefined' && delay > 0) {
                            if (typeof commande == 'function' && DISPLAY_scroll) {
                                setTimeout(function () {
                                    commande();
                                    display_ui.shift();
                                }, delay);
                            }
                        } else {
                            if (typeof commande == 'function' && DISPLAY_scroll) {
                                commande();
                                display_ui.shift();
                            }
                        }
                        commande = null;
                    }
                }
            }else{
                //pas de scroll_ui
            }
        }
    }
});


//CHARGEMENT
function lbtn(mode) {
    return;
    if (!mode) {
        window.setTimeout(function () {
            $('body').removeClass('loading');
            document.body.offsetHeight = document.body.offsetHeight;
            //$('body').css('display','block');
            //$('*').css('cursor','pointer');
            //$(this).addClass('animated');
        },500);
    } else {
        //$('*').css('cursor','wait');
        $('body').addClass('loading');
    }
}
function demarrage(){
    if (document.location.pathname.indexOf('cinematheque') != -1 || document.location.pathname == '/'){
        set_head();
        switch_page(1,null,0);
    }else{
        switch_page(0,null,0);
        var id = window.location.pathname;
        id = id.split('/');
        id = id[3];
        id = id.substr(1);
        redirect("/film/voir/@"+id,"ajax_pages","sandbox","demarrage");
    }
}
function loadme(me,mode){
    if ($(me).hasClass('btn')){
        if ($(me).hasClass('load') || mode){
            $(me).removeClass('load');
        }else{
            $(me).addClass('load');
        }
    }
}

//GESTION DES LIENS
window.setTimeout(function () {
    $(window).bind('popstate', function (event) {
        if (!event.originalEvent.state || event.originalEvent.state.hid < hid) {
            var scroll = event.originalEvent.state.scroll;
            if (event.originalEvent.state) {
                hid = event.originalEvent.state.hid;
                if (LOG) console.log("%c -> précédent", 'background: aqua;');
            } else {
                hid = 0;
                if (LOG) console.log("%c -> fin de l'historique ajax", 'background: aqua;');
                alertify.log('Fin de lhistorique ajax');
                return false;
            }
        } else {
            hid = event.originalEvent.state.hid;
            if (LOG) console.log("%c -> suivant", 'background: aqua;');
        }
        var cont='ajax_pages',mode = 'html',display_res = 'body';
        if (document.location.pathname.indexOf('/cinematheque') > -1){
            set_head();
            cont = 'ajaxprod';
            mode = 'js';
            display_res = 'body';
        }
        if (document.location.pathname.indexOf('/compte') > -1){
            cont = 'ajax_pages';
            mode = 'html';
            display_res = 'body';
        }
        if (document.location.pathname.indexOf('/connexion') > -1){
            cont = null;
            mode = 'html';
            display_res = 'window';
        }
        if (LOG) console.log('%c --->Historique: ' + document.location.pathname + ' || hid: ' + hid + ' scroll:'+scroll, 'background: greenyellow;');
        redirect(document.location.pathname,cont,'sandbox','popstate()','','HISTORIQUE','','human',mode,display_res);
        if (document.location.pathname.indexOf('/cinematheque') == -1 || document.location.pathname.indexOf('/compte') != -1){
            switch_page(false,document.location.pathname,true);
            document.body.scrollTop = 0;
        }else{
            switch_page(true,document.location.pathname,true);
            if (typeof scroll != 'undefined' && scroll.IsNumeric && scroll > 1){
                document.body.scrollTop = scroll;
            }
        }
    });
}, 800);
function log_me(txt,mode,obj_console,level,txt_2,hid_back,start){
    if (LOG && logLevel > level) {
        var css_console, css_console_2;
        var general_css = "background:greenYellow;color:black;border-radius:0 3px 3px 0;font-size:11px;border:1px solid black;outline:1px solid black;";
        if (start && CURRENT_hid < hid) {
            console.groupEnd();
            console.groupCollapsed('%c page '+hid+' ', general_css);
            CURRENT_hid++;
        }else if(start && CURRENT_hid == hid){
            CURRENT_hid = hid;
        }
        switch (mode) {
            case'error':
                css_console = "background:pink;color:red;border-color: red;";
                break;
            case'success':
                css_console = "background:green;color:white;border-color: greenYellow;";
                break;
            case'log':
                css_console = "background:rgba(128, 128, 128, 0.5);color:black;border-color: gray;";
                break;
            case'log_2':
                css_console = "background:rgba(128, 128, 128, 0.5);color:black;border-color: gray;";
                break;
            case'info':
                css_console = "background:purple;color:white;border-color: gray;";
                break;
            case'json':
                css_console = "background:orange;color:white;border-color: gray;";
                break;
            case'html':
                css_console = "background:green;color:white;border-color: gray;";
                break;
            case'cache':
                css_console = "background:rgba(0, 128, 0, 0.47);color:white;border-color: gray;";
                break;
            case'historique':
                css_console = "background:cornflowerblue;color:white;border-color: gray;";
                break;
            default:
        }
        general_css += css_console;
        if (typeof obj_console == 'undefined' || mode == 'cache' || mode == 'log_2') {
            console.log('%c ' + txt + ' ', general_css);
        } else {
            console.groupCollapsed('%c ' + txt + ' ', general_css);
            console.trace();
            if (typeof txt_2 != 'undefined') log_me(txt_2, 'log_2', null, level);
            console.log('%o', obj_console);
            console.groupEnd();
        }
    }
}
function ajax(me, cont, mode, display_reponse,func) {
    var path = me.pathname;
    var AjaxCallbackObj = $.ajax({
        url: "/ajaxengine/",
        type: "POST",
        cache:false,
        async: true,
        beforeSend: function (xhr) {
            var txt_mode = mode;
            if (display_reponse == 'window') txt_mode = 'js';
            xhr.setRequestHeader('AjaxMe', txt_mode);
        },
        data: '{"url":"'+path+'"}',
        success: function (html) {
            switch(mode){
                case'js':
                    try{
                        eval(html);
                        if (typeof display_json == 'function') display_json();
                        AjaxMe.display_json = null;
                    }catch(e){
                        if (html[0] != '<'){
                            alertify.delay(0).error('[php] '+html);
                        }else{
                            alertify.delay(0).error('[php] voir la console js');
                            console.log('%c reponse du serveur non affichée: %o','background:orange;color:red;',html);
                        }
                    }
                    break;
                case'html':
                    switch(display_reponse){
                        case'note':
                            $('#box').addClass('sepia');
                            alertify
                                .okBtn("noter")
                                .cancelBtn("annuler")
                                .confirm(html, function (data,ev) {
                                    ev.preventDefault();

                                    $('#box').removeClass('sepia');

                                }, function(data,ev) {

                                    $('#box').removeClass('sepia');
                                });
                            $('.dialog').addClass('window_connection');
                            break;
                        case'window':
                            $('#box').addClass('sepia');
                            alertify
                                .okBtn("connexion")
                                .cancelBtn("annuler")
                                .confirm(html, function (data,ev) {
                                    ev.preventDefault();
                                    var form = document.getElementById('connect');
                                    var data = {'usr':form.usr.value,'psw':form.psw.value};
                                    if (verif_usr(data)){
                                        ajaxForm(form,data);
                                    }
                                    scroll_view('top');
                                    $('#box').removeClass('sepia');

                                }, function(data,ev) {
                                    if (document.location.pathname.indexOf('compte') != -1){
                                        if ($('#ajax').css('display') == 'none') switch_page(true,document.location.pathname,true);
                                        redirect('/cinematheque/tout/@1','ajaxprod','sandbox','format()','ajax');
                                    }
                                    $('#box').removeClass('sepia');
                                });
                            $('.dialog').addClass('connection');
                            $('#usr').focus();
                            $('#usr').val('mexicain');
                            break;
                        case'body':
                            if (cont == 'ajaxprod'){
                                $('#ajax').attr('url',document.location.pathname);
                            }else{
                                $('#ajax_pages').attr('url',document.location.pathname);
                            }
                            var div = document.getElementById(cont);
                            if (div == null && cont == 'ajaxprod'){
                                set_head();
                                div = document.getElementById(cont);
                            }
                            if (me.pathname.indexOf('/cinematheque/') != -1 && me.pathname.indexOf('/cinematheque/@') == -1){
                                div.innerHTML = null;
                                eval(html);
                            }else{
                                if (html && div != null) div.innerHTML = html;
                            }
                            if (div != null && html != '') {
                                var x = div.getElementsByTagName("script");
                                for (var i = 0; i < x.length; i++) {
                                    if (x[i].src != "") $.ajax({url: x[i].src, cache: true, dataType: 'script'});
                                    eval(x[i].text);
                                }
                            }
                            break;
                        default:
                    }
                    break;
                case'page':
                    $('#ajax').attr('url',document.location.pathname);
                    try{
                        eval(html);
                    }catch(e){

                    }
                    if (typeof display_json == 'function') display_json();
                    display_json = null;
                    break;
                default:
            }
            if ((!display_reponse || (me.pathname.indexOf('/cinematheque/') != -1 && me.pathname.indexOf('/cinematheque/@') == -1))){
                log_me('JSON ['+hid+']','json',html,4);
            }else if(html != ''){
                log_me('HTML ['+hid+']','html',html,4);
            }
            if ($(me).hasClass('loadme')) loadme(me);
            LOAD = false;
        }
    });
    AjaxCallbackObj.promise()
        .done(function () {
            if (typeof func == 'function'){
                func();
            }
        })
        .fail(function () {
            console.log("Echec de l'appel ajax: " + me.pathname + " CallBack: %o", func);
        });
}
function ajaxForm(form,data,mode) {
    if (typeof data == 'object') {
        data = '{"psw":"'+form[1].value+'","usr":"'+form[0].value+'"}';
    }else if (typeof data != 'undefined' && data != '') {
        //data = '"' + data + '"';
    }
    if (form.attributes.pathname.value.indexOf('/connexion') != -1 && (mode == '' || typeof mode == 'undefined')) mode = true;
    if (!validformenr() && form.attributes.pathname.value.indexOf('creation') != -1) {
        alertify.error('Veuillez remplir ou de corriger tout les champs avant de valider');
        lbtn(0);
        return;
    }
    $.ajax({
        url: "/ajaxengine/",
        type: "POST",
        cache:true,
        beforeSend: function (xhr) {
            var txt_mode = '';
            if (mode){
                txt_mode = 'js'
            }else{
                txt_mode = 'html'
            }
            xhr.setRequestHeader('AjaxMe', mode);
        },
        data: '{"url":"' + form.attributes.pathname.value + '","options":"'+data+'"}',
        success: function (html) {
            if (!mode) {
                document.getElementById("ajax").innerHTML = html;
                var div = document.getElementById("ajax");
                var x = div.getElementsByTagName("script");
                for (var i = 0; i < x.length; i++) {
                    $.ajax({url: x[i].src, cache:true,dataType: 'script'});
                    eval(x[i].text);
                    if (LOG && logLevel >= 2) if (LOG && logLevel >= 2) console.log('%c data POST: %o%c script de page: %o', 'background:greenYellow;color:black;', unserialize(data),'background:gray;color:white;',x);
                }
            }else{
                try{
                    eval(html);
                }catch(e){
                    if (html[0] != '<'){
                        alertify.delay(0).error('[php] '+html);
                    }else{
                        alertify.delay(0).error('[php] voir la console js');
                        console.log('%c reponse du serveur non affichée: %o','background:orange;color:red;',html);
                    }
                }
                if (LOG && logLevel >= 2) console.log('%c data POST: %o%c script de page: %o', 'background:greenYellow;color:black;', unserialize(data),'background:gray;color:white;',html);
            }
        }
    });
}
function historyme(url) {
    if (typeof url != 'undefined' && url != '' && url.indexOf('connexion') == -1 && url.indexOf('creation') == -1) {
        hid++;
        history.pushState({'hid': hid, 'scroll':$('#ajax').attr('scroll')}, url, url);
        log_me('HISTO ['+hid+']','historique',null,4,'Url: '+url+' scroll:'+document.body.scrollTop,hid,true);
    }
}
function details_film(id){
    redirect("/film/voir/@"+id,"ajax_pages","sandbox","details_film");
    switch_page(0,null,1);
}


function redirect(url,path,mode,source,ia,id,tri,force,type,display_results,callback){
    var new_url = url.split('/');
    if (typeof url =='undefined' || url ==''){
        console.log('%c erreur rediect: pas de paramètre url !','bac');
        return;
    }
    if (typeof path =='undefined' || path ==''){
        path='ajaxprod';
    }else if(path == 'auto'){
        var link = url.split('/'), type;
        switch(link[1]){
            case'cinematheque':
                switch_page(1);
                path = "ajaxprod";
                type = 'js';
                break;
            case'film':
                switch_page(0);
                path = "ajax_pages";
                type = 'html';
                break;
            case'compte':
                switch_page(0);
                path = "ajax_pages";
                type = 'html';
                break;
            case'connexion':
                type = 'window';
                break;
            case'update':
                path = null;
                type = 'js';
                break;
            default:
                path = 'test-default';
                type = 'html';
        }
    }
    if (typeof ia =='undefined' || ia =='') ia='ajax';
    if (typeof type =='undefined' || type =='') type='html';
    if (typeof display_results =='undefined' || display_results =='') display_results='body';
    if (typeof id =='undefined' || id =='') id='redirect_link';
    var newlink = document.createElement('a');
    newlink.setAttribute('id', id);
    newlink.setAttribute('class', 'redirect_link');
    newlink.setAttribute('ia', ia);
    newlink.setAttribute('href', url);
    newlink.setAttribute('path', path);
    switch (mode){
        case'sandbox':
            ajax(newlink,path,type,display_results,callback);
            if (source != "popstate()") historyme(newlink.href);
            break;
        case'js':
            ajax(newlink,path,'js','',callback);
            break;
        case'direct':
            ajax(newlink,path,'html','window',callback);
            historyme(newlink.href);
            break;
        case'page':
            ajax(newlink,'ajax','html','body',callback);
            historyme(newlink.href);
            break;
    }
}
function update(url,callback){
    redirect(url,null,'js','update()','script','','','','','',callback);
}
function include(url,func,timer) {
    var statusObj = $.ajax({url: url, cache: true, dataType: 'script'});
    statusObj.promise()
        .done(function () {
            if (typeof func == 'function'){
                if(typeof timer != "undefined" && timer != "") {
                    time(timer,func);
                }else{
                    func();
                }
            }
            log_me('script chargé: '+url+' ','success',statusObj,1);
        })
        .fail(function () {
            log_me("Echec du transfert de: " + url + " CallBack:",'error',func,1);
        });
}
function exe(rules) {
    log_me('ajax:>[stack]','json',rules,4);
    var ajaxme = setInterval(function () {
        if (!LOAD && !LOADi) {
            if (typeof rules == 'object' && rules.length > 0 && rules[0] != "") {
                for (var i = 0; i < rules.length; i++) {
                    if (rules[i] != 'undefined') {
                        eval(rules[i]);
                        if (LOG && logLevel >= 7) console.log('%c ajax:>  [' + i + '] ' + rules[i],'background:orange;color:white;');
                    }
                }
                window[rules] = [];
            }
            clearInterval(ajaxme);
        }
    }, 100);
}
function exe_time(rules,delay) {
    var i=0;
    var ajaxme = setInterval(function () {
        if (i >= rules.length) clearInterval(ajaxme);
        if (!LOAD && !LOADi) {
            LOAD=true;
            if (typeof rules == 'object' && rules.length > 0 && rules[0] != "") {
                if (rules[i] != 'undefined') {
                    eval(rules[i]);
                    LOAD=false;
                    i++;
                }
            }else{
                LOAD=false;
                clearInterval(ajaxme);
            }
        }
    }, delay);
}


//SELECTION
function addpanier(obj){
    SELECTION.postMessage(['ajouter',obj]);
}
function delpanier(prodid){
    SELECTION.postMessage(['supprimer', prodid]);
}
function updatepanier(){
    SELECTION.postMessage(['update']);
}
function addvues(obj){
    VUES.postMessage(['ajouter',obj]);
}
function delvues(prodid){
    VUES.postMessage(['supprimer', prodid]);
}
function clear_vues(prodid){
    VUES.postMessage(['clear']);
    $('#Vues').html('mon historique');
}
function updatevues(){
    VUES.postMessage(['update']);
}
// IFRAME SERIES
function ep_suivant(me){
    var lid = find_link($(me).attr('ep'),$(me).attr('sa'));
    var max_ep = Number(links_data[lid].nb_ep);
    var ep = Number(links_data[lid].episode);
    var sa = Number($(me).attr('sa'));
    var sa_suiv = sa+1;
    // TODO: timeout ep-suivant delay entre chaque vidéo
    if ((ep) >= max_ep) {
        $('#saison_'+sa).scrollTop(0);
        $('#saison_'+sa_suiv).addClass('play').removeClass('blow');
        $('#toggle_'+sa_suiv).click();
        $('#s_'+sa_suiv+'ep_0').click();
    } else {
        $('#s_'+sa+'ep_'+(ep)).click();
    }
    $('#div_selector_series').addClass('boot_serie');
}
function hide_liste(mode){
    var liste = document.getElementById('div_selector_series');
    if (mode) {
        $(liste).css('margin-left', '-300px');
        //$('#screen').addClass('max');
        $('#liste').on('click',function(){
            hide_liste(false);
        });
        $('#liste').html('voir les liens');
    }else{
        $(liste).css('margin-left', '0');
        //$('#screen').removeClass('max');
        $('#liste').on('click',function(){
            hide_liste(true);
        });
        $('#liste').html('cacher les liens');
    }
}
function toggle_lecture(){
    if ($('#lecture').hasClass('switch-on')){
        LECTURE_AUTO=true;
        $('#lecture').removeClass('switch-on');
    }else{
        LECTURE_AUTO=false;
        $('#lecture').addClass('switch-on');
    }
}
function toggle_params(){
    if ($('#params').hasClass('switch-on')){
        $('.chk.new_save').each(function(){
            $(this).addClass('saved');
            $(this).html($(this).html()+' (déjà visionné)');
        });
        $('#params').removeClass('switch-on');
    }else{
        $('.chk.new_save').each(function(){
            $(this).removeClass('saved');
            $(this).html($(this).attr('before'));
        });
        $('#params').addClass('switch-on');
    }
}
function toggle_top(){
    if ($('#top').hasClass('switch-on')){
        $('#div_selector_series').removeClass('boot_serie');
        $('#div_selector_series').removeClass('boot_serie_fixed');
        $('#top').removeClass('switch-on');
    }else{
        $('#div_selector_series').addClass('boot_serie_fixed');
        $('#top').addClass('switch-on');
    }
}
function sort_links_saison(saison,liste_films){
    var TB=[];
    if (typeof liste_films != 'object') liste_films = links_data;
    for (var i=0;i<liste_films.length;i++){
        var saison_liste = liste_films[i].saison;
        if (Number(saison_liste) == Number(saison)){
            TB.push(liste_films[i]);
        }
    }
    return TB;
}
function changer_serie(me,mode,type){
    var msg,btn;
    switch (type){
        case'film':
            msg = 'ce nouveau film';
            btn = 'le nouveau film';
            break;
        case'serie':
            msg = 'cette nouvelle série';
            btn = 'la nouvelle série';
            break;
        default:
            msg = 'cette nouvelle série';
            btn = 'la nouvelle série';
    }
    if (LECTURE_ON){
        LECTURE_AUTO=false;
        alertify.okBtn("Charger "+btn)
            .cancelBtn("Annuler")
            .confirm('Voulez-vous vraiment charger '+msg+' ?', function(){
                LECTURE_AUTO=true;
                hide_iframe();
                create_film(me,mode,false);
            },function(){
                LECTURE_AUTO=true;
                min_iframe();
            });
        return LECTURE_AUTO;
    }
    return true;
}
function rideau(mode){
    $('#hover_frame').addClass('rideau');
    if (!mode){
        var time_=15000;
        if (TIMER=='off'){
            TIMER='on';
            time(time_,"$('#hover_frame').removeClass('rideau').addClass('play');$('#div_selector_series').removeClass('boot_serie');TIMER='off';");
        }
    }
}
function rideau_hide(){
    $('#hover_frame').removeClass('play');
    $('#div_selector_series').removeClass('boot_serie');
}

//FILMS js
function find_link(episode,saison){
    if (typeof links_data != 'object') return;
    for (var j=0;j<links_data.length;j++){
        if (episode == links_data[j].episode && saison == links_data[j].saison) return j;
    }
    return false;
}
function create_links(tab){
    $('body').on('click',function(e){
        var hoverf = $('#hover_frame');
        if (typeof e.originalEvent != 'undefined' && e.originalEvent.toElement == document.body && hoverf.hasClass('max')) min_iframe();
    });
    if (document.getElementById('logo_video') == null) {
        var cont_2 = document.getElementById('hover_frame');
        var logo = document.createElement('div');
        logo.setAttribute('id', 'logo_video');
        logo.setAttribute('onclick', "max_iframe();");
        logo.innerHTML = "Watch-me<em>.com</em>";
        cont_2.appendChild(logo);
    }
    if (document.getElementById('div_selector_series').childNodes.length == 0) {
        set_btn_retour('btn_retour_film','au synopsis du film','div_selector_series');
        var cont_1 = document.getElementById('div_selector_series');
        var lecture = '<div onclick="$(\'#s6\').focus().click();" class="params options_lecture controls_serie"><div class="label_btn">lecture-auto</div><span id="lecture" class="switch switch-green"><input type="checkbox" id="s6" onclick="toggle_lecture();" checked=""> <label for="s6" data-on="Oui" data-off="Non"></label> </span></div>';
        var params = '<div onclick="$(\'#s7\').focus().click();" class="params options_params controls_serie"><div class="label_btn">enregistrer les vues</div><span id="params" class="switch switch-green"><input type="checkbox" id="s7" onclick="toggle_params();" checked=""> <label for="s7" data-on="Oui" data-off="Non"></label> </span></div>';
        var top = '<div onclick="$(\'#s8\').focus().click();" class="params options_top controls_serie"><div class="label_btn">afficher ce panneau</div><span id="top" class="switch switch-on"><input type="checkbox" id="s8" onclick="toggle_top();" checked=""> <label for="s8" data-on="Oui" data-off="Non"></label> </span></div>';
        var full = '<div onclick="$(\'#s9\').focus().click();" class="params options_full controls_serie"><div class="label_btn">plein écran</div><span id="full" class="switch switch-on"><input type="checkbox" id="s9" onclick="full_screen($(\'#hover_frame\')[0]);"> <label for="s9" data-on="Oui" data-off="Non"></label> </span></div>';



        cont_1.innerHTML += lecture+params+top+full;
        var nb_saison = Number(tab[0].nb_saison)+1;
        var classe_1='ferme',classe='';
        for (var i = 1; i < nb_saison; i++) {
            classe_1 = 'controls_serie';
            var saison_tab = sort_links_saison(i, tab);
            if (typeof saison_tab == 'object' && saison_tab.length > 0) {
                var nb_ep = Number(saison_tab[0].nb_ep);
            } else {
                return;
            }
            //if (i==1) classe = '';
            var div = document.createElement('div');
            div.setAttribute('class', ' opts_div spinner ferme blow '+classe_1);
            div.setAttribute('id', 'saison_' + i);
            var li = document.createElement('li');
            li.setAttribute('class', 'head');
            var href = document.createElement('a');
            href.setAttribute('ia', 'ajax');
            href.setAttribute('id', 'toggle_'+saison_tab[i].saison);
            href.setAttribute('check', true);
            href.setAttribute('onclick', 'toggle_options(this);');
            var txt = document.createTextNode(saison_tab[i].serie + ' Saison ' + i);
            href.appendChild(txt);
            li.appendChild(href);
            div.appendChild(li);
            cont_1.appendChild(div);
            display_links.push("$('#saison_"+i+"').removeClass('blow');");
            //$('#saison_'+i).removeClass('blow');
            var k =1;
            var lecteur, lien;
            for (var j= 0; j < nb_ep; j++) (function(j,classe){
                if (typeof saison_tab[j] != 'undefined') {
                    var bouton = document.createElement('li');
                    bouton.setAttribute('class', 'filtres filtre_options ');
                    bouton.setAttribute('id', 'li_saison_' + saison_tab[j].saison);
                    var href_filtre = document.createElement('a');
                    href_filtre.setAttribute('ia', 'script');
                    href_filtre.setAttribute('id', 's_' + saison_tab[j].saison + 'ep_' + j);
                    href_filtre.setAttribute('Film_id', tab[0].film_id);
                    href_filtre.setAttribute('ep', saison_tab[j].episode);
                    href_filtre.setAttribute('sa', saison_tab[j].saison);
                    href_filtre.setAttribute('class', 'chk links controls_serie');
                    href_filtre.setAttribute('before', "Episode " + k);
                    href_filtre.setAttribute('onclick', "create_film(this,'" + saison_tab[j].lecteur + "','" + saison_tab[j].lien + "');");


                    href_filtre.innerHTML = "Episode " + k;
                    bouton.appendChild(href_filtre);
                    div.appendChild(bouton);
                    //$('#s_'+saison_tab[j].saison+'ep_'+j).on('click',function(){
                    //create_film($(this)[0],saison_tab[j].lecteur,saison_tab[j].lien);
                    //});
                    display_links.push("");
                    k++;
                }
            })(j);
            display_links.push("$('#saison_"+i+"').removeClass('spinner');");
            //if (i>=(nb_saison-1)) display_links.push("$('#saison_1').removeClass('ferme');");
            //if (i>=(nb_saison-1)) $('#saison_1').removeClass('ferme');
            //$('#saison_'+i).removeClass('spinner');
            $('#li_saison_1').addClass('first');
        }
    }
    if (typeof Vues_func == 'function') Vues_func();
    exe_time(display_links,30);
}
function rec_view(id_html,episode,saison,txt,film_id){
    var view = {"view_id":film_id+'_'+saison+'_'+episode,"uid":film_id,"elem":id_html,"ep":episode,"sa":saison,"txt":txt};
    addvues(view);
}

function create_film(me,mode,data_inject){
    var Params = {};
    Params.enregistrer_vues = true;

    var pass=true;
    var data = $(me).attr('data');
    if (typeof data == 'undefined' || data == '') data = data_inject;
    $('.boot_serie').removeClass('boot_serie');
    if (typeof me.attributes.film == 'undefined'){

        if (($(me).hasClass('loading') || $(me).hasClass('play') || $(me).hasClass('pause') || $(me).hasClass('stop')) && typeof Film != 'undefined'  && mode == 'youtube'){
            var mode = '';
            if ($(me).hasClass('loading')) mode = 'loading';
            if ($(me).hasClass('play')) mode = 'play';
            if ($(me).hasClass('pause')) mode = 'pause';
            if ($(me).hasClass('stop')) mode = 'stop';
            switch(mode){
                case'play':
                    Film.pauseVideo();
                    break;
                case'loading':
                    Film.loadVideoById(data);
                    Film.playVideo();
                    break;
                case'pause':
                    Film.playVideo();
                    break;
                case'stop':
                    ep_suivant(me);
                    break;
            }
            pass=false;
        }
        $('.screen').removeClass('fadeIn').addClass('fadeOut').removeClass('screen_top');
        $('#screen_'+mode).removeClass('fadeOut').addClass('fadeIn').addClass('screen_top');

            $('.chk.play').each(function () {
                $(this).html($(this).attr('before'));
                $(this).removeClass('pause');
                $(this).removeClass('stop');
                $(this).removeClass('play');
                $(this).addClass('deja_vu');
                $(this).html($(this).html()+' (déjà visionné)');
                if (Params.enregistrer_vues == true){
                    rec_view($(this).attr('id'),$(this).attr('ep'),$(this).attr('sa'),links_data[0].serie,Number($(this).attr('film_id')));
                }
            });
            $('.chk.loading').removeClass('play').removeClass('loading');
            $('.in_move').removeClass('in_move');
            $(me).addClass('in_move').addClass('loading').html('Chargement en cours...');

        $('#hover_frame').removeClass('rideau_depart');
        $('#hover_frame').removeClass('rideau');

    }else{
        pass=false;
        pass=changer_serie(me,mode);
    }
    if (pass) {
        var screen_mode = $('#screen_mode').attr('mode');
        var screen = document.getElementsByClassName('screen').length;
        $('.screen').not('.youtube').remove();
        var synop = links_data[find_link(1, 1)];
        var film_en_cours = links_data[find_link($(me).attr('ep'), $(me).attr('sa'))];
    }

    if (typeof $(me).attr('sa') != 'undefined') $('#hover_frame').attr('rideau', synop.serie + '\r\n Saison ' + $(me).attr('sa') + ' Episode ' + $(me).attr('ep') + ' \r\n ' + db64(film_en_cours.titre_ep));
    if(pass || document.getElementById('hover_frame') == null) {
        LECTURE_ON=true;
        if (document.getElementById('hover_frame') == null) {
            var hover = document.createElement('div');
            hover.setAttribute('id', 'hover_frame');
            hover.setAttribute('class', 'mini spinner rideau_depart play');
            hover.setAttribute('onmouseout', "out_frame();");
            hover.setAttribute('onmouseover', "in_frame();");
            var screens = document.createElement('center');
            screens.setAttribute('id', 'screens');
            screens.setAttribute('onmouseover', "out_hover();");
            var div_selector = document.createElement('div');
            div_selector.setAttribute('id', 'div_selector_series');
            div_selector.setAttribute('onmouseover', "in_hover();");
            div_selector.setAttribute('class', 'div_selector_series options boot_serie_fixed blow');
            var div_selector_series = document.createElement('div');
            div_selector_series.setAttribute('id', 'frame_selector_div');
            div_selector_series.setAttribute('class', 'frame_selector_div selector ');
            var close = document.createElement('div');
            close.setAttribute('id', 'div_close');
            close.setAttribute('class', 'div_controls');
            var txt = document.createTextNode('X');
            close.appendChild(txt);
            var min = document.createElement('div');
            min.setAttribute('id', 'div_min');
            min.setAttribute('class', 'div_controls min');
            min.innerHTML = '&#9633;';
            hover.appendChild(close);
            hover.appendChild(min);
            hover.appendChild(screens);
            hover.appendChild(div_selector);
            hover.appendChild(div_selector_series);
            document.getElementsByTagName('body')[0].appendChild(hover);
            if (typeof me.attributes.film != 'undefined') $( "<style>#hover_frame.rideau_depart:after { background: rgba(0, 0, 0, 0.7) url('/img/covers/"+links_data[0].lien+"') 0 0 no-repeat;  background-size: cover;}</style>" ).appendTo( "head" );
            $('#hover_frame').attr('rideau', synop.serie);
            $('#div_close').on('click',hide_iframe);
            $('#div_min').on('click',close_iframe);
            $('#div_selector_series').removeClass('blow');
        }

        var screens = document.getElementById('screens');
        var screen_mode_exist = document.getElementById('screen_mode');
        if (screen_mode_exist == null){
            var screen_mode_div = document.createElement('div');
            screen_mode_div.setAttribute('id', 'screen_mode');
            screen_mode_div.setAttribute('mode', mode);
            screens.appendChild(screen_mode_div);
        }else{
            $(screen_mode_exist).attr('mode',mode);
        }
        if (mode == 'youtube' && document.getElementById('screen_'+mode) == null){
            var screen_div = document.createElement('div');
                screen_div.setAttribute('id', 'screen_' + mode);
                screen_div.setAttribute('class', 'fadeOut screen screen_top '+mode);
                screen_div.setAttribute('mode', mode);
                screen_div.setAttribute('FRAMEBORDER',0);
                screen_div.setAttribute('MARGINWIDTH',0);
                screen_div.setAttribute('MARGINHEIGHT',0);
                screen_div.setAttribute('ALLOWFULLSCREEN',true);
                screens.appendChild(screen_div);
        }else if(document.getElementById('screen_'+mode) == null){
            if (typeof Film != 'undefined') Film.stopVideo();
            var screen_div = document.createElement('iframe');
                screen_div.setAttribute('id', 'screen_' + mode);
                screen_div.setAttribute('class', ' screen screen_top '+mode);
                screen_div.setAttribute('mode', mode);
                screen_div.setAttribute('FRAMEBORDER',0);
                screen_div.setAttribute('MARGINWIDTH',0);
                screen_div.setAttribute('MARGINHEIGHT',0);
                screen_div.setAttribute('ALLOWFULLSCREEN',true);
                screens.appendChild(screen_div);
        }


        switch(mode){
            case 'youtube':
                if (typeof YT != 'undefined' && typeof Film != 'undefined'){
                    max_iframe();
                    if (typeof screen_mode != 'undefined'){
                        Film.loadVideoById(data);
                        Film.playVideo();
                    }else{
                        onYouTubePlayerAPIReady();
                        console.log('%c synopsis ligne 1188 ','background:pink;color:red;');
                    }
                }else {
                    VIDEO_ID = data;
                    include("https://www.youtube.com/player_api", onYouTubePlayerAPIReady, 500);
                }
                break;
            case 'vidag':
                var vidag = document.getElementById('screen_vidag');
                if (vidag != null){
                    $(vidag).attr('src',data);
                    $(vidag).attr('onload','onload_iframe('+$(me).attr("id")+');');
                }else{
                    var iframe = document.createElement('iframe');
                    iframe.setAttribute('src',data);
                    iframe.setAttribute('class','screen screen_top ');
                    iframe.setAttribute('id','screen_vidag');
                    iframe.setAttribute('mode',mode);
                    document.getElementById('screens').appendChild(iframe);
                    $('#screen').attr('onload','onload_iframe('+$(me).attr("id")+');');
                }
                break;
            default:
                var frame = document.getElementById('screen_'+mode);
                if (frame != null){
                    $(frame).attr('src',data);
                    $(frame).attr('onload','onload_iframe('+$(me).attr("id")+');');
                }else{
                    var iframe = document.createElement('iframe');
                    iframe.setAttribute('src',data);
                    iframe.setAttribute('class','screen screen_top ');
                    iframe.setAttribute('id','screen_'+mode);
                    iframe.setAttribute('mode',mode);
                    iframe.setAttribute('FRAMEBORDER',0);
                    iframe.setAttribute('MARGINWIDTH',0);
                    iframe.setAttribute('MARGINHEIGHT',0);
                    iframe.setAttribute('ALLOWFULLSCREEN',true);
                    document.getElementById('screens').appendChild(iframe);
                    $('#screen').attr('onload','onload_iframe('+$(me).attr("id")+');');
                }
        }
    }
}
function set_synopsis(){
    for(var i=0;i<synopsis_data.acteurs.length;i++){
        document.getElementById('act').appendChild(create_links_synopsis(synopsis_data.acteurs[i],'',''));
    }
    for(var i=0;i<synopsis_data.producteur.length;i++){
        document.getElementById('prod').appendChild(create_links_synopsis(synopsis_data.producteur[i],'',''));
    }
    for(var i=0;i<synopsis_data.realisateur.length;i++){
        document.getElementById('real').appendChild(create_links_synopsis(synopsis_data.realisateur[i],'',''));
    }
    document.getElementById('date').appendChild(create_links_synopsis(synopsis_data.date,'',''));
    document.getElementById('synopsis_data').innerText = db64(synopsis_data.data);
}
function create_links_synopsis(txt,url_data,click){
    var href_link = document.createElement('a');
        href_link.setAttribute('onclick',click);
        href_link.innerHTML = txt;
    return href_link;
}
function set_stars(note){
    var noteg = Number(note);
    var color= '#6C8000';
    if (noteg >= 4.5){
        color = '#4CA500';
    } else if(noteg >= 3){
        color = '#6C8000';
    }else if(noteg >= 2 && noteg <= 3){
        color = 'orange';
    }else if (noteg < 2 && noteg != 0){
        color = '#801600';
    }else if(noteg == 0){
        color = 'gray';
    }
    var star_sel = Math.round(note);
    $('#note_complet').css('background',color);
    $('#star_complet'+star_sel).addClass('selected');
}
function do_prod(i,cont){
    var films = liste_total, class_name = '', cont = document.getElementById(cont);
    var prod_hover = document.createElement('div');
    var note_haut = document.createElement('div');
    var note = document.createElement('div');
    var nb_votes = document.createElement('div');
    var prod_hover_top = document.createElement('div');
    var prod_hover_bottom = document.createElement('div');
    var prod = document.createElement('div');
    var head = document.createElement('div');
    var link_prod = document.createElement('div');
    var foot = document.createElement('div');
    var desc = document.createElement('div');
    var desc2 = document.createElement('div');
    if (VUE_TRI == "") VUE_TRI = 'vignette';
    prod_hover.setAttribute('id', 'prod_hover' + films[i].uid);
    prod_hover.setAttribute('class', 'prodhover'+class_name);
    prod_hover_top.setAttribute('id', 'prod_hover_top' + films[i].uid);
    prod_hover_top.setAttribute('class', 'prodhover_top');
    prod_hover_top.innerHTML = "new";
    prod_hover_bottom.setAttribute('id', 'prod_hover_bottom' + films[i].uid);
    prod_hover_bottom.setAttribute('class', 'prod_hover_bottom');
    prod_hover_bottom.innerHTML = "new";
    prod.setAttribute('id', 'prod' + films[i].uid);
    prod.setAttribute('pid', films[i].uid);
    prod.setAttribute('onclick','details_film('+films[i].uid+');');
    prod.setAttribute('class', 'prod ' + VUE_TRI + ' spinner');
    head.setAttribute('class', 'headprod');
    head.setAttribute('id', 'headprod'+ LastId);

    prod.appendChild(head);
    prod.appendChild(prod_hover_top);
    prod.appendChild(prod_hover_bottom);
    cont.appendChild(prod);
    liste_total[i].lid = LastId;
    create_image(200,200,'imgprod spinner','headprod'+LastId,films[i].img,'',films[i].titre,films[i].uid);
    //$('#prod'+films[i].uid).addClass('loaded');
    $('#prod'+films[i].uid).addClass('fadeIn');
    //view_prods.push("");$('#prod"+films[i].uid+"').addClass('loaded');$('#prod"+films[i].uid+"').addClass('fadeIn');
    //view_prods.push("$('#prod"+films[i].uid+"').animate({'top':'0'},50,'swing');");
    LastId++;
}
function do_prod_virt(cont,img){
    var films = liste_total;
    if (VUE_TRI == "") VUE_TRI = 'vignette';
    cont = document.getElementById(cont);
    var prod_hover = document.createElement('div');
    prod_hover.setAttribute('id', 'prod_hover_vide_' + LastId);
    prod_hover.setAttribute('class', 'prodhover');
    var prod = document.createElement('div');
    prod.setAttribute('id', 'prod_vide_' + LastId);
    prod.setAttribute('class', 'prod vide ' + VUE_TRI + ' ');
    prod.setAttribute('data-page', PAGE);
    //prod.setAttribute('onmouseover', "animate_stars("+LastId+")");
    //prod.setAttribute('onclick','get_view();lid = find_lid('+LastId+',AjaxMe.VIEW);redirect("/film/voir/@' + LastId + '","ajax_pages","sandbox","click sur film");');
    var head = document.createElement('div');
    head.setAttribute('class', 'headprod');
    head.setAttribute('id', 'headprod'+ LastId);
    prod.appendChild(head);
    cont.appendChild(prod);
    create_image(200,200,'imgprod spinner','headprod'+LastId,img);
    view_prods.push("$('#prod_vide_"+LastId+"').addClass('loaded');$('#prod_vide_"+LastId+"').addClass('fadeIn');");
    LastId++;
}
function createProd(films, mode, cont) {
    $('.paging').remove();
    $('#ajax').find('.spinner.page').remove();
    $('.page_suivante').remove();
    var body_html = document.body, create_prods=[];
    for (var i=0;i<films.length;i++) {
        if (typeof $('#prod'+films[i].uid)[0] == 'undefined') create_prods.push('do_prod(' + find_lid(films[i].uid, liste_total) + ', "ajaxprod");');
    }
    create_prods.push("$('#ajaxprod').find('.clear').remove();");
    cont = $('#'+cont)[0];
    if (cont == "" || cont == null || typeof cont == 'undefined') cont = document.getElementById('ajax');
    exe(create_prods);
    if (PAGE > 0 && $('.prod.vide[data-page='+PAGE+']')[0] == null) do_prod_virt("ajaxprod",'trans.png');
    //exe_time(view_prods,100);
    exe(view_prods);
    var clear = document.createElement('div');
    clear.setAttribute('class','clear');
    cont.appendChild(clear);
    var paging = document.createElement('div');
    paging.setAttribute('class', 'paging');
    body_html.appendChild(paging);
}
function note_film(){

}

//IMAGES
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

//IFRAME
function full_screen(elm){
    if (typeof screenfull != 'undefined' && screenfull.enabled && !$('#s9').hasClass('none')) {
        if (screenfull.isFullscreen) {
            if (!$('#full').hasClass('switch-on')) $('#s9').addClass('none').click().removeClass('none');
            screenfull.exit();
            $('#hover_frame').removeClass('full');
        }else{
            screenfull.request(elm);
            $(elm).addClass('full');
            if ($('#full').hasClass('switch-on')) $('#s9').addClass('none').click().removeClass('none');
        }

    }
}
function is_full_screen(){
    if (screenfull.enabled) {
        document.addEventListener(screenfull.raw.fullscreenchange, function () {
            if (screenfull.isFullscreen) {
                log_me('full screen activé!','success',null,1);
                if (!$('#s9').prop('checked') && !$('#s9').hasClass('none')){
                    $('#s9').addClass('none').click().removeClass('none');
                }
            }else{
                log_me('full screen désactivé!', 'success', null, 1);
                if ($('#s9').prop('checked') && !$('#s9').hasClass('none')) {
                    $('#s9').addClass('none').click().removeClass('none');
                }
            }
        });
    }else{
        log_me('full screen non chargé!','error',null,1);
    }
}
function err_video(event){
    var btn = $('a.in_move')[0];
    switch(event.data){
        case 2:
            $(btn).html('ID de la vidéo incorrect !');
            break;
        case 5:
            $(btn).html('Erreur Html5 !');
            break;
        case 100:
            $(btn).html('Vidéo supprimée ou privée !');
            break;
        case 101:
            $(btn).html('Voir sur youtube !');
            break;
        case 150:
            $(btn).html('Voir sur youtube !');
            break;
        default:

    }
    $('.loading').removeClass('loading');
    $(btn).removeClass('loading').addClass('error');
    if (LECTURE_AUTO) {
        ep_suivant(btn);
    }
}
function update_commande(){
    var btn = $('a.in_move')[0];
    var e = JSON.parse(event.data);
    var film_en_cours = links_data[find_link($(btn).attr('ep'),$(btn).attr('sa'))];
    $('#hover_frame').attr('rideau', film_en_cours.serie.toUpperCase() + ' Saison ' + film_en_cours.saison + ' Episode ' + Number(film_en_cours.episode));
    switch(e.info){
        case -1:
            break;
        case 0:
            rideau_hide();
            $(btn).html('Arrêté.');
            $(btn).removeClass('play').removeClass('pause').removeClass('error').removeClass('loading').addClass('stop');
            $(btn).addClass('deja_vu');
            $(btn).html($(btn).html()+' (déjà visionné)');
            if (LECTURE_AUTO) ep_suivant(btn);
            break;
        case 1:
            rideau();
            $(btn).html(' Lecture en cours... (épisode '+$(btn).attr("ep")+')');
            $('#saison_'+Number($(btn).attr("sa"))).removeClass('controls_serie').removeClass('blow').addClass('play');
            $(btn).removeClass('loading').removeClass('pause').removeClass('error').removeClass('stop').addClass('play');
            break;
        case 2:
            rideau(true);
            $(btn).html('En pause...');
            $(btn).removeClass('play').removeClass('loading').removeClass('error').removeClass('stop').addClass('pause');
            break;
        case 3:
            rideau(true);
            $(btn).html('Lancement...');
            $(btn).removeClass('play').removeClass('pause').removeClass('error').removeClass('stop').addClass('loading');
            break;
        case 5:
            $(btn).html('En attente...');
            $(btn).removeClass('play').removeClass('pause').removeClass('error').removeClass('stop').addClass('loading');
            break;
        default:

    }
}
function onYouTubePlayerAPIReady() {
    Film = new YT.Player('screen_youtube', {
        height: '390',
        width: '640',
        events: {
            'onReady': max_iframe,
            'onStateChange': update_commande,
            'onError':err_video
        },
        playerVars: { 'autoplay': 0, 'theme': 'light', 'color': 'white', 'controls': '2', 'fs': '0', 'hl': 'fr', 'iv_load_policy': '3', 'rel':'0','showinfo':'0' }
    });
    onload_iframe('','youtube');
    console.dirxml(Film);
    console.groupEnd();
}
function onload_iframe(id,mode) {
    var btn = $('.chk.in_move');
    rideau();
    if (btn != null && mode != 'youtube') {
        $(btn).html('votre vidéo est prête.');
        $(btn).removeClass('loading').removeClass('pause').removeClass('error').removeClass('stop').addClass('play');
    }

    max_iframe(mode);
}
function view_iframe(){
    $('#hover_frame').removeClass('fadeOut').addClass('fadeIn');
}
function max_iframe(){
    if(links_data[0].serie != ""){
        $('#frame_selector_div').remove();
        create_links(links_data);
        exe_time(display_links,3);
    }else{
        $('#frame_selector_div').html($('#selector').html());
        display_selector(true);
        document.getElementById('frame_selector_div').style.marginLeft = document.getElementById('selector').style.marginLeft;
    }
    $('#box').addClass('blow');
    $('.menu').addClass('blow');
    $('#hover_frame').removeClass('mini').addClass('fadeIn').addClass('max');

}
function close_iframe(){
    if (document.getElementById('screen_'+$('#screen_mode').attr('mode')).src != ''){
        if (!$('#hover_frame').hasClass('mini')){
            min_iframe();
        }else{
            max_iframe();
        }

    }else{
        hide_iframe(true);
        rideau_hide();
    }
    $('#box').removeClass('film');
}
function min_iframe(){
    $('.menu').removeClass('blow');
    rideau_hide();
    display_selector(false);
    $('#hover_frame').addClass('fadeIn').addClass('mini').removeClass('max');
    $('#txt_iframe').html('agrandir la vidéo');
    $('#frame_selector_div').html('');
    $('#top_menu').removeClass('hide').removeClass('gray');
    $('#box').removeClass('blow');
}
function hide_iframe(ev,close){
    LECTURE_ON=false;
    rideau_hide();
    if (!close){
        $('#hover_frame').remove();
        display_selector(false);
        $('#frame_selector_div').html('');
    }
    $('#top_menu').removeClass('hide').removeClass('gray');
    $('#hover_frame').addClass('fadeOut');
    $('#hover_frame').removeClass('fadeIn');
    $('#hover_frame').removeClass('max');
    $('#hover_frame').removeClass('mini');
    $('#frame_selector_div').html('');
}

//VERIFICATION FORM
function tstconnectmail(mail){
    if (mail !== "") {
        var reg = new RegExp('^[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*@[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*[\.]{1}[a-z]{2,6}$', 'i');
        var reponse = reg.test(mail);
        if (!reponse) {
            alertify.error("L'adresse mail n'est pas correctement formatée.");
            $('#usr').addClass('error');
            $('#usr').removeClass('success');
        }else{
            $('#usr').addClass('success');
            $('#usr').removeClass('error');
        }
    }
}
function tstmail(mail, opt) {
    if (mail !== "") {
        var reg = new RegExp('^[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*@[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*[\.]{1}[a-z]{2,6}$', 'i');
        var reponse = reg.test(mail);
        id = 'mail';
        if (opt) id = 'parrain';
        switch (reponse) {
            case true:
                $.ajax({
                    url: '/ajaxengine/',
                    method: 'post',
                    cache:true,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('AjaxMe', 'js');
                    },
                    data: '{"url":"/compte/verifier.mail/","options":""}',
                    success: function (reponse) {
                        eval(reponse);
                        if (LOG && logLevel >= 4) console.dirxml(reponse);
                        var rep = liste.indexOf(mail);
                        if (rep == '-1') {
                            if (opt) alertify.error("Votre parrain n'a pas été trouvé.");
                            $('#' + id).removeClass('error');
                            $('#' + id).addClass('success');
                            if (opt) {
                                $('#' + id).addClass('error');
                                $('#' + id).removeClass('success');
                            }
                        } else {
                            if (opt) {
                                alertify.success("Votre parrain a été informé de votre présence au sein de la communauté.");
                                $('#' + id).removeClass('error');
                                $('#' + id).addClass('success');
                            } else {
                                alertify.error("Cette adresse mail est déjà utilisée.");
                                $('#' + id).addClass('error');
                                $('#' + id).removeClass('success');
                            }

                        }
                    }
                });
                break;
            case false:
                alertify.error("L'adresse mail n'est pas correctement formatée.");
                $('#' + id).addClass('error');
                $('#' + id).removeClass('success');
                break;
        }
    }
}
function tstmdp(el1, el2, x) {
    var el1v = el1.value;
    var el2v = el2.value;
    if (el1v !== el2v) {
        if (x) alertify.error("Les mots de passe ne correspondent pas.");
        $('#' + el1.id).addClass('error');
        $('#' + el1.id).removeClass('success');
        $('#' + el2.id).addClass('error');
        $('#' + el2.id).removeClass('success');
    } else {
        if (el1v.length > 5) {
            $('#' + el1.id).removeClass('error');
            $('#' + el1.id).addClass('success');
            $('#' + el2.id).removeClass('error');
            $('#' + el2.id).addClass('success');
        } else {
            alertify.error("Votre mot de passe doit comporter au moins 6 caractères.");
        }
    }
}
function CheckDate(d) {
    var amin = 1850;
    var amax = 2500;
    var a = (d.substring(0, 4));
    var m = (d.substring(5, 7));
    var j = (d.substring(8));
    var ok = 1;
    if (((isNaN(j)) || (j < 1) || (j > 31)) && (ok == 1)) {
        alertify.error("Le jour n'est pas correct.");
        ok = 0;
    }
    if (((isNaN(m)) || (m < 1) || (m > 12)) && (ok == 1)) {
        alertify.error("Le mois n'est pas correct.");
        ok = 0;
    }
    if (((isNaN(a)) || (a < amin) || (a > amax)) && (ok == 1)) {
        alertify.error("L'année n'est pas correcte.");
        ok = 0;
    }
    if (ok == 1) {
        var d2 = new Date(a, m - 1, j);
        var a2 = d2.getYear();
        if (a2 <= 100) a2 = 1900 + a2;
        ok = d2;
    }
    return ok;
}
function getage() {
    var d = CheckDate($('#date').val());
    var m = new Date();
    var age = "";
    var age_a = 0;
    var age_m = 0;
    if (d != 0) {
        if (d.getTime() > m.getTime()) {
            alertify.error("La date de naissance est supérieure à la date du jour !");
        }
        age_a = m.getFullYear() - d.getFullYear();
        m.setYear(d.getYear());
        if ((d.getTime() > m.getTime()) && (d.getMonth() - m.getMonth() != 0)) {
            age_a--;
        }
        if (d.getMonth() >= m.getMonth()) {
            age_m = 12 - (d.getMonth() - m.getMonth())
        } else {
            age_m = (m.getMonth() - d.getMonth())
        }
        if (age_m == 12) {
            age_m = 0;
        }
        if (age_a == 1) {
            age = age_a + " an"
        }
        if (age_a > 1) {
            age = age_a + " ans"
        }
        if ((age_a > 0) && (age_m > 0)) {
            age += " et "
        }
        if (age_m > 0) {
            age += age_m + " mois"
        }
        if (age == "") {
            age = "moins de 1 mois"
        }
    } else {
        $('#date').addClass('error');
        $('#date').removeClass('success');
    }
    document.getElementById('age').value = age;
    $('#date').addClass('success');
    $('#date').removeClass('error');
    if (age_a > 12) {
        $('#age').addClass('success');
        $('#age').removeClass('error');
    } else {
        $('#age').addClass('error');
        $('#age').removeClass('success');
        alertify.error('Vous devez avoir au moins 13 ans pour vous inscrire sur le site.')
    }
}
function tstpseudo(pseudo) {
    $.ajax({
        url: '/ajaxengine/',
        method: 'post',
        cache:true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('AjaxMe', 'js');
        },
        data: '{"url":"/compte/verifier.pseudo/","options":"' + pseudo + '"}',
        success: function (reponse) {
            eval(reponse);
            var rep = liste.indexOf(pseudo);
            if (rep == '-1') {
                $('#user').removeClass('error');
                $('#user').addClass('success');
                return true;
            } else {
                $('#user').addClass('error');
                $('#user').removeClass('success');
                alertify.error("Ce pseudo est déjà réservé.");
                return false;
            }
        }
    });
}
function inputpsw(me) {
    var elm = me.value;
    if (elm.length > 5) {
        $('#' + me.id).removeClass('error');
        $('#' + me.id).addClass('success');
    } else {
        $('#' + me.id).addClass('error');
        $('#' + me.id).removeClass('success');
    }
    if (document.getElementById('rpsw').value != "") {
        tstmdp(me, document.getElementById('rpsw'), false);
    }
}
function tstphone(me, mode, opt) {
    var regex = new RegExp(/^(01|02|03|04|05)[0-9]{8}/gi);
    if (opt) regex = new RegExp(/^(06|07)[0-9]{8}/gi);
    if (regex.test(me.value)) {
        $('#' + me.id).removeClass('error');
        $('#' + me.id).addClass('success');
    } else {
        $('#' + me.id).addClass('error');
        $('#' + me.id).removeClass('success');
        var msg = "Ce numéro de téléphonne n'est pas valide, veuillez entrez un numéro français sur 10 chiffres.";
        if (opt) msg = "Ce numéro de téléphonne n'est pas valide, veuillez entrez un numéro de mobile français commencant par 06 ou 07 sur dix chiffres";
        if (mode) alertify.error(msg);
    }
}
function tstcode() {
    var entree = document.getElementById('code').value;
    var l = entree.length;
    if (l !== 5) {
        alertify.error('Le code postal doit comporter cinq chiffres.');
        return false;
    }
    var mod = '0123456789';
    var error = false;
    if (mod.indexOf(entree.charAt(0)) < 0) error = true;
    if (mod.indexOf(entree.charAt(1)) < 0) error = true;
    if (mod.indexOf(entree.charAt(2)) < 0) error = true;
    if (mod.indexOf(entree.charAt(3)) < 0) error = true;
    if (mod.indexOf(entree.charAt(4)) < 0) error = true;
    if (error) {
        alertify.error("Le code postal n'est pas valide.");
        $('#code').addClass('error');
        $('#code').removeClass('success');
        return false;
    } else {
        $('#code').removeClass('error');
        $('#code').addClass('success');
        return true;
    }
}
function cgv() {
    alertify.set({
        labels: {
            ok: "Accepter",
            cancel: "Refuser"
        }
    });
    alertify.confirm('<div id="cgv"><img src="data:image/gif;base64,R0lGODlhEAAQAPf/AJzC3aWlpdvb29TU1KrN5Yisxe3t7Wal0JrL6/j4+MfHx5miqLq6uoaNknSasvDw8b+/v9LS0pi/2YeapneSpXiz27rBx8TExKXL5L3L1FyLqujo6K6urs7OzsvQ09TZ3dHW2nqNmra9wsHBwZTC4bzS4qTT84DG9V6i0HvD9KvR66Kioqeusvb29l57j3m+7Wu15qizu4TB6kd6nYmisozK9HK77cLCwoXJ9rvP3Mzb5pTL8W2985vQ9Gufw+fn573Eyo2NjbKysqqqqpW2zWWNqMnJyeTt89zc3LbDy5qampfF5WKo14bL+ZaWl7XI1bfK2KTD18XS28jU3YypvI+Pj3XG/evv8ba2tqy+ynGkxu3x8uTx+qK5ycXZ5YnE68LW4+vz+Ia32Fyfy5yqtEqBppzO73rG+bvW6JSqupHG6unw9dvq9aPP7X7I+eDo7Yq21OXo6cLL0a/N4XK+8crMzmyx33q755CYnnDE/IjH8M7X3bLF0svP0nbF+bDT6nLE/G7B+cLFx3Gz4NPo9oqlt9LV1qysrNnb3F6Yv7G+yKvF1lKKsPL19+js74Wgsc7V28LO1oq/45ycnGaz5qKlpY+hrZOTk7y/wXPG/oKmvqbI33F7gqDA1rK2uXKOosfN0sTL0L/DxH7A7ICz1nmlw9rd34KLkNfX19nZ2dbW1tHR0evr6+/v79DQ0Orq6v////r6+vv7+83NzeDg4N7e3r29ve7u7vPz8/X19aioqKGhoXt7e4uLi7CwsHHG/3LE+3HF/qu8yNDR0q/J232rysfP1Iy512aGnKGwu4Cow6K/0sPM0svV3HHB9ri7vGm37NjZ27jG0Nbb38XFxcXGx5ywvcTHyM/T1tvn8GSv4n2336/Q5Xyftq/I19bX2KSrsJ+lqcHZ68rX4Nra2pjI6IG43MjLzZScon+RnKW3xNTW2GuSrJOntJWqtrq9vo293Wi054uSmGm57vT29srT2L3Z7Nvn7+/y9d3d3bGysmiWte71+MvLy8zMzOjo6CH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpENEY3RDAyNzgwRTJFMDExQjEyOEI0RDQxRUQ5OTY1NyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3MjVCRkRDMEUyODAxMUUwQjg5MkVBRUExMjUxQzdGRiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3MjVCRkRCRkUyODAxMUUwQjg5MkVBRUExMjUxQzdGRiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1LjEgV2luZG93cyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkQ1RjdEMDI3ODBFMkUwMTFCMTI4QjRENDFFRDk5NjU3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkQ0RjdEMDI3ODBFMkUwMTFCMTI4QjRENDFFRDk5NjU3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Af/+/fz7+vn49/b19PPy8fDv7u3s6+rp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M/OzczLysnIx8bFxMPCwcC/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramloZ2ZlZGNiYWBfXl1cW1pZWFdWVVRTUlFQT05NTEtKSUhHRkVEQ0JBQD8+PTw7Ojk4NzY1NDMyMTAvLi0sKyopKCcmJSQjIiEgHx4dHBsaGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQAAIfkEBQoA/wAsAAAAABAAEAAACO0A/wn8l4RGkRlFaCgayDAaBQ2JUDBBkUhDCBAMEYXoRuqOszzO7pDqFuLbQHTtOi3RY+WXFT1LOrnD8+MftQVJoGz6wwUWlz+boCQJB+GfEAZ1QklJYOCfgQT1QtVhwOEfh2quFGxg6BSrgiFGZ0WAUJMhKwgROgj5gXaALVVckTAY4HaDv1WqLhziymGEqgH9/uWbhaoDhwAd/q0KcIhwBwH/Wq1ChaqfLydBnHAwogqVqwcCHwxIhWpVtRHUXKFKNeDB1n+vWghIJaB27VTkcrFi+CpWK1q1UtWiZSDWbq7/biWQBUtWglZcAwIAIfkEBQoA/wAsAQAAAA4ACQAACGoA/wkcsSCdi08CEwpMdenUhELKtPxjVCShgCC7PCmKsmSUDUpjNID4N0nXCCNyiJU7kSkPjwMO/q244K+foS0CewA7c0eLon/+/K1S+K+NHjVw0hBV6AgAhihKlyYUlgNKMqkJn2GrJyIgACH5BAUKAP8ALAQAAAALAAwAAAhoAG+sqMKpgSUR/xL+66WkEpl2Dop8UogFwgVpUeBV8KHwX79+GTapOfGPyb6EAx78C2PCTzAeY7J0TNgjDyAYymb+O/LCzahSOv+J2aGmmE4BRAhgIBJUUYkcT4LWgZThQ9B/3zz8CwgAIfkEBQoA/wAsBgAAAAkADgAACG8A//EKsgLCv4P/AgwJoKRBg3UIFVzAFMNSCIj/+vUL9aSTMgobDuJqtqmcJC2KEP7jpufEoAIq/9GxwuNAzHi/8jBROc2OFSt2VKbZhuMMiYPDwhVaskMGGIQs+HBrs2kLwj5TSsy5EnPPuEYHAwIAIfkEBQoA/wAsBgABAAkADgAACG8A/wn8F6SKqoECIWBZEQQVwn5GRgxR8mOgqn7ngCzAhBBbBihdyCB0FAUDACoI/4nZoaYYwg//3OAghVAZpUx+Bnp4NIbHLx5o/p2iUOqOnzwyWv1TtGxJDTcpjvybNg5Nmx1mwgg0NcWLODYIAwIAIfkEBQoA/wAsAwAEAAwACwAACGcA/wkcKNDfhQAQCA4c4M8fAw4KBRoQ5AEIuIgCheWAkgzjNCIECHTBSGXbDgSLBFaq889Yt38vcHzxIpBFOmQaxkADdkaNQBCRlsHZRidPsIGI9oD5Y6aGmzw1CF7RgcZMDxOECAYEACH5BAUKAP8ALAEABgAOAAkAAAhpAP8JHEiwmisFQwgq/AchQgchCwciYTBggK1/hiyAU8jCgqEB/UJNgULlETOBNAo9mQIKUaQS3EhoYVSGkRYJ3EpEevBvTpsdo2BoizdqR5s5VwQ2UlHDTaZfmf7VUMFPIRsTTfI0WRgQACH5BAUKAP8ALAAABQAPAAoAAAhyAPX9G0iwYEEWQPpcM8gwGZQcwhga7EKAABFIEgl6K7fDnCaDHEaoGqhDBo4XKBwMdBXg0CxUHQT8W3ImzzwUGpClY2FEFSpXA9ekCJaHzjY4yzKASDXgAUF+NQD9q2HmD5g95HIZlEXoXw8zaHQ4KhgQACH5BAUKAP8ALAAABAALAAsAAAhiAKstEPWvoMGCMdRlkDPsYME0UeYsiuPwX4ElCI5RdAhHD45BzSoCSGElXqmKXnj84jGmG6h/qwx+yQPIhhYKp5xwOHgGh5pOWQS5QmXQTA0zf8B8EJDKYCw29tCAmUbLQEAAIfkEBQoA/wAsAAABAAkADgAACGoA//2LJu+UwIOIQliKgengvwmaOj2RczCJD0nlNk05WGDQCT0EHGrhYYXOPYdMAv2K5/BfBWBW7LQUiGMbFYc6ZOxYQmVBh4Ob2nDjw8JJEIFb5pSY4qHaCGoC6e3ZI6CqAIe3aNVKVSsgACH5BAUKAP8ALAAAAAAJAA8AAAhwAP8J/GfBUjpODQR+oKDBAQ0y4f5N0zCmAjwAfET9c4CCRwo9GKCc4zOGRzBAZtYM/Ocnz46VymTgeJFtZYElCI6t/NeFALcu61ZmyCHFwqGVpuSA6MAhwMphqFD187XywYBUqFbtbCEg1c6BrVYGBAAh+QQFCgD/ACwAAAAACwAMAAAIZgD/CfyXhMYnFyEWYBrIjlEiLcoKTWgw8B8lG6OWRFHkSeCBf3kynShHTM4/ID5GncnTg8s/fAKtwVGjx0xFgWmiYADw5ua/ZFByCPvhU4QHbO9U+fS3StUFn//yzUIFVeCqqv8CAgA7"></div>');
    $.ajax({
        url: 'templates/cgv.tpl', method: 'get', success: function (reponse) {
            $('#cgv').html(reponse);
        }
    });
    alertify.set({
        labels: {
            ok: "ok",
            cancel: "annuler"
        }
    });
}
function tstval(me, val, int) {
    if (typeof int == 'undefined') int=1;
    if (me.value != '' && (me.value.length >= int)) {
        $('#' + me.id).removeClass('error');
        $('#' + me.id).addClass('success');
    } else {
        $('#' + me.id).removeClass('success');
        $('#' + me.id).addClass('error');
        alertify.error('Vous devez entrer un' + val + '.');
    }
}
function validformenr() {
    if ($('#nom').hasClass('error') || $('#nom').val() == '') return false;
    if ($('#prenom').hasClass('error') || $('#prenom').val() == '') return false;
    if ($('#date').hasClass('error') || $('#champ_date').val() == '') return false;
    if ($('#mail').hasClass('error') || $('#mail').val() == '') return false;
    if ($('#psw').hasClass('error') || $('#psw').val() == '') return false;
    if ($('#usr').hasClass('error') || $('#usr').val() == '') return false;
    if ($('#rpsw').hasClass('error') || $('#rpsw').val() == '') return false;
    if ($('#adresse').hasClass('error') || $('#adresse').val() == '') return false;
    if ($('#code').hasClass('error') || $('#code').val() == '') return false;
    if ($('#ville').hasClass('error') || $('#ville').val() == '') return false;
    if ($('#mob').hasClass('error') || $('#mob').val() == '') return false;
    return true;
}
function verif_usr(data){
    if (data.psw == "" || data.usr == ""){
        alertify.error('Veuillez remplir tout les champs.');
        $('#u2').click();
        return false;
    }else{
        return true;
    }
}

// FONCTIONS SPECIALES
function find_lid(uid,liste_films){
    if (typeof liste_films != 'object') liste_films = liste_total;
    for (var j=0;j<liste_films.length;j++){
        if (uid == liste_films[j].uid) return j;
    }
    return false;
}
function set_lid(obj_prod){
    for(var i=0;i<obj_prod.length;i++){
        obj_prod[i].lid = i;
    }
}
function isDescendant(parent, child) {
    var node = child.parentNode;
    while (node != null) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}
function time(int,script){
    window.setTimeout(function (){eval(script);},int);
}
function killme(){
    $('.killme').remove();
}
function unserialize(serializedString){
    var str = decodeURI(serializedString);
    var pairs = str.split('&');
    var obj = {}, p, idx, val;
    for (var i=0, n=pairs.length; i < n; i++) {
        p = pairs[i].split('=');
        idx = p[0];

        if (idx.indexOf("[]") == (idx.length - 2)) {
            // Eh um vetor
            var ind = idx.substring(0, idx.length-2)
            if (obj[ind] === undefined) {
                obj[ind] = [];
            }
            obj[ind].push(p[1]);
        }
        else {
            obj[idx] = p[1];
        }
    }
    return obj;
}
function listenner(element, evnt, func){
    if (element.attachEvent)
        return element.attachEvent('on'+evnt, func);
    else
        return element.addEventListener(evnt, func, false);
}
function logoff() {
    document.getElementById('client').innerHTML = 'Mon compte';
    $('#client').css('padding-left','10px');
    $('#client').removeClass('connect');
    redirect('/compte/deconnexion/','ajax','js','logoff()','ajax','LOGOFF');
    LOGIN = false;
    window.document.location.reload();
}
function connect(nom,prenom) {
    if (nom != null && prenom != null) {
        $('#client').addClass('connect').removeClass('boot').addClass('loaded');
        $('.client').find('.spinner').fadeOut('slow');
        $('#client').html("" + nom + ' ' + prenom);
    }else{
        $('.client').find('.spinner').fadeOut('slow');
        $('#client').html('Mon compte');
    }
}
function ready_me(script) {
    $(document).ready(function () {
        eval(script);
    });
}
function verif_co(){
    if (typeof Usr != 'undefined' && typeof Usr == 'object'){
        $('#u1').remove();
        $('#u2').remove();
        $('#u3').css('display','block');
        $('#connect_com_logged').removeClass('blow');
        $('#connect_com').addClass('blow');
        $('#user_com').html('connecté en tant que: <em>'+Usr.prenom+' '+Usr.nom+'</em>');
        $('#pseudo').val(Usr.prenom+' '+Usr.nom);
        $('#connect_com').css('display','none');
        $('.new_comment').removeClass('log');
        LOGIN = true;
        return true;
    }else{
        $('#client').removeClass('boot').addClass('loaded');
        $('#connect_com_logged').css('display','none');
        $('#connect_com').removeClass('blow');
        $('#connect_com_logged').addClass('blow');
        $('#connect_com').css('display','block');
        $('.new_comment').addClass('log');
    }
    LOGIN = false;
    return false;
}
function cn(a, b) {
    return a - b;
}
function b64(str){
    str = str.replace("'","\'");
    str = str.replace('"','\"');
    return window.btoa(encodeURIComponent(str))
}
function db64(str){
    if (typeof str != 'undefined' && str != ''){
        return decodeURIComponent(window.atob(str));
    }
}
function createObjectStore(dataBase,name_store){
    dataBase.createObjectStore(name_store);
}
(function(win){
    var listeners = [],
        doc = win.document,
        MutationObserver = win.MutationObserver || win.WebKitMutationObserver,
        observer;
    function is_ready(selector, fn){
        listeners.push({
            selector: selector,
            fn: fn
        });
        if(!observer){
            observer = new MutationObserver(check);
            observer.observe(doc.documentElement, {
                childList: true,
                subtree: true
            });
        }
        check();
    }
    function check(){
        for(var i = 0, len = listeners.length, listener, elements; i < len; i++){
            listener = listeners[i];
            elements = doc.querySelectorAll(listener.selector);
            for(var j = 0, jLen = elements.length, element; j < jLen; j++){
                element = elements[j];
                if(!element.is_ready){
                    element.is_ready = true;
                    listener.fn.call(element, element);
                }
            }
        }
    }
    win.ready = is_ready;
})(this);
function createCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {
    createCookie(name,"",-1);
}
//SELECTOR
function out_selector_js(){

}
function in_selector_js(){

}
function selecteur_page(mode){
    var max_obj = $('#selector').find('div.img').length;
    var u_width = window.innerWidth;
    var max_obj_screen = Math.round(u_width/113);
    var nb_margins = Math.round(max_obj/max_obj_screen);
    var new_val="";

    var current_margin = $('.selector').css('margin-left');
    current_margin = current_margin.replace('-','');
    current_margin = current_margin.replace('px','');
    current_margin = Math.round(Number(current_margin));
    var nb_current_margin = Math.round(current_margin/u_width);
    if ((((nb_current_margin == 0 || nb_current_margin == 1)&& !mode) || nb_current_margin == 0 && mode) && current_margin > 0){
        new_val = 0;
    }else{
        new_val = nb_current_margin+1;
        if (!mode) new_val = nb_current_margin-1;
    }
    new_val = new_val*u_width;

    if (mode && nb_current_margin < nb_margins){
        $('.selector').css('margin-left','-'+new_val+'px');
    }
    if (!mode && nb_current_margin <= nb_margins){
        $('.selector').css('margin-left','-'+new_val+'px');
    }
    read_lazy_selector(nb_current_margin);
}
function set_selector(pid){
    var selector = document.getElementById('selector');
    var global = document.getElementById('global');
    var u_width = Math.floor((window.innerWidth)/113);
    var obj_in_page = 0;
    var page_selector = 1;
    var nb_total_pages = (Math.round(AjaxMe.VIEW.length/u_width))+1;

    if ($('#frame_selector_div').find('.img').length > 0) selector = document.getElementById('frame_selector_div');
    get_view();
    $('.selector').css("width",(Number(AjaxMe.VIEW.length)+7)*113+"px");
    for(var i=0;i<AjaxMe.VIEW.length;i++){
        LastId++;
        if (obj_in_page >= u_width){
            page_selector++;
            obj_in_page=0;
        }
        obj_in_page++;
        var classe = "";
        if (pid == AjaxMe.VIEW[i].uid){
            classe ="select";
            var nbprod = i;
        }
        create_image(110,110,'imgprod loads '+classe,'selector',AjaxMe.VIEW[i].img,'$(this.parentNode).addClass("spinner");redirect("/film/voir/@' + AjaxMe.VIEW[i].uid + '","ajax_pages","sandbox","click sur selecteur");',AjaxMe.VIEW[i].titre,null,true);

        LAZY_selector.push({"page":page_selector,"obj":obj_in_page,"func":"readImage("+AjaxMe.VIEW[i].img+","+LastId+",null,false,null)","html_obj":LastId});
    }
    if (document.getElementById('btn_right') == null || document.getElementById('btn_left') == null) {
        if (document.getElementById('btn_right') == null) {
            var btn_right = document.createElement('div');
            btn_right.setAttribute('class', 'btn_right controls_selector');
            btn_right.setAttribute('id', 'btn_right');
            btn_right.setAttribute('onclick', 'selecteur_page(1);');
            btn_right.setAttribute('onmouseover',"display_ui_selector();");
            global.appendChild(btn_right);
        }
        if(document.getElementById('btn_left') == null){
            var btn_left = document.createElement('div');
            btn_left.setAttribute('class', 'btn_left controls_selector');
            btn_left.setAttribute('id', 'btn_left');
            btn_left.setAttribute('onclick', 'selecteur_page(0);');
            btn_left.setAttribute('onmouseover',"display_ui_selector();");
            global.appendChild(btn_left);
        }
    }
    if (nbprod > 0){
        selector.style.marginLeft = -113*nbprod+'px';
    }else{
        selector.style.marginLeft = '0px';
    }
}
function read_lazy_selector(page){
    page+1;
    var u_width = Math.floor((window.innerWidth)/113);;
    if (typeof LAZY_selector != 'undefined' && typeof LAZY_selector == 'object'){
        for (var i=0;i<LAZY_selector.length;i++){
            if (LAZY_selector[i].page >= page && LAZY_selector[i].page <= page+2){
                var fn = LAZY_selector[i];
                if (fn.page == page){
                    if (fn.obj > 0){
                        eval(fn.func);
                        if (LOG && logLevel > 10){
                            console.dirxml($('#imgFilm'+fn.html_obj)[0]);
                            console.log('page du selecteur '+page+' affichée | func: '+fn.func+' page: '+fn.page+' obj: '+fn.obj);
                        }
                        LAZY_selector[i].func = '';
                    }
                }else if(fn.page == page+2){
                    if (fn.obj <= u_width){
                        eval(fn.func);
                        if (LOG && logLevel > 10){
                            console.dirxml($('#imgFilm'+fn.html_obj)[0]);
                            console.log('page du selecteur '+page+' affichée | func: '+fn.func+' page: '+fn.page+' obj: '+fn.obj);
                        }
                        LAZY_selector[i].func = '';
                    }
                }else if (fn.page == page+1){
                    eval(fn.func);
                    if (LOG && logLevel > 10){
                        console.dirxml($('#imgFilm'+fn.html_obj)[0]);
                        console.log('page du selecteur '+page+' affichée | func: '+fn.func+' page: '+fn.page+' obj: '+fn.obj);
                    }
                    LAZY_selector[i].func = '';
                }
            }
        }
    }else{
        if (LOG && logLevel > 1) console.log('tableau Lazy selector non defini ou mal strucuturé! >read_lazy_selector()')
    }
}
function hide_ui_selector(){
    $('.controls_selector').removeClass('fadeIn');
}
function display_ui_selector(){
    $('.controls_selector').addClass('fadeIn');
}
function display_selector(mode){
    if (mode){
        $('#selector').removeClass('fadeIn').addClass('fadeOut');
    }else{
        $('#selector').removeClass('fadeOut').addClass('fadeIn');
    }
}
function update_selector(pid){
    $('.img.blank').removeClass('spinner');
    var selector = document.getElementById('selector');
    if ($('#frame_selector_div').find('.img').length > 0){
        selector = document.getElementById('frame_selector_div');
    }else if ($('#'+$(selector).attr('id')).find('.img').length <= 0){
        set_selector(pid);
    }
    get_view();
    for(var i=0;i<AjaxMe.VIEW.length;i++){
        if (pid == AjaxMe.VIEW[i].uid) var nbprod = i;
    }
    LastId++;
    var u_width = ((window.innerWidth/2)/113)-2;
    var p_width = Math.round(window.innerWidth/113);
    var new_val='', page_en_cours = 0;
    if ($('#frame_selector_div').find('.img').length > 0)  document.getElementById('selector').style.marginLeft = -113 * (nbprod - u_width) + 'px';
    if(nbprod > u_width){
        new_val = -113*(nbprod-u_width);
    }else{
        new_val = 0;
    }
    selector.style.marginLeft = new_val+'px';
    if (typeof selector.childNodes != 'undefined' && selector.childNodes.length > 1 && selector.childNodes.length >= nbprod+1) {
        page_en_cours = (Math.abs(new_val)/113)/p_width;
        read_lazy_selector(Math.round(page_en_cours));
        $('.select').removeClass('select');
        $(selector.childNodes[nbprod].childNodes[0]).addClass('select');
        $(selector.childNodes).css('z-index','');
        $(selector.childNodes[nbprod]).css('z-index','6').addClass('select');
        if ($('#frame_selector_div').find('.img').length > 0){
            $(document.getElementById('selector').childNodes[nbprod].childNodes[0]).addClass('select');
        }
    }else{
        $(selector).html('');
        LastId++;
        set_selector(pid);
    }
}

//COMMENTAIRES
function verif_com(pid){
    var uid = 'guess';
    if (verif_co()) uid = Usr.uid;
    var pseudo = $('#pseudo').val();
    var mail = $('#mail').val();
    var commentaire = $('#new_commentaire').val();
    var note = $('.note_com.new').html();
    Number(note);
    if (uid != '' && uid != 'guess') mail = 'none';
    if ((note != 0 && note >= 1 && note < 6) && commentaire != '' && mail != '' && pseudo != '' && !$('#new_comment input').hasClass('error')){
        $('#page_com').html('1');
        //scroll_view('top');
        $('.comment.first').css('margin-top','0px');
        $('.first').removeClass('first');
        var cid = createCom(pid,pseudo,commentaire,note,mail,uid,'',true);
        $('#com_'+cid).addClass('fadeIn').addClass('first');;
        tilc('#com_'+(cid),'set-focus',500);
        redirect('/update/note/@'+pid,'sandbox','js','verif_com()','ajax');
        clear_com();
        make_star();
        return true;
    }
    return false;
}
function loop_coms(add){
    if (typeof liste_coms != 'undefined') {
        var create_com = [], notes_coms_total = 0, note_b = 0, note_h = 0, display_ui = [];
        var nb_pages = liste_coms.length / 5;
        //if (liste_coms.length < 1) $('#toggle_comment').click();
        if (liste_coms.length < 6){
            $('#toggle_view_com').addClass('disabled');
            $('#comment_suiv').addClass('disabled');
        }else{
            $('#toggle_view_com').removeClass('disabled');
            $('#comment_suiv').removeClass('disabled');
        }
        if (liste_coms.length <= 5) $('#content_coms').css('min-height',liste_coms.length*100+'px').css('height',liste_coms.length*100+'px');
        if (Math.ceil(nb_pages) > 0) {
            $('#page_nb').html(Math.ceil(nb_pages));
            $('#page_com').html('1');
            display_ui.push("$('.pagination').addClass('fadeIn');");
            if (liste_coms.length > 0) display_ui.push("$('.tri_comment').addClass('fadeIn');");
        }
        exe_time(display_ui, 50);
        if (add) $('#content_coms').addClass('min_height').html('');
        for (var i = 0; i < liste_coms.length; i++) {
            createCom(liste_coms[i].pid, liste_coms[i].name, db64(liste_coms[i].content), liste_coms[i].note, liste_coms[i].mail, liste_coms[i].uid, liste_coms[i].date);
            create_com.push("$('#com_" + (LastId) + "').addClass('fadeIn');");
            notes_coms_total += Number(liste_coms[i].note);
            if (liste_coms[i].note < 3) {
                note_b++;
            } else {
                note_h++;
            }
        }
        if (i > 0 && LOG && logLevel >= 5) console.log('%c [' + i + '] %c commentaires mis à jour. ', 'background:#2B6CB3;color:white;', 'background:#6299D6;color:white;');
        exe_time(create_com, 50);
        var note_g = Math.round((notes_coms_total / i) * 100) / 100;
        set_note(note_g, note_b, note_h, i, notes_coms_total);
        //$('#arrivage-nouveau_coms').attr("none","true");
        //$('#arrivage-nouveau_coms').click();
    }
}
function save_com(me,id){
    var comment = b64($('#new_commentaire').val());
    var pseudo = $('#pseudo').val();
    var mail = $('#mail').val();
    var note = Number($('#note_new').attr('value'));
    var votes = $('#note_new_votes').attr('value');

    var data = '&name='+pseudo+'&mail='+mail+'&note='+note+'&content='+comment+'&pid='+id+'&votes='+votes+'&';
    if (verif_com(id)){
        ajaxForm(me.parentNode,data,true);
        alertify.success('Votre avis a bien été enregistré.');
        if ($('#content_coms').find('.comment').length < 6){
            $('#toggle_view_com').addClass('disabled');
            $('#comment_suiv').addClass('disabled');
        }else{
            $('#toggle_view_com').removeClass('disabled');
            $('#comment_suiv').removeClass('disabled');
        }
        if ($('#content_coms').find('.comment').length <= 5) $('#content_coms').css('min-height',$('#content_coms').find('.comment').length*100+'px').css('height',liste_coms.length*100+'px');
    }else{
        alertify.error('Veuillez remplir tout les champs.');
        return false;
    }
}
function open_comment(me){
    if($(me).hasClass('suite')){
        if ($(me).hasClass('open')){
            $(me).removeClass('open');
            if ($(me).attr('scroll') != undefined){
                $('.comment.first').css('margin-top', $(me).attr('scroll')+'px');
            }
        }else{
            var c_com = document.getElementById('content_coms');
            if ((me.offsetTop + me.scrollHeight)+100 >= (c_com.offsetTop + c_com.offsetHeight)){
                var val = me.scrollHeight+20;
                var top = document.getElementsByClassName('first').item(0).offsetTop;
                var new_val = top-val;
                $('.comment.first').css('margin-top', new_val+'px');
                $('.comment.first').attr('scroll', top);
                $(me).attr('val', val);
                $(me).attr('scroll', top);
            }
            $(me).addClass('open');
        }
    }
}
function createCom(pid,nom,commentaire,note,mail,uid,date,mode){
    if (document.getElementById('ajax_coms') != null) {
        if (typeof date == 'undefined' || date == "") date = 'Il y a quelques secondes...';
        LastId++;
        var first = '';
        if ($('.comment').length == 0 || $('.comment').length == '') first = 'first';
        var comment = document.createElement('div');
        var content_coms = document.getElementById('content_coms');
        comment.setAttribute('class', 'comment ' + first);
        comment.setAttribute('id', 'com_' + LastId);
        comment.setAttribute('pid', pid);
        comment.setAttribute('uid', uid);
        comment.setAttribute('name', 'new');
        var left = document.createElement('div');
        left.setAttribute('class', 'left');
        var votes_com = document.createElement('div');
        votes_com.setAttribute('class', 'votes_com');
        var rating = document.createElement('ul');
        rating.setAttribute('class', 'rating vote-cast');
        for (var i = 1; i < 6; i++) {
            var star = document.createElement('li');
            star.setAttribute('class', 'star');
            star.innerHTML = '&#9733;';
            star.setAttribute('id', LastId + '_star_' + i);
            rating.appendChild(star);
        }
        votes_com.appendChild(rating);
        var note_com = document.createElement('div');
        note_com.setAttribute('class', 'note_com');
        note_com.textContent = note;
        var img_com = document.createElement('div');
        img_com.setAttribute('class', 'img_com');
        var img_co = document.createElement('img');
        img_co.setAttribute('src', '/img/user.jpg');
        img_com.appendChild(img_co);
        left.appendChild(votes_com);
        left.appendChild(note_com);
        left.appendChild(img_com);
        var owner_com = document.createElement('div');
        owner_com.setAttribute('class', 'owner_com');
        owner_com.textContent = nom;
        var date_com = document.createElement('div');
        date_com.setAttribute('class', 'date_com');
        date_com.textContent = date;
        var content_com = document.createElement('div');
        content_com.setAttribute('class', 'content_com in_com open');
        content_com.setAttribute('onclick', 'open_comment(this);');
        content_com.textContent = commentaire;
        var clear = document.createElement('div');
        clear.setAttribute('class', 'clear');
        comment.appendChild(left);
        comment.appendChild(owner_com);
        comment.appendChild(date_com);
        comment.appendChild(content_com);
        comment.appendChild(clear);
        if (mode && $('.comment').length > 0) {
            content_coms.insertBefore( comment, content_coms.childNodes[0]);
        }else{
            $('.tri_comment').fadeIn('fast');
            content_coms.appendChild(comment);
        }
        if (content_com.scrollHeight > 48){
            $(content_com).addClass('suite');
        }
        $('#' + LastId + '_star_' + note).addClass('selected');
        return LastId;
    }
}
function tri_date_com(mode,pid,me){
    var att = me.attributes;
    if (typeof att.select != 'undefined'){
        if (att.select.value == "false" || att.select.value == ''){
            if (mode){
                update('/film/get-com/@'+pid+'?'+Math.floor((Math.random()*100)+1));
                loop_coms(true);
            }else{
                update('/film/get-com/@'+pid+'?'+Math.floor((Math.random()*100)+1));
                liste_coms.reverse();
                loop_coms(true);
            }
        }
    }
}
function tri_note_moins(key1, key2){
    return key1.note - key2.note;
}
function clear_com(){
    $('#pseudo').val('');
    $('#mail').val('');
    $('#new_commentaire').val('');
    $('#new_rating').removeClass('vote-cast');
    $('.note_com.new').html('0');
    $('#note_new').val('0');
    //clear_note();
}
function clear_note(){
    $('#note_total').css('color','#FCFFE2');
    $('#note_total').css('background','#80982D');
    $('#note_total').html($('#note_total').attr('note'));
}
function set_note(note_g,note_b,note_h,nb_notes,notes_coms_total){
    if (nb_notes <= 0){
        note_g = 0;
        note_b = 0;
        note_h = 0;
        nb_notes = 'aucun avis pour le moment.';
    }
    $('#note_generale').html(note_g);
    $('#note_total').attr('note',note_g);
    $('#note_total').attr('nb_note',nb_notes);
    $('#note_total').attr('note_total',notes_coms_total);
    $('#note_total').html(note_g);
    $('#note_basse').html(note_b);
    $('#note_haute').html(note_h);
    if (nb_notes > 0){
        $('#nb_notes').html(nb_notes+' avis');
        $('#bubble_avis').html(nb_notes);
    }else{
        $('#bubble_avis').addClass('fadeOut');
    }
    /*
     $('#note_total').css('color','#FCFFE2');
     $('#note_total').css('background','#80982D');
     time(1500,"$('#note_total').css('background','#808080');");
     */

}
function update_note(note,mode){
    var nb_note = $('#note_total').attr('nb_note');
    var notes_coms_total = $('#note_total').attr('note_total');
    var note_maj = (Number(notes_coms_total)+Number(note))/(Number(nb_note)+1);
    if (!mode){
        /*
         $('#note_total').css('color','#FFF0E2');
         $('#note_total').css('background','#982D2D');
         */
    }
    note_maj = Math.round(note_maj*100)/100;
    $('#note_total').html(note_maj);
}
function update_auto_note(pid){
    update('/film/get-com/@'+pid,on_load_coms);
    var nb_note = $('#note_total').attr('nb_note');
    var notes_coms_total = $('#note_total').attr('note_total');
    var note_maj = Number(notes_coms_total)/Number(nb_note);
    note_maj = Math.round(note_maj*100)/100;
    $('#note_total').html(note_maj);
}
function display_tri_coms(elm,User_click,att) {
    $('#page_com').html('1');
    $('.comment.first').css('margin-top', '0px');
    var elmmod = elm.parentNode.parentNode.parentNode;
    var els = document.getElementsByClassName('mnu_coms');
    $('.triage.coms a[select=true]').attr('select', false);
    elm.setAttribute('select', true);
    Array.prototype.forEach.call(els, function (me) {
        me.innerHTML = me.attributes.tri.value;
    });
    elmmod.childNodes[1].innerText = elm.innerText;
    $('.triage.coms .select').removeClass('select');
    elmmod.childNodes[1].className = "mnu_coms select";
    if (!User_click) {
        $('#' + elm.id).attr("none", "false");
        return false;
    }
}
function page_comment(mode,nbcom,me){
    var nbcom = $('#content_coms').find('.comment').length;
    if (!$(me).hasClass('disabled')) {
        $(me).addClass('disabled');
        var scroll_val = "";
        var val = "";
        var top = document.getElementsByClassName('first').item(0).offsetTop;
        var max_page = ((nbcom) * 100) * -1;
        var new_val = 0;
        var page = Number($('#page_com').html());
        if (!mode) {
            new_val = top + 500;
            page--;
        } else {
            new_val = top - 500;
            page++;
        }
        if (new_val <= 0 && page != 1) {
            if ($(me)[0].id != 'comment_prec') {
                window.setTimeout(function () {
                    $('#comment_prec').removeClass('disabled');
                }, 220);
            }
        } else {
            $('#comment_prec').addClass('disabled');
        }
        $('.content_com.open').each(function () {
            $(this).removeClass('open');
            if ($(this).attr('scroll') != 'undefined') {
                //$('.comment.first').css('margin-top', $(this).attr('scroll')+'px');
                scroll_val = $(this).attr('scroll');
                val = $(this).attr('val');
            }
        });


        if (new_val >= max_page && page < Math.ceil(nbcom / 5)) {
            if ($(me)[0].id != 'comment_suiv') {
                window.setTimeout(function () {
                    $('#comment_suiv').removeClass('disabled');
                }, 220);
            }
        } else {
            $('#comment_suiv').addClass('disabled');
        }

        if (top >= max_page && new_val <= 0 && new_val >= max_page) {
            $('#page_com').html(page);
            if (page == 1) {
                $('#comment_prec').addClass('disabled');
            } else if (page == Math.ceil(nbcom / 5)) {
                $('#comment_suiv').addClass('disabled');
            } else {
                window.setTimeout(function () {
                    $(me).removeClass('disabled');
                }, 400);
            }
            if (scroll_val != "") {
                exe_time(["$('.comment.first').css('margin-top','0px');", "$('.comment.first').css('margin-top', '" + (page * 500) * -1 + "px');"], 300);
            } else {
                $('.comment.first').css('margin-top', new_val + 'px');
            }

        }
    }
}
function make_star() {
    $('#new_rating').find('li').on('click', function () {
        var selectedCssClass = 'selected';
        var $this = $(this);
        $this.siblings('.' + selectedCssClass).removeClass(selectedCssClass);
        $this.addClass(selectedCssClass).parent().addClass('vote-cast');
        if (LOG && logLevel >= 5) console.log("%c VOTE:" + $(this).attr('id'), "background:yellow;color:black;");
        $('.note_com.new').html($(this).attr('id'));
    });
}

//AFFICHAGE
function switch_page(mode,link,histo,redir){
    if (mode){
        if (typeof screenfull != 'undefined' && screenfull.isFullscreen){min_iframe();}
        if (!$('#hover_frame').hasClass('max')){
            if ($('#ajax').attr('scroll') != "") time(40, "document.body.scrollTop = $('#ajax').attr('scroll');");
            $('#ajax').removeClass('fadeOut').addClass('fadeIn');
            if(typeof $('#ajaxprod').html() == 'undefined'){
                set_head();
            }
            if ($('#ajaxprod').html() == "" && !redir){
                redirect('/cinematheque/tout/@1','ajaxprod','js','','','','','','','',display_json);
                $('#ajax').attr('url','/cinematheque/tout/@1');
            }
            $('#ajax_pages').removeClass('fadeIn').addClass('fadeOut');
            DISPLAY_scroll=true;
            $('.selector').css('display', 'none');
            $('.controls_selector').css('display', 'none');
            $('#btn_retour').removeClass('fadeIn').addClass('fadeOut');
        }
    }else{
        DISPLAY_scroll=false;
        $('#ajax_coms').removeClass('fadeIn');
        $('#ajax').attr('scroll',document.body.scrollTop);
        $('#ajax').removeClass('fadeIn').addClass('fadeOut');
        $('#ajax_pages').removeClass('fadeOut').addClass('fadeIn');
        $('.selector').css('display','block');
        $('.controls_selector').css('display','block');
    }
    if (!histo || typeof histo == 'undefined' || histo == ''){
        if (mode && $('#hover_frame').hasClass('max')){
            min_iframe();
            var link = $('#ajax_pages').attr('url');
            return;
        }else if (mode){
            var link = $('#ajax').attr('url');
            $('#ajax_pages').attr('url',document.location.pathname);
        }else{
            var link = $('#ajax').attr('url');
            if($('#ajax').attr('url') == "") $('#ajax').attr('url','/cinematheque/tout/@1');
        }
        historyme(link);
    }
}
function set_margin_box(){
    var box = document.getElementById('box');
    var body = document.body;
    var nb_prod = Math.floor(body.offsetWidth/204);
    var reste = body.offsetWidth - (nb_prod*204);
    box.style.width = body.offsetWidth-reste+'px';
    body.style.height = window.innerHeight;
    body.style.minHeight = window.innerHeight;
}
function set_display_ui(func,scroll,delay,mode){
    time(1000,'DISPLAY_scroll=true;');
    if (!mode) display_ui=[];
    if (typeof scroll == 'undefined' || scroll == '') var scroll = 0
    if (typeof delay == 'undefined' || delay == '') var delay = 0
    if (typeof func == 'function'){
        var obj = {"commande":func,"scroll":scroll,"delay":delay};
        display_ui.push(obj);
    }else{
        console.log('%c erreur display_ui l:343 la commande n\'est pas ue fonction!','background:pink;color:red;');
    }
    return display_ui;
}
function toggle_btn(me,class_name){
    $(class_name).toggleClass('open');
    $(me).toggleClass('open');
}
function toggle_fermer(me,mode){
    if (typeof me != 'object') me = $(me);
    if (!mode){
        $(me).removeClass('ferme');
    }else{
        $(me).addClass('ferme');
    }
}
function monmenu(element) {
    var x = document.getElementById('ctxmenu1');
    if(x) x.parentNode.removeChild(x);

    var d = document.createElement('div');
    d.setAttribute('class', 'ctxmenu');
    d.setAttribute('id', 'ctxmenu1');
    element.parentNode.appendChild(d);
    d.style.left = xMousePosition + "px";
    d.style.top = yMousePosition + "px";
    d.onclick = function(e) { element.parentNode.removeChild(d);  };
    document.body.onclick = function(e) {
        if (isDescendant(element.parentNode,d)){ element.parentNode.removeChild(d);  }
    };

    var p0 = document.createElement('p');
    d.appendChild(p0);
    p0.onclick=function() { $('#autoHome').click(); };
    p0.setAttribute('class', 'ctxline');
    p0.innerHTML = "Accueil";

    var p = document.createElement('p');
    d.appendChild(p);
    p.onclick=function() { window.history.go(1); };
    p.setAttribute('class', 'ctxline');
    p.innerHTML = "Suivant";

    var p2 = document.createElement('p');
    d.appendChild(p2);
    p2.onclick=function() { window.history.go(-1); };
    p2.setAttribute('class', 'ctxline');
    p2.innerHTML = "Précedant";

    var p3 = document.createElement('p');
    d.appendChild(p3);
    p3.onclick=function() {  };
    p3.setAttribute('class', 'ctxline');
    p3.innerHTML = "Historique ajax";

    var p4 = document.createElement('p');
    d.appendChild(p4);
    p4.onclick=function() { window.document.location.reload(); };
    p4.setAttribute('class', 'ctxline');
    p4.innerHTML = "Actualiser";

    var p5 = document.createElement('p');
    d.appendChild(p5);
    p5.onclick=function() { scroll_view("top"); };
    p5.setAttribute('class', 'ctxline');
    p5.innerHTML = "Remonter la page";

    var p6 = document.createElement('p');
    d.appendChild(p6);
    p6.onclick=function() { scroll_view("bottom"); };
    p6.setAttribute('class', 'ctxline');
    p6.innerHTML = "Descendre la page";

    var p7 = document.createElement('p');
    d.appendChild(p7);
    p7.onclick=function() { scroll_view("bottom");page_suivante(true); };
    p7.setAttribute('class', 'ctxline');
    p7.innerHTML = "Page suivante";

    return false;
}
function toggle_vue(me){
    $('.btn.vue').removeClass('toggle');
    $(me).addClass('toggle');
}
function set_head(){
    if ($('#ajaxprod').length == 0) {
        var ajaxprod = document.createElement('div');
        ajaxprod.setAttribute('id', 'ajaxprod');
        document.getElementById('ajax').appendChild(ajaxprod);
    }
}
function set_btn_retour(id,txt,cont){
    if (document.getElementById(id) == null){
        var url,classe='',script='';
        switch (cont){
            case'top_menu_btn':
                script+="$(this).addClass('boot');";
                url = $('#ajax').attr('url');
                break;
            case'div_selector_series':
                url = $('#ajax_pages').attr('url');
                classe = "controls_serie";
                script += 'if (typeof screenfull != "undefined" && screenfull.isFullscreen) full_screen();';
                break;
            default:
                url = $('#ajax').attr('url');
        }
        var li = document.createElement('li');
        li.setAttribute('class','btn_retour_li');
        var btn = document.createElement('a');
        btn.setAttribute('id',id);
        btn.setAttribute('class','btn gauche precedant precedant_top '+classe);
        btn.setAttribute('onclick',script+"switch_page(true);");
        var txt = document.createTextNode('retourner '+txt);
        btn.appendChild(txt);
        li.appendChild(btn);
        document.getElementById(cont).appendChild(li);
    }else{
        $('#'+id).removeClass('boot').removeClass('fadeOut').addClass('fadeIn');
    }
}
function switch_tab(id,me){
    $('.bar li').each(function(){
        $(this).removeClass('active');
        var div = $(this).attr('div');
        $('#'+div).css('display','none');
    });
    $('#o'+id).addClass('active');
    $('#'+$(me).attr('div')).fadeIn('slow');
}
function toggle_options(me){
    var div = me.parentNode.parentNode;
    $('.opts_div').each(function(){
        $(this).addClass('ferme');
        $(this).attr('check','true');
        $(this).scrollTop(0);
    });
    me.attributes.check.value = false;
    $(div).removeClass('ferme');
}
function set_scroll_body(){
    document.body.scrollTop = 0;
}
function tilc(html_obj,class_name,timer){
    if (timer == '' || timer <=1) timer = 1;
    window.setTimeout(function () {
        if (class_name == '') class_name = 'set-focus';
        $(html_obj).addClass(class_name);
        time(5500, '$("' + html_obj + '").removeClass("' + class_name + '");');
    },timer);
}
function scroll_view(mode){
    switch(mode){
        case'page':
            $('html, body').animate({scrollTop: document.body.scrollTop}, 600);
            break;
        case'top':
            $('html, body').animate({scrollTop: 0}, 600);
            break;
        case'bottom':
            $('html, body').animate({scrollTop: document.body.scrollTop-990}, 600);
            break;
        case'prods':
            $('html, body').animate({scrollTop: 105}, 600);
            break;
        case'prod_voir':
            $('html, body').animate({scrollTop: 105}, 600);
            break;
        default:
            $('html, body').animate({scrollTop: 105}, 600);
            break;
    }
}
function set_bg(file){
    LastId++;
    readImage(file,LastId,null,true);
}
function get_view(){
    AjaxMe.VIEW=[];
    $('.prod').not('.blow').not('.vide').each(function(){
        AjaxMe.VIEW.push(window['FILM'+$(this).attr('pid')]);
    });
    if (AjaxMe.VIEW.length <= 0){
        AjaxMe.VIEW = liste_total;
    }
}
function animate_stars(id){
    $('#note_top_'+id).find('.star').each(function(){
        $(this).removeClass('anmated');
        $(this).offsetWidth = $(this).offsetWidth;
        $(this).addClass('animated');
    });
}
function animate(me,class_name){
    me.classList.remove(class_name);
    me.offsetWidth = element.offsetWidth;
    me.classList.add(class_name);
}
function pushme(int,txt,mode){
    int = int+'';
    if (int.indexOf('+') != -1) {
        int = int.substring(0,1);
        var val = $('#pm').css('width');
        val = val.substring(0,1);
        $('.pushme').css('width',val+'%');
    }else{
        $('.pushme').css('width',int+'%');
    }
    if (typeof txt != 'undefined'){
        if (mode){
            $('#txt_load').html($('#txt_load').html()+'<br><br>'+txt);
        }else{
            $('#txt_load').html(txt);
        }
    }
    if (int >= 100){
        $('.pushme').css('width','100%');
        $('body').removeClass('load');
        $('#load_session').fadeOut('slow');
    }
}

// PAGINATION
function page_suivante(time){
    if (PAGE < nbPAGE) {
        if (!time) {
            fn_suivant();
        } else {
            window.setTimeout(function () {
                fn_suivant();
            }, 600);
        }
    }
}
function fn_suivant(){
    $('.spinner.page').addClass('loads');
    PAGE++;
    var newlink = document.createElement('a');
    newlink.setAttribute('ia', 'ajax');
    newlink.setAttribute('href', '/cinematheque/tout/' + TRI + '/@' + PAGE);
    newlink.setAttribute('source', 'scroll_page_auto()->');
    ajax(newlink, 'ajaxprod', 'page');
    historyme('/cinematheque/tout/'+TRI+'/@'+PAGE);
}

//ECOUTEURS
window.onresize = function(){
    set_margin_box();
}
ready('.user_js',auto_connect);
//ready('.killme_ready',killme);
function out_serie(){
    //$('#div_selector_series').removeClass('boot_serie');
    $('#div_selector_series').addClass('hover_video');
}
function in_serie(){
    //$('#div_selector_series').removeClass('hover_video');
    $('#div_selector_series').addClass('boot_serie');
    $('.controls_serie').removeClass('blow');
}
function click_serie(){
    if (!screenfull.isFullscreen){max_iframe();full_screen('hover_frame',false,this);if (!$('#full').hasClass('switch-on')) $('#s9').addClass('none').click().removeClass('none');}else{min_iframe();screenfull.exit();if ($('#full').hasClass('switch-on')) $('#s9').addClass('none').click().removeClass('none');}
}
function out_hover(){
    if (!$('#div_selector_series').hasClass('hover_video')) $('#div_selector_series').addClass('hover_video');
    if (typeof $('.in_move')[0] != 'undefined') {
        var top = $('.in_move')[0].parentNode.offsetTop;
        var height = $('.in_move')[0].parentNode.offsetHeight;
        $('.first').css('margin-top', '-' + (top-(height)) + 'px');
    }
}
function in_hover(){
    if ($('#div_selector_series').hasClass('hover_video')) $('#div_selector_series').removeClass('hover_video');
    $('.first').css('margin-top','0');
}
function in_frame(){
}
function out_frame(){
    $('#div_selector_series').removeClass('boot_serie');
}


//LOADERS
function link_ready(){
    $('#voir_film').html('voir les liens ('+links_data.length+')');
}
function on_load_coms(){
    $('#ajax_coms').removeClass('fadeOut').addClass('fadeIn');
    loop_coms(true);
    time(600,'loadme($(".loadme"),true);');
    coms_update=true;
}
function load_films(){
    redirect("/cinematheque/tout/@*",'null','js','prodDB()->success','script','','','','','',finish_prods);
}
function finish_prods(){
    pushme(100,'films chargés');
}
//LOGIN
function auto_connect(){
    try{
        connect(AjaxMe.Usr.nom,AjaxMe.Usr.prenom);
        if (verif_co()){
            if (!LOGIN) {
                console.log('%c Connexion auto reussie ', 'background:greenYellow;color:black;');
                alertify.success('Vous êtes connecté.');
            }
        }else{
            console.log('%c Connexion auto abandonné: mauvais identifiants !', 'background:pink;color:red;');
        }
    }catch(e){
        console.log('%c Connexion auto annulée ', 'background:pink;color:red;');
    }
    verif_co();
}

//WORKERS
if (window.Worker) {
    document.getElementById('lipan').childNodes[1].innerHTML = "ma selection";
    SELECTION = new Worker("http://"+window.location.host+"/js/panier.js");
    VUES = new Worker("http://"+window.location.host+"/js/views.js");
    pushme(60,'[ok] selection chargée ',false);
    pushme(80,'[ok] vues chargée ',false);
    VUES.onmessage = function(e) {
        $('.vues').removeClass('boot');
        switch(e.data[0]){
            case'html':
                $('#Vues').html(e.data[1]);
                var div = document.getElementById('Vues');
                var x = div.getElementsByTagName("script");
                for (var i = 0; i < x.length; i++) {
                    eval(x[i].text);
                }
                if (nbRES != null) {
                    var extra = '';
                    if (nbRES > 1) extra = 's';
                    if (nbRES <= 0) {
                        var  nbRES = 'aucun';
                        extra = '.';
                    }
                    document.getElementById('livues').childNodes[1].innerHTML = "mon historique ("+nbRES+")";
                    $(document.getElementById('livues').childNodes[1]).removeClass('boot').addClass('loaded');
                }else{
                    document.getElementById('lipan').childNodes[1].innerHTML = 'mes vues';
                }
                if (LOG && logLevel >= 10) console.info('Vues chargées. ver: %c[' +dbVersion+'.0] %c statut: [ok]','color:red;','color:green;');
                break;
            case'js':
                eval(e.data[1]);
                break;
            case'msg':
                switch(e.data[1]){
                    case'true':
                        $('#'+e.data[2]).addClass('saved').addClass('new_save');
                        break;
                    case'false':
                        alertify.success('élément supprimé de votre historique');
                        break;
                }
                break;
        }
    }
    SELECTION.onmessage = function(e) {
        $('.selection').removeClass('boot');
        switch(e.data[0]){
            case'html':
                $('#Panier').html(e.data[1]);
                var div = document.getElementById('Panier');
                var x = div.getElementsByTagName("script");
                for (var i = 0; i < x.length; i++) {
                    eval(x[i].text);
                }
                if (nbRES != null) {
                    var extra = '';
                    if (nbRES > 1) extra = 's';
                    if (nbRES <= 0) {
                        var  nbRES = 'aucun';
                        extra = '.';
                    }
                    document.getElementById('lipan').childNodes[1].innerHTML = "ma selection ("+nbRES+")";
                    $(document.getElementById('lipan').childNodes[1]).removeClass('boot').addClass('loaded');
                }else{
                    document.getElementById('lipan').childNodes[1].innerHTML = 'ma selection';
                }
                if (LOG && logLevel >= 10) console.info('Préférences chargées. ver: %c[' +dbVersion+'.0] %c statut: [ok]','color:red;','color:green;');
                break;
            case'js':
                eval(e.data[1]);
                break;
            case'msg':
                switch(e.data[1]){
                    case'true':
                        alertify.success($('#prod'+e.data[2]).html()+'<br><br>élément ajouté à la sélection');
                        break;
                    case'false':
                        alertify.success('élément supprimé de la sélection');
                        break;
                }
                break;
        }
    }

}else{
    $('.selection').removeClass('boot').addClass('loaded');
    $('.vues').removeClass('boot').addClass('loaded');
    throw "Votre navigateur ne supporte pas les technologies utilisées sur ce site web, tentez de le mettre à jour ou installer la dernière version.";
}

/*
 document.onmousemove = function(e) {
 xMousePosition = 0;
 yMousePosition = 0;
 xMousePosition = e.clientX + window.pageXOffset-33;
 yMousePosition = e.clientY + window.pageYOffset+15;
 };
 */


/*                    //google rich snipet
 var scope = document.createElement('div');
 scope.setAttribute('itemscope', "");
 scope.setAttribute('itemtype', "http://schema.org/VideoObject");
 var name = document.createElement('span');
 name.setAttribute('itemprop', "name");
 var txt_name = document.createTextNode(links_data[0].serie);
 name.appendChild(txt_name);
 var desc = document.createElement('span');
 desc.setAttribute('itemprop', "description");
 var txt_desc = document.createTextNode(db64(links_data[0].synopsis));
 desc.appendChild(txt_desc);
 var thumb = document.createElement('img');
 //min-max resolution: 160 x 90 || 1920 x 1080 || .jpg .png .gif
 thumb.setAttribute('itemprop', "thumbnailUrl");
 thumb.setAttribute('alt', links_data[0].titre_ep);
 thumb.setAttribute('src', 'http://' + window.location.host + '/img/img_prod/' + links_data[0].lien);
 var u_date = document.createElement('meta');
 var date = new Date();
 date.toISOString();
 u_date.setAttribute('itemprop', "uploadDate");
 u_date.setAttribute('content', date);
 var eUrl = document.createElement('link');
 eUrl.setAttribute('itemprop', "embedUrl");
 var content_url = saison_tab[j].lien;
 if (saison_tab[j].lecteur == 'youtube') content_url = 'https://www.youtube.com/watch?v=' + saison_tab[j].lien;
 eUrl.setAttribute('href', content_url);
 var cUrl = document.createElement('link');
 cUrl.setAttribute('itemprop', "contentUrl");
 cUrl.setAttribute('href', saison_tab[j].uid);
 var iCount = document.createElement('meta');
 iCount.setAttribute('itemprop', "interactionCount");
 iCount.setAttribute('content', saison_tab[j].vues);

 scope.appendChild(name);
 scope.appendChild(desc);
 scope.appendChild(thumb);
 scope.appendChild(u_date);
 scope.appendChild(eUrl);
 scope.appendChild(cUrl);
 scope.appendChild(iCount);
 bouton.appendChild(scope);
 //google rich snipet*/
