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

    this.requestedItem.post_content = (typeof this.requestedItem.post_content === 'undefined') ? 'cargando...' : this.requestedItem.post_content;

    http.get('https://cli.creepypastas.com/single-post.cgi?post_id=' + this.requestedItem.ID)
      .map(res => res.json())
      .subscribe(onlineItem => this.requestedItem = onlineItem);
  }
}
