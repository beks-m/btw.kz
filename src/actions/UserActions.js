import alt from '../utils/Alt';
import firebase from '@firebase/app';
import '@firebase/firestore';

class UserActions {

  getUsers(userIDs) {
    return (dispatch) => { // {userID: {photoURL, name, link}}
      var db = firebase.firestore();
      userIDs.forEach((uid) => {
        db.collection('users').doc(uid).get().then((querySnapshot) => {
          var user = querySnapshot.data();
          dispatch({[uid]: user});
        });
      });
    }
  }

  getActivityForUser(uid, lastSnapshot) {
    return (dispatch) => {
      var db = firebase.firestore();
      if (!lastSnapshot) {
        db.collection('userActivity').where('userID', '==', uid).orderBy('timestamp', 'desc').limit(4).get().then((snapshot) => {
          if (snapshot.metadata.fromCache) { // fix for getting empty list of posts
            dispatch({[uid]: null});
          } else {
            var activity = [];
            snapshot.forEach(item => {
              var ac = item.data();
              ac['id'] = item.id;
              ac['snapshot'] = item;
              activity.push(ac);
            });
            dispatch({[uid]: activity});
          }
        });
      } else {
        db.collection('userActivity').where('userID', '==', uid).orderBy('timestamp', 'desc').limit(4).startAfter(lastSnapshot).get().then((snapshot) => {
          if (snapshot.metadata.fromCache) { // fix for getting empty list of posts
            dispatch({[uid]: null});
          } else {
            var activity = [];
            snapshot.forEach(item => {
              var ac = item.data();
              ac['id'] = item.id;
              ac['snapshot'] = item;
              activity.push(ac);
            });
            dispatch({[uid]: activity});
          }
        });
      }
    }
  }

  getHunterPostsForUser(uid, lastSnapshot) {
    return (dispatch) => {
      var db = firebase.firestore();
      if (!lastSnapshot) {
        db.collection('posts').where('hunterID', '==', uid).orderBy('timestamp', 'desc').limit(4).get().then((snapshot) => {
          if (snapshot.metadata.fromCache) { // fix for getting empty list of posts
            dispatch({[uid]: null});
          } else {
            var posts = [];
            snapshot.forEach(doc => {
              var post = doc.data();
              post['snapshot'] = doc;
              posts.push(post);
            });
            dispatch({[uid]: posts});
          }
        });
      } else {
        db.collection('posts').where('hunterID', '==', uid).orderBy('timestamp', 'desc').startAfter(lastSnapshot).limit(4).get().then((snapshot) => {
          if (snapshot.metadata.fromCache) { // fix for getting empty list of posts
            dispatch({[uid]: null});
          } else {
            var posts = [];
            snapshot.forEach(doc => {
              var post = doc.data();
              post['snapshot'] = doc;
              posts.push(post);
            });
            dispatch({[uid]: posts});
          }
        });
      }
    }
  }

  getMakerPostsForUser(uid, lastSnapshot) {
    return (dispatch) => {
      var db = firebase.firestore();
      var queryString = 'makers.' + uid;
      if (!lastSnapshot) {
        db.collection('posts').where(queryString, '>=', new Date('2017-01-01')).orderBy(queryString, 'desc').limit(4).get().then((snapshot) => {
          if (snapshot.metadata.fromCache) { // fix for getting empty list of posts
            dispatch({[uid]: null});
          } else {
            var posts = [];
            snapshot.forEach(doc => {
              var post = doc.data();
              post['snapshot'] = doc;
              posts.push(post);
            });
            dispatch({[uid]: posts});
          }
        });
      } else {
        db.collection('posts').where(queryString, '>=', new Date('2017-01-01')).orderBy(queryString, 'desc').startAfter(lastSnapshot).limit(4).get().then((snapshot) => {
          if (snapshot.metadata.fromCache) { // fix for getting empty list of posts
            dispatch({[uid]: null});
          } else {
            var posts = [];
            snapshot.forEach(doc => {
              var post = doc.data();
              post['snapshot'] = doc;
              posts.push(post);
            });
            dispatch({[uid]: posts});
          }
        });
      }
    }
  }

  getEditorPostsForUser(uid, lastSnapshot) {
    return (dispatch) => {
      var db = firebase.firestore();
      var queryString = 'editors.' + uid;
      if (!lastSnapshot) {
        db.collection('posts').where(queryString, '>=', new Date('2017-01-01')).orderBy(queryString, 'desc').limit(4).get().then((snapshot) => {
          if (snapshot.metadata.fromCache) { // fix for getting empty list of posts
            dispatch({[uid]: null});
          } else {
            var posts = [];
            snapshot.forEach(doc => {
              var post = doc.data();
              post['snapshot'] = doc;
              posts.push(post);
            });
            dispatch({[uid]: posts});
          }
        });
      } else {
        db.collection('posts').where(queryString, '>=', new Date('2017-01-01')).orderBy(queryString, 'desc').startAfter(lastSnapshot).limit(4).get().then((snapshot) => {
          if (snapshot.metadata.fromCache) { // fix for getting empty list of posts
            dispatch({[uid]: null});
          } else {
            var posts = [];
            snapshot.forEach(doc => {
              var post = doc.data();
              post['snapshot'] = doc;
              posts.push(post);
            });
            dispatch({[uid]: posts});
          }
        });
      }
    }
  }

}

export default alt.createActions(UserActions);
