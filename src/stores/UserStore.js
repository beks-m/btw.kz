import alt from '../utils/Alt';
import UserActions from '../actions/UserActions';
import {decorate, bind} from 'alt-utils/lib/decorators';

@decorate(alt)
class UserStore {
  constructor() {
    this.state = {
      users: {}, // { uid1: {name: '', photoURL: '', ...}, uid2: {} }
      activityForUser: {}, // { uid1: [activity], uid2: [activity]}
      activityEnded: {},
      hunterPostsForUser: {}, // { uid1: [posts], uid2: [posts] }
      hunterPostsEnded: {}, // { uid1: false, uid2: true }
      makerPostsForUser: {}, // { uid1: [posts], uid2: [posts] }
      makerPostsEnded: {}, // { uid1: false, uid2: true }
      editorPostsForUser: {}, // { uid1: [posts], uid2: [posts] }
      editorPostsEnded: {}, // { uid1: false, uid2: true }
    };
  }

  @bind(UserActions.getUsers)
  getUsers(users) {
    var oldUsers = this.state.users;
    var newUsers = Object.assign(oldUsers, users);
    this.setState({users: newUsers});
  }

  @bind(UserActions.getActivityForUser)
  getActivityForUser(activity) {
    var user = Object.keys(activity)[0];
    if (activity[user]) { // if not from cache
      var newActivityForUser;
      if (activity[user].length) { // if there are activity left
        if (!this.state.activityForUser[user] || activity[user][activity[user].length-1].id !== this.state.activityForUser[user][this.state.activityForUser[user].length-1].id) { // if activity are not the same as before
          newActivityForUser = this.state.activityForUser;
          newActivityForUser[user] = newActivityForUser[user] ? newActivityForUser[user].concat(activity[user]) : activity[user];
          this.setState({activityForUser: newActivityForUser});
        }
      } else { // there are no activity left any more to load
        var newActivityEnded = this.state.activityEnded;
        newActivityEnded[user] = true;
        this.setState({activityEnded: newActivityEnded});
        if (!this.state.activityForUser[user]) {
          newActivityForUser = this.state.activityForUser;
          newActivityForUser[user] = activity[user];
          this.setState({activityForUser: newActivityForUser});
        }
      }
    } else { // if from cache
      if (this.state.activityForUser[user]) {
        var lastSnapshot = this.state.activityForUser[user][this.state.activityForUser[user].length-1];
        UserActions.getActivityForUser(user, lastSnapshot);
      } else {
        UserActions.getActivityForUser(user, null);
      }
    }
  }

  @bind(UserActions.getHunterPostsForUser)
  getHunterPosts(posts) {
    var user = Object.keys(posts)[0];
    if (posts[user]) { // if not from cache
      var newHunterPostsForUser;
      if (posts[user].length) { // if there are posts left
        if (!this.state.hunterPostsForUser[user] || posts[user][posts[user].length-1].id !== this.state.hunterPostsForUser[user][this.state.hunterPostsForUser[user].length-1].id) { // if posts are not the same as before
          newHunterPostsForUser = this.state.hunterPostsForUser;
          newHunterPostsForUser[user] = newHunterPostsForUser[user] ? newHunterPostsForUser[user].concat(posts[user]) : posts[user];
          this.setState({hunterPostsForUser: newHunterPostsForUser});
        }
      } else { // there are no posts left any more to load
        var newHunterPostsEnded = this.state.hunterPostsEnded;
        newHunterPostsEnded[user] = true;
        this.setState({hunterPostsEnded: newHunterPostsEnded});
        if (!this.state.hunterPostsForUser[user]) {
          newHunterPostsForUser = this.state.hunterPostsForUser;
          newHunterPostsForUser[user] = posts[user];
          this.setState({hunterPostsForUser: newHunterPostsForUser});
        }
      }
    } else { // if from cache
      if (this.state.hunterPostsForUser[user]) {
        var lastSnapshot = this.state.hunterPostsForUser[user][this.state.hunterPostsForUser[user].length-1];
        UserActions.getHunterPostsForUser(user, lastSnapshot);
      } else {
        UserActions.getHunterPostsForUser(user, null);
      }
    }
  }

    @bind(UserActions.getMakerPostsForUser)
    getMakerPosts(posts) {
      var user = Object.keys(posts)[0];
      if (posts[user]) { // if not from cache
        var newMakerPostsForUser;
        if (posts[user].length) { // if there are posts left
          if (!this.state.makerPostsForUser[user] || posts[user][posts[user].length-1].id !== this.state.makerPostsForUser[user][this.state.makerPostsForUser[user].length-1].id) { // if posts are not the same as before
            newMakerPostsForUser = this.state.makerPostsForUser;
            newMakerPostsForUser[user] = newMakerPostsForUser[user] ? newMakerPostsForUser[user].concat(posts[user]) : posts[user];
            this.setState({makerPostsForUser: newMakerPostsForUser});
          }
        } else { // there are no posts left any more to load
          var newMakerPostsEnded = this.state.makerPostsEnded;
          newMakerPostsEnded[user] = true;
          this.setState({makerPostsEnded: newMakerPostsEnded});
          if (!this.state.makerPostsForUser[user]) {
            newMakerPostsForUser = this.state.makerPostsForUser;
            newMakerPostsForUser[user] = posts[user];
            this.setState({makerPostsForUser: newMakerPostsForUser});
          }
        }
      } else { // if from cache
        if (this.state.makerPostsForUser[user]) {
          var lastSnapshot = this.state.makerPostsForUser[user][this.state.makerPostsForUser[user].length-1];
          UserActions.getMakerPostsForUser(user, lastSnapshot);
        } else {
          UserActions.getMakerPostsForUser(user, null);
        }
      }
    }

    @bind(UserActions.getEditorPostsForUser)
    getEditorPosts(posts) {
      var user = Object.keys(posts)[0];
      if (posts[user]) { // if not from cache
        var newEditorPostsForUser;
        if (posts[user].length) { // if there are posts left
          if (!this.state.editorPostsForUser[user] || posts[user][posts[user].length-1].id !== this.state.editorPostsForUser[user][this.state.editorPostsForUser[user].length-1].id) { // if posts are not the same as before
            newEditorPostsForUser = this.state.editorPostsForUser;
            newEditorPostsForUser[user] = newEditorPostsForUser[user] ? newEditorPostsForUser[user].concat(posts[user]) : posts[user];
            this.setState({editorPostsForUser: newEditorPostsForUser});
          }
        } else { // there are no posts left any more to load
          var newEditorPostsEnded = this.state.editorPostsEnded;
          newEditorPostsEnded[user] = true;
          this.setState({editorPostsEnded: newEditorPostsEnded});
          if (!this.state.editorPostsForUser[user]) {
            newEditorPostsForUser = this.state.editorPostsForUser;
            newEditorPostsForUser[user] = posts[user];
            this.setState({editorPostsForUser: newEditorPostsForUser});
          }
        }
      } else { // if from cache
        if (this.state.editorPostsForUser[user]) {
          var lastSnapshot = this.state.editorPostsForUser[user][this.state.editorPostsForUser[user].length-1];
          UserActions.getEditorPostsForUser(user, lastSnapshot);
        } else {
          UserActions.getEditorPostsForUser(user, null);
        }
      }
    }

}

export default alt.createStore(UserStore);
