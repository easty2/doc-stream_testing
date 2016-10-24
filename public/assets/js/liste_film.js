/**
 * Created by neo on 18/10/16.
 */
PAGE=1;


var subscribe_gallery = setInterval(function() {
    if (typeof $('.gallery')[0] != 'undefined') {
        var liste_film = col_Liste.find().fetch();
        var nb_div = Number($('.gallery .gallery-item').length);
        var nb_loop = liste_film.length;
        if (liste_film.length > NB_obj) nb_loop = NB_obj;
        var nb_pages = Number(col_Liste.find().fetch().length) / NB_obj;
        nbPAGE = Math.round(col_Liste.find().fetch().length / NB_obj);
        if (nb_pages > nbPAGE) nbPAGE++;
        if ((PAGE == 1 && nb_div < NB_obj && nb_div < liste_film.length )||(PAGE >= nbPAGE) && liste_film.length > nb_div) {
            console.info('subscribe> Liste !UPDATE!');
            $('.gallery .parent').remove();

            for (var i = 0; i < nb_loop; i++) {
                create_vignette(liste_film[i]._id, liste_film[i].titre, liste_film[i].date, liste_film[i].description);
            }
            var nb_film = Number(liste_film.length), ajouts = nb_film - nb_div;
            if (ajouts == 1) {
                notif('1 Film ajouté', 'Sauvegardé', 'success');
            } else if (ajouts < 0) {
                var var_s = "";
                if (ajouts > 1) var_s = 's';
                notif(Math.abs(ajouts) + ' Film' + var_s + ' supprimé' + var_s, 'Suppression', 'warning');
            }
            create_pageLinks();
            $('#stats_page').html($('.gallery .gallery-item').length+' éléments.');
        } else {
        }
    } else {
        stop_gallery();
    }
}, 5);

applyIsotope = function () {
    $('.gallery').isotope({
        itemSelector: '.gallery-item',
        masonry: {
            columnWidth: 280,
            gutter: 10,
            isFitWidth: true
        }
    });
};
var stop_gallery = function(){
    clearInterval(subscribe_gallery);
};


var create_vignette = function(id,var1,var2,var3){
    var vignette = document.createElement('div');
        vignette.setAttribute('id','film_vignette_'+id);
        vignette.setAttribute('class','parent');
    var gallery_item = document.createElement('div');
        gallery_item.setAttribute('class','gallery-item');
        gallery_item.setAttribute('data-width','1');
        gallery_item.setAttribute('data-height','1');
    vignette.appendChild(gallery_item);
    var img_responsive = document.createElement('img');
        img_responsive.setAttribute('src','assets/img/gallery/1.jpg');
        img_responsive.setAttribute('alt','');
        img_responsive.setAttribute('class','image-responsive-height');
    gallery_item.appendChild(img_responsive);
    var overlayer = document.createElement('div');
        overlayer.setAttribute('class','overlayer bottom-left full-width');
    gallery_item.appendChild(overlayer);
    var overlayer_wrapper = document.createElement('div');
        overlayer_wrapper.setAttribute('class','overlayer-wrapper item-info');
    overlayer.appendChild(overlayer_wrapper);
    var div_0 = document.createElement('div');
        div_0.setAttribute('class','gradient-grey p-l-20 p-r-20 p-t-20 p-b-5');
    overlayer_wrapper.appendChild(div_0);
    var div_1 = document.createElement('div');
        div_1.setAttribute('class','');
    div_0.appendChild(div_1);

    var p = document.createElement('p');
        p.setAttribute('class','pull-left bold text-white fs-14 p-t-10');
    var p_txt = document.createTextNode(var1);
        p.appendChild(p_txt);
    div_1.appendChild(p);
    var h5 = document.createElement('h5');
        h5.setAttribute('class','pull-right semi-bold text-white font-montserrat bold');
    var h5_txt = document.createTextNode(var2);
        h5.appendChild(h5_txt);
    div_1.appendChild(h5);
    var clearfix = document.createElement('div');
        clearfix.setAttribute('class','clearfix');
    div_1.appendChild(clearfix);

    var div_2 = document.createElement('div');
        div_2.setAttribute('class','m-t-10');
    div_0.appendChild(div_2);
    var thumbnail = document.createElement('div');
        thumbnail.setAttribute('class','thumbnail-wrapper d32 circular m-t-5');
    div_2.appendChild(thumbnail);
    var img = document.createElement('img');
        img.setAttribute('width','40');
        img.setAttribute('height','40');
        img.setAttribute('src','assets/img/profiles/avatar.jpg');
        img.setAttribute('data-src','assets/img/profiles/avatar.jpg');
        img.setAttribute('data-src-retina','assets/img/profiles/avatar2x.jpg');
        img.setAttribute('alt','');
    thumbnail.appendChild(img);
    var inline = document.createElement('div');
        inline.setAttribute('class','inline m-l-10');
    div_2.appendChild(inline);
    var p2 = document.createElement('p');
        p2.setAttribute('class','no-margin text-white fs-12');
    var p2_txt = document.createTextNode(var3);
        p2.appendChild(p2_txt);
    inline.appendChild(p2);
    var p3 = document.createElement('p');
        p3.setAttribute('class','rating');
            var i1 = document.createElement('i');
                i1.setAttribute('class','fa fa-star rated');
            var i2 = document.createElement('i');
                i2.setAttribute('class','fa fa-star rated');
            var i3 = document.createElement('i');
                i3.setAttribute('class','fa fa-star rated');
            var i4 = document.createElement('i');
                i4.setAttribute('class','fa fa-star rated');
            var i5 = document.createElement('i');
                i5.setAttribute('class','fa fa-star');
        p3.appendChild(i1);
        p3.appendChild(i2);
        p3.appendChild(i3);
        p3.appendChild(i4);
        p3.appendChild(i5);
    inline.appendChild(p3);
    var div_3 = document.createElement('div');
        div_3.setAttribute('class','pull-right m-t-10');
    div_2.appendChild(div_3);
    var button = document.createElement('button');
        button.setAttribute('class','btn btn-white btn-xs btn-mini bold fs-14');
        button.setAttribute('type','button');
    div_3.appendChild(button);
    var clearfix2 = document.createElement('div');
        clearfix2.setAttribute('class','clearfix');
    div_2.appendChild(clearfix2);
    if (typeof applyIsotope == 'function') applyIsotope();
    $('.gallery').append(vignette).isotope('appended',vignette);
};