import alt from '../utils/Alt';
import PostsActions from '../actions/PostsActions';
import { decorate, bind } from 'alt-utils/lib/decorators';

@decorate(alt)
class PostsStore {
  constructor() {
    this.state = {
      posts: {}, // { date1: { posts: [], eventPosts: [], productPosts: [], ... }, date2: {} }
      timedPostsForDate: {}, // { date1: [posts], date2: [posts] }
      eventsForDate: {}, // { date1: [posts], date2: [posts] }
      promosForDate: {},
      activePromos: [],
      soonPromos: [],
    };
  }

  @bind(PostsActions.getPosts)
  getPosts(posts) {
    if (posts[Object.keys(posts)[0]]) {
      var newPosts = this.state.posts;
      newPosts[Object.keys(posts)[0]] = posts[Object.keys(posts)[0]];
      this.setState({posts: newPosts});
    } else { // if firestore loaded data from cache fetch it again
      PostsActions.getPosts(Object.keys(posts)[0], posts['city']);
    }
  }

  @bind(PostsActions.getTimedPostsForDate)
  setPostsForTag(posts) { // posts - { date: [posts] }
    var date = Object.keys(posts)[0];
    if (posts[date]) { // if not from cache
      var newTimedPostsForDate = this.state.timedPostsForDate;
      newTimedPostsForDate[date] = posts[date];
      var newEvents = [];
      var newPromos = [];
      for (var idx in posts[date]) {
        if (posts[date][idx]['type'] === 'event') {
          newEvents.push(posts[date][idx]);
        } else if (posts[date][idx]['type'] === 'promo') {
          newPromos.push(posts[date][idx]);
        }
      }
      var newEventsForDate = this.state.eventsForDate;
      newEventsForDate[date] = newEvents;
      var newPromosForDate = this.state.promosForDate;
      newPromosForDate[date] = newPromos;
      this.setState({timedPostsForDate: newTimedPostsForDate, eventsForDate: newEventsForDate, promosForDate: newPromosForDate});
    } else { // if from cache
      PostsActions.getTimedPostsForDate(date, posts['city']);
    }
  }

  @bind(PostsActions.getActivePromos)
  setActivePromos(posts) {
    if (posts.city) { // if from cache
      PostsActions.getActivePromos(posts.city);
    } else {
      this.setState({activePromos: posts});
    }
  }

  @bind(PostsActions.getSoonPromos)
  setSoonPromos(posts) {
    if (posts.city) { // if from cache
      PostsActions.getSoonPromos(posts.city);
    } else {
      this.setState({soonPromos: posts});
    }
  }

}

export default alt.createStore(PostsStore);
