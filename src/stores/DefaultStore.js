import alt from '../utils/Alt';
import Actions from '../actions/Actions';
import PostsActions from '../actions/PostsActions';
import {decorate, bind} from 'alt-utils/lib/decorators';
import * as moment from 'moment';
import 'moment/locale/ru';

@decorate(alt)
class DefaultStore {
  constructor() {
    var city = localStorage.getItem('city');
    if (!city) {
      city = 'Almaty'
    }
    this.state = {
      user: null,
      city: city,
      loginIncorrectError: false,
    };
  }

  @bind(Actions.login, Actions.loginWithEmail, Actions.initSession, Actions.logout)
  setUser(user) {
    if (user && user.code) {
      this.setState({loginIncorrectError: true});
    } else {
      this.setState({user: user});
    }
  }

  @bind(Actions.changeCity)
  getCity(city) {
    this.setState({city: city});
    var dateDocID = moment().utcOffset('+0600').format('DD-MM-YYYY');
    PostsActions.getPosts.defer(dateDocID, this.state.city);
    PostsActions.getTimedPostsForDate.defer(dateDocID, this.state.city);
  }

}

export default alt.createStore(DefaultStore);
