import { Meteor } from 'meteor/meteor';
import { Liste } from "../imports/collections.js";

var LOG = true, logLevel = 99;

//var compression = Npm.require('compression') // in your package.js, need to also add Npm.depends({compression:'1.3.0'})
//WebApp.rawConnectHandlers.use(compression({filter: function(){return true}}))

Meteor.publish('Liste', function publishFunction() {
    return Liste.find();
    //{}, {sort: {date: -1}, limit: 10} sort
});

Meteor.startup(() => {
    /*
    const util = require('util');
    var mem = util.inspect(process.memoryUsage());
    var div = Number(mem.heapTotal) / 100;
    var divi = Number(mem.heapUsed) /div;
    console.log('memoire: '+Math.round(divi)+'% utilisés');
    */
    Meteor.methods({
        'page'({ url }) {
            if (LOG && logLevel > 1) console.log('url demandée:'+url);
            var Future = Npm.require('fibers/future'),
                fs = Npm.require('fs'),
                f = new Future();
            fs.readFile(process.cwd() + '/../../../../../imports'+url, 'utf8', function (err, data) {
                if (err) {
                    if (err.errno === -2){
                        console.error('Fichier template manquant :'+url);
                        return f.return('template manquant');
                    }else{
                        console.log('Error: ' + err);
                        return f.return('error');
                    }
                }
                return f.return(data);
            });
            return f.wait();
        },
        'ajout_film'({ id }){
            if (LOG && logLevel > 1) console.log('mongo: get_list> '+id);
            var Liste_tab = Liste.find().fetch();
            var new_id = 0;
            if (Liste_tab.length != 0){
                new_id = Number(Liste_tab[Liste_tab.length-1]._id);
            }
            Liste.insert({_id: ""+(new_id+1), titre:make_text(8), description:make_text(18), date:make_number(4)});
            return "";
        },
        'suppression_film'({ id }){
            if (LOG && logLevel > 1) console.log('mongo: sup_el> '+id);
            var resultat = Liste.remove(id);
            if (resultat){
                return "";
            }else{
                return "$('#film_div_"+id+" #portlet-advance').css('borderColor','red');notif('Suppression impossible','Erreur','error');";
            }

        },
        'suppression_tout_film'({ }){
            if (LOG && logLevel > 1) console.log('mongo: sup_tout> ');
            var resultat = Liste.remove({});
            if (!resultat) return "$('#film_div_"+id+" #portlet-advance').css('borderColor','red');notif('Suppression impossible','Erreur','error');";
        },
        'mem_usage'({ }){
            const util = require('util');
            return util.inspect(process.memoryUsage());
        }
    });
});

make_text = function(nb_car){
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz";//ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789

    for( var i=0; i < nb_car; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};
make_number = function(nb_car){
    var number = 0;
    var possible = "0123456789";//ABCDEFGHIJKLMNOPQRSTUVWXYZ

    for( var i=0; i < nb_car; i++ )
        number += possible.charAt(Math.floor(Math.random() * possible.length));

    return number;
};

