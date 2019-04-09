import alt from '../utils/Alt';
import TagActions from '../actions/TagActions';
import { decorate, bind } from 'alt-utils/lib/decorators';

@decorate(alt)
class TagStore {
  constructor() {
    this.state = {
      postsForTag: {}, // { tag1: [posts], tag2: [posts] }
      tagInfo: {}, // { tag1: { name: '', count: '' }, tag2: {} }
      tagPostsEnded: {}, // { tag1: true, tag2: false }
      tagSearchResults: [], // [tag1, tag2, ...]
    };
  }

  @bind(TagActions.getPostsForTag)
  setPostsForTag(posts) { // posts - { singleTag: [posts] }
    var tag = Object.keys(posts)[0];
    if (posts[tag]) { // if not from cache
      var newPostsForTag;
      if (posts[tag].length) { // if there are posts left
        if (!this.state.postsForTag[tag] || posts[tag][posts[tag].length-1].id !== this.state.postsForTag[tag][this.state.postsForTag[tag].length-1].id) { // if posts are not the same as before
          newPostsForTag = this.state.postsForTag;
          newPostsForTag[tag] = newPostsForTag[tag] ? newPostsForTag[tag].concat(posts[tag]) : posts[tag];
          this.setState({postsForTag: newPostsForTag});
        }
      } else { // there are no posts left any more to load
        var newTagPostsEnded = this.state.tagPostsEnded;
        newTagPostsEnded[tag] = true;
        this.setState({tagPostsEnded: newTagPostsEnded});
        if (!this.state.postsForTag[tag]) { // assign empty array so that loader stops spinning
          newPostsForTag = this.state.postsForTag;
          newPostsForTag[tag] = posts[tag];
          this.setState({postsForTag: newPostsForTag});
        }
      }
    } else { // if from cache
      if (this.state.postsForTag[tag]) {
        var lastSnapshot = this.state.postsForTag[tag][this.state.postsForTag[tag].length-1];
        TagActions.getPostsForTag(tag, lastSnapshot);
      } else {
        TagActions.getPostsForTag(tag, null);
      }
    }
  }

  @bind(TagActions.getTagInfo)
  setTagInfo(tagInfo) {
    var newTagInfo = this.state.tagInfo;
    newTagInfo[Object.keys(tagInfo)[0]] = tagInfo[Object.keys(tagInfo)[0]];
    this.setState({tagInfo: newTagInfo});
  }

  @bind(TagActions.searchForTag)
  setTagSearchResults(results) {
    this.setState({tagSearchResults: results});
  }
}

export default alt.createStore(TagStore);
