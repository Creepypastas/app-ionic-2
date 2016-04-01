import {Page, NavController, NavParams} from 'ionic-angular';
import {Http} from 'angular2/http';
import 'rxjs/add/operator/map';

@Page({
  templateUrl: 'build/pages/singlepost/singlepost.html'
})
export class SinglePostPage {
  static get parameters() {
    return [[NavController], [NavParams], [Http]];
  }

  constructor(nav, navParams, http) {
    this.nav = nav;
    this.requestedItem = navParams.get('item');
  }
}
