import alt from '../utils/Alt';
import firebase from '@firebase/app';
import '@firebase/firestore';
import * as moment from 'moment';
import 'moment/locale/ru';

class PostsActions {

  getPosts() {
    return(dispatch) => {
      var date = moment().utcOffset('+0600').format('DD-MM-YYYY');
      var city = 'Almaty';
      var cityField = 'city.' + city;
      var db = firebase.firestore();
      var posts = {
        allPosts: [],
        productPosts: [],
        eventPosts: [],
        placePosts: [],
        promoPosts: [],
        contentPosts: []
      };
      db.collection('posts').where(cityField, "==", true).where('test', '==', true).orderBy('upvoteCount', 'desc').get().then((querySnapshot) => {
        if (querySnapshot.metadata.fromCache) { // fix for getting empty list of posts
          dispatch({[date]: null, city: city});
        } else {
          if (querySnapshot.size > 0) {
            querySnapshot.forEach((doc) => {
              var post = doc.data();
              var type = post.type + 'Posts';
              posts[type].push(post);
              posts.allPosts.push(post);
            });
            dispatch({[date]: posts});
          } else {
            dispatch({[date]: posts});
          }
        }
      });
    }
  }

  // getPosts(date, city) {
  //   return(dispatch) => {
  //     var db = firebase.firestore();
  //     var posts = {
  //       allPosts: [],
  //       productPosts: [],
  //       eventPosts: [],
  //       placePosts: [],
  //       promoPosts: [],
  //       contentPosts: []
  //     };
  //     var cityField = 'city.' + city
  //     db.collection('posts').where(cityField, "==", true).where('publicationDate', '==', date).orderBy('upvoteCount', 'desc').get().then((querySnapshot) => {
  //       if (querySnapshot.metadata.fromCache) { // fix for getting empty list of posts
  //         dispatch({[date]: null, city: city});
  //       } else {
  //         if (querySnapshot.size > 0) {
  //           querySnapshot.forEach((doc) => {
  //             var post = doc.data();
  //             var type = post.type + 'Posts';
  //             posts[type].push(post);
  //             posts.allPosts.push(post);
  //           });
  //           dispatch({[date]: posts});
  //         } else {
  //           dispatch({[date]: posts});
  //         }
  //       }
  //     });
  //   }
  // }

  getTimedPostsForDate(date, city) {
    return (dispatch) => {
      var db = firebase.firestore();
      var queryString = 'onDatesIn' + city + '.' + date;
      db.collection('posts').where(queryString, '>=', 0).orderBy(queryString, 'desc').get().then((snapshot) => {
        if (snapshot.metadata.fromCache) { // fix for getting empty list of posts
          dispatch({[date]: null, city: city});
        } else {
          var timedPostsForDate = [];
          snapshot.forEach(doc => {
            timedPostsForDate.push(doc.data());
          });
          dispatch({[date]: timedPostsForDate});
        }
      });
    }
  }

  getActivePromos(city) {
    return (dispatch) => {
      var db = firebase.firestore();
      var date = moment().utcOffset('+0600').format('DD-MM-YYYY');
      var queryString = 'onDatesIn' + city + '.' + date;
      db.collection('posts').where(queryString, '>=', 0).orderBy(queryString, 'desc').get().then((snapshot) => {
        if (snapshot.metadata.fromCache) { // fix for getting empty list of posts
          dispatch({city: city});
        } else {
          var promos = [];
          snapshot.forEach(doc => {
            var post = doc.data();
            if (post.type === 'promo') {
              promos.push(post);
            }
          });
          dispatch(promos);
        }
      });
    }
  }

  getSoonPromos(date, city) {
    return (dispatch) => {
      var db = firebase.firestore();
      var date = moment().add(1, 'days').utcOffset('+0600').format('DD-MM-YYYY');
      var queryString = 'onDatesIn' + city + '.' + date;
      db.collection('posts').where(queryString, '>=', 0).orderBy(queryString, 'desc').get().then((snapshot) => {
        if (snapshot.metadata.fromCache) { // fix for getting empty list of posts
          dispatch({city: city});
        } else {
          var promos = [];
          snapshot.forEach(doc => {
            var post = doc.data();
            if (post.type === 'promo') {
              promos.push(post);
            }
          });
          dispatch(promos);
        }
      });
    }
  }

}

export default alt.createActions(PostsActions);
