import alt from '../utils/Alt';
import UpvoteActions from '../actions/UpvoteActions';
import {decorate, bind} from 'alt-utils/lib/decorators';

@decorate(alt)
class UpvoteStore {
  constructor() {
    this.state = {
      upvotes: {},
    };
  }

  @bind(UpvoteActions.getUpvotes)
  getUpvotes(upvotes) {
    var oldUpvotes = this.state.upvotes;
    var newUpvotes = Object.assign(oldUpvotes, upvotes);
    this.setState({upvotes: newUpvotes});
  }

}

export default alt.createStore(UpvoteStore);
