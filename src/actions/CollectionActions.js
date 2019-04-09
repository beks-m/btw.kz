import alt from '../utils/Alt';
import firebase from '@firebase/app';
import '@firebase/firestore';

class CollectionActions {

  getPostsForTag(tag, lastSnapshot) {
    return (dispatch) => {
      var db = firebase.firestore();
      var queryString = 'tags.' + tag;
      if (!lastSnapshot) {
        db.collection('posts').where(queryString, '>=', 0).orderBy(queryString, 'desc').limit(4).get().then((snapshot) => {
          if (snapshot.metadata.fromCache) { // fix for getting empty list of posts
            dispatch({[tag]: null});
          } else {
            var postsForTag = [];
            snapshot.forEach(doc => {
              var post = doc.data();
              post['snapshot'] = doc;
              postsForTag.push(post);
            });
            dispatch({[tag]: postsForTag});
          }
        });
      } else {
        db.collection('posts').where(queryString, '>=', 0).orderBy(queryString, 'desc').startAfter(lastSnapshot).limit(4).get().then((snapshot) => {
          if (snapshot.metadata.fromCache) { // fix for getting empty list of posts
            dispatch({[tag]: null});
          } else {
            var postsForTag = [];
            snapshot.forEach(doc => {
              var post = doc.data();
              post['snapshot'] = doc;
              postsForTag.push(post);
            });
            dispatch({[tag]: postsForTag});
          }
        });
      }
    }
  }

  getTagInfo(tag) {
    return (dispatch) => {
      var db = firebase.firestore();
      db.collection('tags').doc(tag).get().then((snapshot) => {
        snapshot.exists && dispatch({[tag]: snapshot.data()});
      });
    }
  }

}

export default alt.createActions(CollectionActions);
