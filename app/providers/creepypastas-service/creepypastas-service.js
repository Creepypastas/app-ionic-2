import {Toast} from 'ionic-angular';
import {Injectable, Inject} from 'angular2/core';
import {Http} from 'angular2/http';
import 'rxjs/add/operator/map';
import io from 'socket.io-client';

@Injectable()
export class CreepypastasService {
  static get parameters() {
    return [[Http]];
  }

  constructor(http) {
    this.http = http;
    this.nav = null;
    this.socket = io('https://wss.creepypastas.com:8000');
    this.userCount = 0;
    this.creepypastasMap = null;
    this.creepypastasCategoriasMap = null;
    this.lastUpdated = null;
    this.lf = localforage.createInstance({
      name: 'creepypastas.creepypastas.com'
    });

    this.startupLoad();
    this.buildSocket();
  }

  setNav(nav) {
    this.nav = nav;
  }

  showUsersOnlineTOAST(msg) {

   var message = '';

    if (!msg) {
      message = this.userCount + ' espectros conectados.';
    }else {
      message = msg;
    }

    let toast = Toast.create({
      message: message,
      duration: 150
    });

    toast.onDismiss(() => {
      console.log('Dismissed toast');
    });

    this.nav.present(toast);
  }

  buildSocket() {
    console.log("app::cpsocket::buildSocket");
    this.socket.on('connect', function(){});
    this.socket.on('disconnect', function(){});

    let srvSelf = this;
    this.socket.on('user::count', function(userCount){
      srvSelf.userCount = userCount;
      if (null !== srvSelf.nav) {
	var msg = userCount + ' espectros merodeando.';
        srvSelf.showUsersOnlineTOAST(msg);
      }
    });

    this.socket.emit('msg', 'msg');
  }


  startupLoad() {
    console.debug("app::startupLoad");
    this.loadFromLocalStorage();
  }

  loadFromLocalStorage() {
    var self = this;
    console.debug("app::asyncLoadFromLocalForage");
    var creepypastasP = this.lf.getItem('creepypastas');
    var categoriesP = this.lf.getItem('creepypastasCategorias');
    var lastUP = this.lf.getItem('lastUpdated');

    return Promise.all([creepypastasP, categoriesP, lastUP]).then(function(values) {
      console.debug("app::asyncLoadFromLocalForage::resolve:all")
      self.creepypastasMap = values[0] || require("./creepypastas") || null;
      self.creepypastasCategoriasMap = values[1] || require("./categories") || null;
      self.lastUpdated = values[2] || {categories:-1, creepypastas:-1};
      return Promise.resolve(values);
    });
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

    if (this.lastUpdated.categories === -1){
      console.log("app::resolve categories from preloaded data::-1");
      this.lastUpdated.categories = 0;
      this.creepypastasCategoriasKV = this.objTo2dArray(this.creepypastasCategoriasMap);
      return Promise.resolve(this.creepypastasCategoriasKV);
    }

    if (this.creepypastasCategoriasMap && deltaTime < 24) {
      this.creepypastasCategoriasKV = this.objTo2dArray(this.creepypastasCategoriasMap);
      console.log("app::categories from localStorage::deltaTime");
      return Promise.resolve(this.creepypastasCategoriasKV);
    }

    console.log("app::categories will try json api");

    return new Promise(resolve => {
      this.http.get('https://public-api.wordpress.com/rest/v1/sites/creepypastas.com/categories?fields=ID,slug,name,post_count,description')
        .map(res => res.json())
        .subscribe(
          response => {
            console.log("app::categories::http::response");
            console.log("app::categories updated from json api");
            this.creepypastasCategoriasMap = this.creepypastasCategoriasMap || {};
            console.log(response.categories);
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
            this.lastUpdated.categories = ( (new Date()).getTime() );
            this.lf.setItem('lastUpdated', this.lastUpdated);
          },
          error => {
            console.error("app:categories::http::error");
            if(null === this.creepypastasCategoriasMap){
              this.creepypastasCategoriasMap = require('./categories');
              console.log("app::categories fallback from preloaded");
            } else{
              console.log("app::categories fallback from localStorage");
            }
            resolve(this.storeAndComplete('creepypastasCategorias',this.creepypastasCategoriasMap));
          },
          () => {
            console.log("app:categories::http::complete");
            resolve(this.storeAndComplete('creepypastasCategorias',this.creepypastasCategoriasMap));
          }
      );
    });
  }

  storeAndComplete(name,map){
    console.debug('app::store::' + name + 'KV');
    this.lf.setItem(name, map);
    this[name+'KV'] = this.objTo2dArray(map);
    return this[name+'KV'];
  }

  loadSinglePost(postID){
    var apiURL = 'https://public-api.wordpress.com/rest/v1/sites/creepypastas.com/posts/';
    apiURL+=postID;
    apiURL+='?fields=ID,title,date,categories,status,content';
    console.debug(apiURL);

    if(!postID){
      console.error("service::loadSinglePost::postID is undefined");
      return Promise.resolve({success:false,error:true,data:null});
    }

    return new Promise(resolve => {
      this.http.get(apiURL)
        .map(res => res.json())
        .subscribe(
          response => {
            console.log("app::singlepost::http::response");
            console.debug(response);
            this.creepypastasMap = this.creepypastasMap || {};
            this.creepypastasMap[response.ID] = response;
            this.creepypastasKV = this.objTo2dArray(this.creepypastasMap);
            var responseObj = {
              success: true,
              data:response
            };
            this.storeAndComplete('creepypastas',this.creepypastasMap);
            resolve(responseObj);
          },
          error => {
            console.error("app:singlepost::http::error", error);
            resolve({success:false,error:true,data:null});
          },
          () => {
            console.log("app:categories::http::complete");
          }
      );
    });

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

    if (lastUpdated === -1 || !lastUpdated) {
      console.log("app::creepypastas from preloaded::-1");
      this.creepypastasKV = this.objTo2dArray(this.creepypastasMap);
      console.log("app::KV::", this.creepypastasKV);
      this.lastUpdated[searchCriteria.categorySlug || 'creepypastas'] = 1;
      return Promise.resolve(this.filterCreepypastas(searchCriteria));
    }

    if (searchCriteria.forceLocal || (this.creepypastasMap && deltaTime < 12)) {
      this.creepypastasKV = this.objTo2dArray(this.creepypastasMap);
      if(searchCriteria.forceLocal)
        console.log("app::creepypastas from localStorage::forceLocal");
      else {
        console.log("app::creepypastas from localStorage::deltaTime");
      }
      return Promise.resolve(this.filterCreepypastas(searchCriteria));
    }
    var requestURL = 'https://public-api.wordpress.com/rest/v1/sites/creepypastas.com/posts/?number=100&fields=ID,title,date,categories,status';
    if(!searchCriteria.thisIsPreload){
      requestURL+= ',content';
    }
    if(searchCriteria.categorySlug){
      requestURL+= '&category=' + searchCriteria.categorySlug;
    }
    console.debug("filtering.152 " + requestURL);
    return new Promise(resolve => {
      this.http.get(requestURL)
        .map(res => res.json())
        .subscribe(
        response => {
          console.debug("filtering.158");
          response.posts.filter((item) => {
            this.creepypastasMap = this.creepypastasMap || {};
            if (typeof item.status !== 'undefined' && item.status === 'publish') {
              item.categories = this.sanitizeCategories(item.categories);
              this.creepypastasMap[item.ID] = item;
              return true;
            }
            return false;
          });
          if(!searchCriteria.thisIsPreload) {
            this.lastUpdated[searchCriteria.categorySlug || 'creepypastas'] = ( (new Date()).getTime() );
            this.lf.setItem('lastUpdated', this.lastUpdated);
          }
          console.log("app::creepypastas from json api");
        },
        error => {
          console.log("filtering.175");
          this.creepypastasMap = this.creepypastasMap || {};
          console.error(error);
          this.creepypastasKV = this.objTo2dArray(this.creepypastasMap);
          console.log("app::creepypastas fallback from localStorage");
          this.storeAndComplete('creepypastas',this.creepypastasMap);
          resolve(this.filterCreepypastas(searchCriteria));
        },
        () => {
          console.log("filtering.184");
          console.log("app::creepypastas complete");
          this.storeAndComplete('creepypastas',this.creepypastasMap);
          resolve(this.filterCreepypastas(searchCriteria));
        }
      );
    });
  }

  filterCreepypastas(searchCriteria) {
    console.log(searchCriteria);

    var q = (searchCriteria.query || '');
    this.lf.setItem('searchQuery', q);
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

    console.debug("filteredCreepypastas", filteredCreepypastas);
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

  getRandomCreepypasta(){
    return this.creepypastasKV[Math.floor(Math.random() * this.creepypastasKV.length)];
  }

}
