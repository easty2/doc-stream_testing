/**
 * Created by neo on 16/10/16.
 */
PAGE = 1;

//var subscribe_film = setInterval(function(){

    if (typeof $('#ajax_categories')[0] != 'undefined') {
        var liste_film = col_Liste.find().fetch();
        var nb_div = Number($('#ajax_categories tr').length);
        if ((PAGE == 1 && nb_div < NB_obj && nb_div < liste_film.length )||(PAGE > nbPAGE) && liste_film.length > nb_div) {
            //$('#checkbox8').attr('checked','checked');
            console.info('subscribe> Liste !UPDATE!');
            $('#ajax_categories tr').remove();
            var nb_loop = get_page_num();
            debugger;
            for (var i = 0; i < nb_loop; i++) {
                create_row(liste_film[i]._id,liste_film[i].titre,liste_film[i].description,liste_film[i].date,'now');
            }
            var nb_film = Number(liste_film.length), ajouts = nb_film - nb_div, var_s = "";
            if (ajouts == 1) {
                notif('1 Film ajouté', 'Sauvegardé', 'success');
            } else if (ajouts < 0) {
                if (ajouts > 1) var_s = 's';
                notif(Math.abs(ajouts) + ' Film' + var_s + ' supprimé' + var_s, 'Suppression', 'warning');
            }
        } else {

        }
    }else{
        stop_film();
    }
//}, 1);

var stop_film = function(){
    $('#checkbox8').attr('checked',null);
    clearInterval(subscribe_film);
};

create_row = function(id,var1,var2,var3,var4){
    //debugger;
    var tr_1 = document.createElement('tr');
        tr_1.setAttribute('id',id);
    var td_1 = document.createElement('td');
        td_1.setAttribute('class','v-align-middle semi-bold');
    var p_1 = document.createElement('p');
    var p1_txt = document.createTextNode(var1);
        p_1.appendChild(p1_txt);
        td_1.appendChild(p_1);

    var td_2 = document.createElement('td');
        td_2.setAttribute('class','v-align-middle');
    var a = document.createElement('a');
        a.setAttribute('href','');
        a.setAttribute('href','');
    var a_txt = document.createTextNode(var2);
        a.appendChild(a_txt);
        td_2.appendChild(a);

    var td_3 = document.createElement('td');
        td_3.setAttribute('class','v-align-middle');
    var p_2 = document.createElement('p');
    var ps_txt = document.createTextNode(var3);
        p_2.appendChild(ps_txt);
        td_3.appendChild(p_2);

    var td_4 = document.createElement('td');
        td_4.setAttribute('class','v-align-middle');
    var a_2 = document.createElement('a');
        a_2.setAttribute('href','ws:');
        a_2.setAttribute('class','btn btn-danger');
        a_2.setAttribute('ws_id',id);
        a_2.setAttribute('ws_meth','suppression_film');
    var a2_txt = document.createTextNode('supprimer');
        a_2.appendChild(a2_txt);
        td_4.appendChild(a_2);

    var td_5 = document.createElement('td');
        td_5.setAttribute('class','v-align-middle');
    var p_3 = document.createElement('p');
    var p3_txt = document.createTextNode(var4);
        p_3.appendChild(p3_txt);
        td_5.appendChild(p_3);

        tr_1.appendChild(td_1);
        tr_1.appendChild(td_2);
        tr_1.appendChild(td_3);
        tr_1.appendChild(td_4);
        tr_1.appendChild(td_5);
    $('#ajax_categories').append(tr_1);
};
if (FIRST) {
    FIRST = false;
    handle = col_Liste.find().observeChanges({
        added: function (id, data) {
            if(typeof $('tr#'+id)[0] == 'undefined') create_row(id,data.titre,data.description,data.date,'now');
        },
        removed: function (id, data) {
            $('tr#'+id).fadeOut('fast');
            if(typeof $('tr#'+id)[0] != 'undefined') notif('élément '+id+' supprimé!','supression','success');
        },
        changed: function (id, data){
            console.log('handle changed id:'+id+' data:'+data);
        },
        movedBefore: function(id, data){
            console.log('handle moved before id:'+id+' to before id:'+data);
        }
    });
}

/**/