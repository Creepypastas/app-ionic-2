import {Page, NavController, NavParams} from 'ionic-angular';
import {CreepypastasService} from '../../providers/creepypastas-service/creepypastas-service';

import {CreepypastasPage} from '../creepypastas/creepypastas';

@Page({
  templateUrl: 'build/pages/categorias/categorias.html'
})
export class CategoriasPage {
  static get parameters() {
    return [[NavController], [NavParams], [CreepypastasService]];
  }

  constructor(nav, navParams, creepypastasService) {
    this.nav = nav;
    this.creepypastasService = creepypastasService;
    this.creepypastasCategories = {
      filtered: []
    };
    var categoriesPageSelf = this;
    var categoriesPromise = this.creepypastasService.loadCats();
    categoriesPromise.then(function(catsKV) {
      categoriesPageSelf.creepypastasCategories.filtered = catsKV;
    });
  }

  requestFilteredCreepypastas(event, item) {
    this.nav.push(CreepypastasPage, {
      searchObject: item
    })
  }
}
