import {Page, NavController} from 'ionic-angular';
import {CategoriasPage} from '../categorias/categorias';


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
        image: "img/favicon/s.128.png",
      }
    ];
  }

  goToCreepypastas() {
    this.nav.setRoot(CategoriasPage);
  }
}
