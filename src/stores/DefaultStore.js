import alt from '../alt/Alt';
import Actions from '../actions/Actions';
import {decorate, bind} from 'alt-utils/lib/decorators';

@decorate(alt)
class DefaultStore {
  constructor() {
    this.state = {
      user: null,
      posts: [],
      post: null,
      comments: {}
    };
  }

  @bind(Actions.login, Actions.initSession, Actions.logout)
  setUser(user) {
    this.setState({user: user});
  }

  @bind(Actions.getPosts)
  getPosts(posts) {
    this.setState({posts: posts});
  }

  @bind(Actions.getSinglePost)
  getSinglePost(post) {
    this.setState({post: post});
  }

  @bind(Actions.getCommentsForPost)
  getCommentsForPost(comments) {
    var stateComments = this.state.comments;
    var obj = Object.assign(stateComments, comments);
    this.setState({comments: obj});
  }
}

export default alt.createStore(DefaultStore);
