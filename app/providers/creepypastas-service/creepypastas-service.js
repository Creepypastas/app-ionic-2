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
    this.startupLoad();
  }

  startupLoad() {
    this.loadFromLocalStorage();
    if (null === this.creepypastasCategoriasMap || null === this.creepypastasMap){
      var servSelf = this;
      var catsProm = this.loadCats();
      catsProm.then(function(catsKV) {
        for (var i = 0; i < catsKV.length; i++) {
          servSelf.loadCreepypastas({
            categoryID:catsKV[i][1].ID,
            categorySlug:catsKV[i][1].slug,
            thisIsPreload:true
          });
        }
      });
    }
  }

  loadFromLocalStorage() {
    this.creepypastasMap = JSON.parse( localStorage.getItem('creepypastas') ) || null;
    this.creepypastasCategoriasMap = JSON.parse( localStorage.getItem('creepypastasCategorias') ) || null;
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

    if (this.creepypastasCategoriasMap && deltaTime < 24) {
      this.creepypastasCategoriasKV = this.objTo2dArray(this.creepypastasCategoriasMap);
      console.log("app::categories from localStorage::deltaTime");
      return Promise.resolve(this.creepypastasCategoriasKV);
    }

    return new Promise(resolve => {
      this.http.get('https://public-api.wordpress.com/rest/v1/sites/creepypastas.com/categories?fields=ID,slug,name,post_count,description')
        .map(res => res.json())
        .subscribe(
        response => {
          this.creepypastasCategoriasMap = this.creepypastasCategoriasMap || {};
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
          console.log("app::categories from json api");
          this.lastUpdated.categories = ( (new Date()).getTime() );
          localStorage.setItem('lastUpdated', JSON.stringify(this.lastUpdated));
        },
        error => {
          if(null === this.creepypastasCategoriasMap){
            this.creepypastasCategoriasMap = {14980:{name:"Doomsdaypastas",slug:"doomsdaypastas",post_count:6,description:"Creepypastas del fin del mundo o apocalípticas. Aunque no son creepypastas como tal, pues al contener argumentos tan devastadores la duda de si pasó realmente no está presente, sigue siendo un subgénero atesorado por nuestros usuarios. <i>Doomsday</i> es gringo para «día del juicio». ",}};
            console.log("app::categories fallback from preloaded");
          } else{
            console.log("app::categories fallback from localStorage");
          }
          resolve(this.storeAndComplete('creepypastasCategorias',this.creepypastasCategoriasMap));
        },
        () => {
          console.log("app::categories complete");
          resolve(this.storeAndComplete('creepypastasCategorias',this.creepypastasCategoriasMap));
        }
      );
    });
  }

  storeAndComplete(name,map){
    console.log('app::resolve::' + name + 'KV');
    localStorage.setItem(name, JSON.stringify(map));
    this[name+'KV'] = this.objTo2dArray(map);
    return this[name+'KV'];
  }


  loadCreepypastas(searchCriteria) {
    if (!searchCriteria){
      searchCriteria = {
        query: '',
        categoryID: false,
        forceLocal: false,
        thisIsPreload: false
      };
    }

    var lastUpdated = this.lastUpdated[searchCriteria.categorySlug || 'creepypastas'];
    var deltaTime = (new Date()).getTime() - (lastUpdated || 0);
    deltaTime = (Math.abs(deltaTime)/36e5);

    if (searchCriteria.forceLocal || (this.creepypastasMap && deltaTime < 12)) {
      this.creepypastasKV = this.objTo2dArray(this.creepypastasMap);
      console.log("app::creepypastas from localStorage");
      return Promise.resolve(this.filterCreepypastas(searchCriteria));
    }

    var requestURL = 'https://public-api.wordpress.com/rest/v1/sites/creepypastas.com/posts/?number=100&fields=ID,title,date,categories,status';
    if(!searchCriteria.thisIsPreload){
      requestURL+= ',content';
    }
    if(searchCriteria.categorySlug){
      requestURL+= '&category=' + searchCriteria.categorySlug;
    }

    return new Promise(resolve => {
      this.http.get(requestURL)
        .map(res => res.json())
        .subscribe(
        response => {
          response.posts.filter((item) => {
            this.creepypastasMap = this.creepypastasMap || {};
            if (typeof item.status !== 'undefined' && item.status === 'publish') {
              item.categories = this.sanitizeCategories(item.categories);
              this.creepypastasMap[item.ID] = item;
              return true;
            }
            return false;
          });
          localStorage.setItem('creepypastas', JSON.stringify(this.creepypastasMap));
          if(!searchCriteria.thisIsPreload) {
            this.lastUpdated[searchCriteria.categorySlug || 'creepypastas'] = ( (new Date()).getTime() );
            localStorage.setItem('lastUpdated', JSON.stringify(this.lastUpdated));
          }
          this.creepypastasKV = this.objTo2dArray(this.creepypastasMap);
          console.log("app::creepypastas from json api");
          resolve(this.filterCreepypastas(searchCriteria));
        },
        error => {
          this.creepypastasMap = this.creepypastasMap || {};
          console.error(error);
          this.creepypastasKV = this.objTo2dArray(this.creepypastasMap);
          console.log("app::creepypastas fallback from localStorage");
          resolve(this.filterCreepypastas(searchCriteria));
        },
        () => {
          console.log("app::creepypastas complete");
        }
      );
    });
  }

  filterCreepypastas(searchCriteria) {
    console.log(searchCriteria);

    var q = (searchCriteria.query || '');
    localStorage.setItem('searchQuery', q);
    q = q.replace(/[_\W]/g, '').toLowerCase();

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

  sanitizeObj(object,wantedFieldsArray) {
    var obj = {};
    for (var i=0; i<wantedFieldsArray.length; i++) {
      if (object.hasOwnProperty(wantedFieldsArray[i])) {
        obj[wantedFieldsArray[i]] = object[wantedFieldsArray[i]];
      }
    }
    return obj;
  }

  sanitizeCategories(categoriesMap) {
    for (var cat in categoriesMap) {
      if (categoriesMap.hasOwnProperty(cat)) {
        categoriesMap[cat] = this.sanitizeObj(categoriesMap[cat],['ID']);
      }
    }
    return categoriesMap;
  }


}
