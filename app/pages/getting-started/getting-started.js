import {Page, NavController} from 'ionic-angular';
import {CreepypastasPage} from '../creepypastas/creepypastas';


@Page({
  templateUrl: 'build/pages/getting-started/getting-started.html'
})
export class GettingStartedPage {
  static get parameters() {
    return [[NavController]];
  }

  constructor(nav) {
    this.nav = nav;
    this.configureSlides();
  }

  configureSlides() {
    this.slides = [
      {
        title: "Creepypastas",
        image: "https://app.creepypastas.com/favicon/s.128.png",
      }
    ];
  }

  goToCreepypastas() {
    this.nav.setRoot(CreepypastasPage);
  }
}
