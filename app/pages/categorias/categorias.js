import {Page, NavController, NavParams} from 'ionic-angular';
import {Http} from 'angular2/http';
import 'rxjs/add/operator/map';

import {CreepypastasPage} from '../creepypastas/creepypastas';

@Page({
  templateUrl: 'build/pages/categorias/categorias.html'
})
export class CategoriasPage {
  static get parameters() {
    return [[NavController], [NavParams], [Http]];
  }

  constructor(nav, navParams, http) {
    this.nav = nav;
    this.creepypastasCategorias = [];

    http.get('https://creepypastas.com/wp-json/wp/v2/categories')
      .map(res => res.json())
      .subscribe(categorias => {
          this.creepypastasCategorias = categorias;
        }
      );
  }

  requestFilteredCreepypastas(event, item) {
    this.nav.push(CreepypastasPage, {
      searchObject: item
    })
  }
}
