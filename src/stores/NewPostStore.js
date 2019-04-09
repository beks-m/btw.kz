import alt from '../utils/Alt';
import NewPostActions from '../actions/NewPostActions';
import { decorate, bind } from 'alt-utils/lib/decorators';

@decorate(alt)
class NewPostStore {
  constructor() {
    this.state = {
      uploadProgress: 0,
      postSubmitted: false,
    };
  }

  @bind(NewPostActions.sendPostToModeration, NewPostActions.saveModeratedPost, NewPostActions.saveModeratedPostToFirebase, NewPostActions.saveEditedPost, NewPostActions.saveEditedPostToFirebase, NewPostActions.clearNewPostProps)
  getUploadProgress(postSubmissionStatus) {
    this.setState({uploadProgress: postSubmissionStatus.uploadProgress, postSubmitted: postSubmissionStatus.postSubmitted });
  }

}

export default alt.createStore(NewPostStore);
