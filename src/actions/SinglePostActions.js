import alt from '../utils/Alt';
import firebase from '@firebase/app';
import '@firebase/firestore';

class SinglePostActions {

  getPost(id) {
    return(dispatch) => {
      var db = firebase.firestore();
      db.collection('posts').doc(id).onSnapshot((doc) => {
        if (!doc.metadata.fromCache) {
          if (doc.exists) {
            dispatch(doc.data());
          } else {
            dispatch({id: 0});
          }
        } else {
          dispatch({id: id, fromCache: true});
        }
      });
    }
  }

  unsubscribeForPost(id) {
    return(dispatch) => {
      var db = firebase.firestore();
      db.collection('posts').doc(id).onSnapshot(() => {});
      dispatch(null);
    }
  }

  getCommentsForPost(id) {
    return(dispatch) => { // {{postID: [comments]}, {postID: [comments]}}
      var db = firebase.firestore();
      db.collection('userActivity').where('type', '==', 'comment').where('postID', '==', id).orderBy('timestamp', 'desc').onSnapshot((querySnapshot) => {
        var commentsArray = [];
        querySnapshot.forEach((doc) => {
          var comment = doc.data();
          comment['id'] = doc.id;
          db.collection('users').doc(comment.userID).get().then((doc) => {
            if (doc.exists) {
              comment.user = doc.data();
            }
            commentsArray.push(comment);
            var comments = {
              [id]: commentsArray
            };
            dispatch(comments);
          });
        });
      });
    }
  }

  addCommentForPost(id, commentValue) {
    return(dispatch) => {
      // create comment document if user is logged in
      var db = firebase.firestore();
      if (firebase.auth().currentUser) {
        // Save to Firestore
        var ref = db.collection('posts').doc(id);
        var newFileId = db.collection('userActivity').doc();
        db.runTransaction(t => {
          return t.get(ref).then(doc => {
            const new_count = doc.data().commentCount + 1;
            t.update(ref, { commentCount: new_count });
            t.set(newFileId, {
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              userID: firebase.auth().currentUser.uid,
              postID: id,
              content: commentValue,
              type: 'comment',
              moderated: false,
              approved: false
            });
          });
        });
        db.runTransaction(t => {
          return t.get(db.collection('users').doc(firebase.auth().currentUser.uid)).then(doc => {
            var new_count = doc.data().commentCount + 1;
            if (!new_count) {
              new_count = 1;
            }
            t.update(db.collection('users').doc(firebase.auth().currentUser.uid), { commentCount: new_count });
          });
        });
      }
    }
  }

}

export default alt.createActions(SinglePostActions);
