import {App, IonicApp, Platform} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {GettingStartedPage} from './pages/getting-started/getting-started';
import {CreepypastasPage} from './pages/creepypastas/creepypastas';


@App({
  templateUrl: 'build/app.html',
  config: {
    mode: 'md'
  } // http://ionicframework.com/docs/v2/api/config/Config/
})
class MyApp {
  static get parameters() {
    return [[IonicApp], [Platform]];
  }

  constructor(app, platform) {
    this.app = app;
    this.platform = platform;

    this.initializeApp();

    this.pages = [
      { title: 'Creepypastas', component: CreepypastasPage }
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
