/**
 * Created by neo on 14/10/16.
 */



import "./app.html";
import "../imports/tpl/login.html"
import "../imports/tpl/404.html"
import "../imports/tpl/500.html"
import "../imports/tpl/register.html"


Router.configure({
    notFoundTemplate: "404"
});

Router.route('/', function () {
    this.render('start');
});

Router.route('/home.html', function () {
    this.render('start');
});
Router.route('/categories.html', function () {
    Template.start.helpers({redir: '/categories.html'});
    this.render('start');
});
Router.route('/register.me', function () {
    this.render('register');
});

Router.route('/login.me', function () {
    this.render('login');
});



Router.route( 'pageNotFound', {
    path: '/(.*)',
    where: 'server',
    action: function() {
        Router.response.writeHead(404);
        Router.response.end( html );
    }
});
