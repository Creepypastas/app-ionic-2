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

    this.creepypastasCategoriasMap = JSON.parse( localStorage.getItem('creepypastasCategorias') || '{}' );
    this.creepypastasCategoriasKV = this.objTo2dArray(this.creepypastasCategoriasMap);
    http.get('https://public-api.wordpress.com/rest/v1/sites/creepypastas.com/categories')
      .map(res => res.json())
      .subscribe(response => {
          response.categories.filter((item) => {
            switch (item.ID) {
              case 464:
              case 396:
              case 185:
                return false;
              default:
                this.creepypastasCategoriasMap[item.ID] = item;
                return true;
            }
          })
          localStorage.setItem('creepypastasCategorias', JSON.stringify(this.creepypastasCategoriasMap));
          this.creepypastasCategoriasKV = this.objTo2dArray(this.creepypastasCategoriasMap);
        }
      );
  }

  objTo2dArray(obj){
    let arr = [];
    for (var id in obj) {
      if (obj.hasOwnProperty(id)) {
        arr.push([ id, this.creepypastasCategoriasMap[id] ]);
      }
    }
    return arr;
  }

  requestFilteredCreepypastas(event, item) {
    this.nav.push(CreepypastasPage, {
      searchObject: item
    })
  }
}
