import {IonicApp, Modal, Platform, NavController, NavParams, Page, ViewController} from 'ionic-angular';
import {UserService} from '../../providers/user-service/user-service';

@Page({
  templateUrl: 'build/pages/people-modal/people-modal.html',
})
export class PeopleModalPage {
  static get parameters() {
    return [[Platform],[NavParams],[ViewController],[UserService]];
  }

  constructor(platform, navParams, viewCtrl, userService) {
    console.debug("app::PeopleModalPage::constructor");
    this.platform = platform;
    this.navParams = navParams;
    this.viewCtrl = viewCtrl;
    this.userService = userService;
    this.configSegment = 'user';

    this.user = {
      credentials : {},
      gangs: []
    };

    console.debug("app::PeopleModalPage::navParams::", this.navParams);
    this.userCount = this.navParams.get('userCount');
    console.debug("app:PeopleModalPage::userCount::", this.userCount);

    this.loadUserFromLF();
  }

  loadUserFromLF() {
    let self = this;
    var userPromise = this.userService.loadFromLF();
    userPromise.then({

    })

    userPromise.then(function(userObject) {
      self.user = userObject;
    });

  }

  close() {
    this.viewCtrl.dismiss();
  }
}
