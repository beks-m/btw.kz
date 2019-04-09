import alt from '../utils/Alt';
import AdminActions from '../actions/AdminActions';
import { decorate, bind } from 'alt-utils/lib/decorators';

@decorate(alt)
class AdminStore {
  constructor() {
    this.state = {
      unmoderatedPosts: null,
      unmoderatedComments: null, // [{id: 'fdsf', content: 'fdsf', ...}, {}, ... ]
      commentStatuses: {}, // { id1: true, id2: false, ... }
      userActivity: {}, // { last: [], date1: [], date2: [], ... }
      users: [],
      usersEnded: false,
    };
  }

  @bind(AdminActions.getUnmoderatedPosts)
  getUnmoderatedPosts(unmoderatedPosts) {
    this.setState({ unmoderatedPosts: unmoderatedPosts});
  }

  @bind(AdminActions.getUnmoderatedComments)
  setUnmoderatedComments(comments) {
    if (comments) {
      this.setState({unmoderatedComments: comments});
    } else {
      AdminActions.getUnmoderatedComments();
    }
  }

  @bind(AdminActions.setCommentStatus)
  setCommentStatus(commentStatuses) {
    var oldCommentStatuses = this.state.commentStatuses;
    var newCommentStatuses = Object.assign(oldCommentStatuses, commentStatuses);
    this.setState({commentStatuses: newCommentStatuses});
  }

  @bind(AdminActions.getUserActivityForDate)
  setUserActivity(userActivity) {
    if (userActivity.notFound) {
      AdminActions.getUserActivityForDate(userActivity.date);
    } else {
      var oldUserActivity = this.state.userActivity;
      var newUserActivity = Object.assign(oldUserActivity, userActivity);
      this.setState({userActivity: newUserActivity});
    }
  }

  @bind(AdminActions.getUsers)
  setUsers(users) {
    if (users.notFound) {
      AdminActions.getUsers(users.lastSnapshot);
    } else {
      var newUsers = this.state.users;
      newUsers = newUsers ? newUsers.concat(users) : users;
      this.setState({users: newUsers});
      if (!users.length || users.length < 10) {
        this.setState({usersEnded: true});
      }
    }
  }
}

export default alt.createStore(AdminStore);
