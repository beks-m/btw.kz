import alt from '../alt/Alt';
import Actions from '../actions/Actions';
import {decorate, bind} from 'alt-utils/lib/decorators';
import * as moment from 'moment';
import 'moment/locale/ru';
import ReactGA from 'react-ga';

@decorate(alt)
class DefaultStore {
  constructor() {
    var city = localStorage.getItem('city');
    ReactGA.set({ dimension1: city });
    if (!city) {
      city = 'Almaty'
      localStorage.setItem('city', 'Almaty');
      ReactGA.set({ dimension1: city });
    }
    this.state = {
      user: null,
      posts: {},
      upvotes: {},
      isUpvoted: {},
      singlePost: null,
      comments: {},
      users: {},
      city: city,
      uploadProgress: 0,
      postSubmitted: false,
      unmoderatedPosts: [],
      events: {},
      places: []
    };
  }

  @bind(Actions.login, Actions.initSession, Actions.logout)
  setUser(user) {
    var newIsUpvoted = {}
    if (this.state.user && !user) { // logged out
      Object.keys(this.state.isUpvoted).forEach((postID) => {
        newIsUpvoted[postID] = false;
      });
      this.setState({isUpvoted: newIsUpvoted});
    } else if (!this.state.user && user) { // logged in
      Object.keys(this.state.upvotes).forEach((postID) => {
        newIsUpvoted[postID] = false;
        this.state.upvotes[postID].forEach((upvote) => {
          if (user.uid === upvote.user) {
            newIsUpvoted[postID] = true;
          }
        });
      });
      this.setState({isUpvoted: newIsUpvoted});
    }
    this.setState({user: user});
  }

  @bind(Actions.changeCity)
  getCity(city) {
    this.setState({city: city, posts: {}, events: {}, places: []});
    var dateDocID = moment().utcOffset('+0600').format('L');
    Actions.getPosts.defer(dateDocID, this.state.city);
    Actions.getEvents.defer(dateDocID, this.state.city)
  }

  @bind(Actions.getPosts)
  getPosts(posts) {
    if (posts[Object.keys(posts)[0]]) {
      var thisPosts = this.state.posts;
      thisPosts[Object.keys(posts)[0]] = posts[Object.keys(posts)[0]];
      this.setState({posts: thisPosts});
      // load also if user upvoted posts and update counts
      if (posts[Object.keys(posts)[0]]['allPosts'].length > 0) {
        Actions.getUpvotes.defer(posts[Object.keys(posts)[0]]['allPosts']);
      }
    } else { // if firestore loaded data from cache fetch it again
      Actions.getPosts(Object.keys(posts)[0], this.state.city);
    }
  }

  @bind(Actions.getEvents)
  getEvents(events) {
    if (events[Object.keys(events)[0]]) {
      var thisEvents = this.state.events;
      thisEvents[Object.keys(events)[0]] = events[Object.keys(events)[0]];
      this.setState({events: thisEvents});
    } else { // if firestore loaded data from cache fetch it again
      Actions.getEvents(Object.keys(events)[0], this.state.city);
    }
  }

  @bind(Actions.getUpvotes)
  getUpvotes(upvotes) {
    var thisUpvotes = this.state.upvotes;
    var newUpvotes = Object.assign(thisUpvotes, upvotes);
    this.setState({upvotes: newUpvotes});
    // check if user upvoted posts
    var newIsUpvoted = this.state.isUpvoted;
    Object.keys(upvotes).forEach((postID) => {
      newIsUpvoted[postID] = false;
      if (this.state.user) {
        upvotes[postID].forEach((upvote) => {
          if (this.state.user.uid === upvote.user) {
            newIsUpvoted[postID] = true;
          }
        });
      }
    });
    this.setState({isUpvoted: newIsUpvoted});

  }

  @bind(Actions.addUpvote, Actions.removeUpvote)
  getIsUpvoted(postIsUpvoted) {
    var newIsUpvoted = this.state.isUpvoted;
    newIsUpvoted[postIsUpvoted.postID] = postIsUpvoted.isUpvoted;
    this.setState({isUpvoted: newIsUpvoted});
  }

  @bind(Actions.getSinglePost, Actions.unsubscribeForPost)
  getSinglePost(singlePost) {
    if (singlePost !== null && singlePost.id !== 0) {
      Actions.getUpvotes.defer([singlePost]);
    }
    this.setState({singlePost: singlePost});
  }

  @bind(Actions.getCommentsForPost)
  getCommentsForPost(comments) {
    var thisComments = this.state.comments;
    var newComments = Object.assign(thisComments, comments);
    this.setState({comments: newComments});
  }

  @bind(Actions.getUsers)
  getUsers(users) {
    var thisUsers = this.state.users;
    var newUsers = Object.assign(thisUsers, users);
    this.setState({users: newUsers});
  }

  @bind(Actions.sendPostToModeration, Actions.addNewPost, Actions.savePost)
  getUploadProgress(postSubmissionStatus) {
    this.setState({uploadProgress: postSubmissionStatus.uploadProgress, postSubmitted: postSubmissionStatus.postSubmitted });
  }

  @bind(Actions.getUnmoderatedPosts)
  getUnmoderatedPosts(unmoderatedPosts) {
    this.setState({ unmoderatedPosts: unmoderatedPosts});
  }
}

export default alt.createStore(DefaultStore);
