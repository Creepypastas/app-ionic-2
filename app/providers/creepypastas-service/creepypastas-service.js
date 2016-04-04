import {Injectable, Inject} from 'angular2/core';
import {Http} from 'angular2/http';

@Injectable()
export class CreepypastasService {
  static get parameters() {
    return [[Http]];
  }

  constructor(http) {
    this.http = http;
    this.creepypastasMap = null;
    this.creepypastasCategoriasMap = null;
    this.lastUpdated = null;
    this.loadFromLocalStorage();
  }

  loadFromLocalStorage() {
    this.creepypastasMap = JSON.parse( localStorage.getItem('creepypastas') || '{}' );
    this.creepypastasCategoriasMap = JSON.parse( localStorage.getItem('creepypastasCategorias') || '{}' );
    this.lastUpdated = JSON.parse(localStorage.getItem('lastUpdated')) || {categories:0,creepypastas:0};
  }

  objTo2dArray(obj){
    let arr = [];
    for (var id in obj) {
      if (obj.hasOwnProperty(id)) {
        arr.push([ id, obj[id] ]);
      }
    }
    return arr;
  }

  loadCats() {
    var deltaTime = (new Date()).getTime() - (this.lastUpdated.categories || 0);
    deltaTime = (Math.abs(deltaTime)/36e5);

    if (this.creepypastasCategoriasMap && deltaTime < 12) {
      this.creepypastasCategoriasKV = this.objTo2dArray(this.creepypastasCategoriasMap);
      console.log("app::categories from localStorage");
      return Promise.resolve(this.creepypastasCategoriasKV);
    }

    return new Promise(resolve => {
      this.http.get('https://public-api.wordpress.com/rest/v1/sites/creepypastas.com/categories')
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
          });
          localStorage.setItem('creepypastasCategorias', JSON.stringify(this.creepypastasCategoriasMap));

          this.lastUpdated.categories = ( (new Date()).getTime() );
          localStorage.setItem('lastUpdated', JSON.stringify(this.lastUpdated));

          this.creepypastasCategoriasKV = this.objTo2dArray(this.creepypastasCategoriasMap);
          console.log("app:categories from json api");
          resolve(this.creepypastasCategoriasKV);
        });
    });
  }

  loadCreepypastas(searchCriteria) {
    var deltaTime = (new Date()).getTime() - (this.lastUpdated.creepypastas || 0);
    deltaTime = (Math.abs(deltaTime)/36e5);

    if (this.creepypastasMap && deltaTime < 1) {
      this.creepypastasKV = this.objTo2dArray(this.creepypastasMap);
      console.log("app::creepypastas from localStorage");
      return Promise.resolve(this.filterCreepypastas(searchCriteria));
    }

    return new Promise(resolve => {
      this.http.get('https://public-api.wordpress.com/rest/v1/sites/creepypastas.com/posts/?number=100')
        .map(res => res.json())
        .subscribe(response => {
          response.posts.filter((item) => {
            if (typeof item.status !== 'undefined' && item.status === 'publish') {
              this.creepypastasMap[item.ID] = item;
              return true;
            }
            return false;
          });
          localStorage.setItem('creepypastas', JSON.stringify(this.creepypastasMap));

          this.lastUpdated.creepypastas = ( (new Date()).getTime() );
          localStorage.setItem('lastUpdated', JSON.stringify(this.lastUpdated));

          this.creepypastasKV = this.objTo2dArray(this.creepypastasMap);
          console.log("app::creepypastas from json api");
          resolve(this.filterCreepypastas(searchCriteria));
        });
    });
  }

  filterCreepypastas(searchCriteria) {
    if (!searchCriteria){
      searchCriteria = {
        query: '',
        categoryID: false
      };
    }

    console.log(searchCriteria);

    var q = searchCriteria.query.replace(/[_\W]/g, '').toLowerCase();
    localStorage.setItem('searchQuery', q);

    var filteredCreepypastas = this.creepypastasKV.filter((item) => {
      if (q === '' && !searchCriteria.categoryID){
        return true;
      }
      if (item[1].title.replace(/[_\W]/g, '').toLowerCase().indexOf(q) <= -1) {
        return false;
      }
      if (searchCriteria.categoryID && !this.itemHasCategory(item[1], searchCriteria.categoryID)){
        return false;
      }
      return true;
    });

    return filteredCreepypastas;
  }

  itemHasCategory(item,categoryID) {
    for (var cat in item.categories) {
      if (item.categories.hasOwnProperty(cat)) {
        if(item.categories[cat].ID === categoryID){
          return true;
        }
      }
    }
    return false;
  }

}
