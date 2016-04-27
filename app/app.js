import 'es5-shim';
import 'es6-shim';
import io from 'socket.io-client'
import {App, IonicApp, Platform} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {CreepypastasService} from './providers/creepypastas-service/creepypastas-service';
import {GettingStartedPage} from './pages/getting-started/getting-started';
import {CreepypastasPage} from './pages/creepypastas/creepypastas';
import {CategoriasPage} from './pages/categorias/categorias';
import {ConfigPage} from './pages/config/config';
import {enableProdMode} from 'angular2/core';
enableProdMode();

  var socket = io('http://rc.ws.creepypastas.com:7777');
  socket.on('connect', function(){});
  socket.on('event', function(data){});
  socket.on('disconnect', function(){});

  socket.emit('msg', 'msg');

@App({
  templateUrl: 'build/app.html',
  config: {mode: 'md'},
  providers: [CreepypastasService]
})
class MyApp {
  static get parameters() {
    return [[IonicApp], [Platform], [CreepypastasService]];
  }

  constructor(app, platform, creepypastasService) {
    this.app = app;
    this.platform = platform;
    this.creepypastasService = creepypastasService;
    this.initializeApp();

    this.pages = [
      { title: 'Categorias', component: CategoriasPage },
      { title: 'Creepypastas', component: CreepypastasPage },
      { title: 'Opciones', component: ConfigPage }
    ];

    this.rootPage = GettingStartedPage;
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    let nav = this.app.getComponent('nav');
    nav.setRoot(page.component);
  }
}
