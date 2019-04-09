import alt from '../utils/Alt';
import SinglePostActions from '../actions/SinglePostActions';
import {decorate, bind} from 'alt-utils/lib/decorators';

@decorate(alt)
class SinglePostStore {
  constructor() {
    this.state = {
      post: null,
      comments: {},
    };
  }

  @bind(SinglePostActions.getPost, SinglePostActions.unsubscribeForPost)
  getPost(post) {
    if (post && post.fromCache) {
      SinglePostActions.getPost(post.id);
    } else {
      this.setState({post: post});
    }
  }

  @bind(SinglePostActions.getCommentsForPost)
  getCommentsForPost(comments) {
    var oldComments = this.state.comments;
    var newComments = Object.assign(oldComments, comments);
    this.setState({comments: newComments});
  }

}

export default alt.createStore(SinglePostStore);
