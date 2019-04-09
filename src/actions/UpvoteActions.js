import alt from '../utils/Alt';
import firebase from '@firebase/app';
import '@firebase/firestore';

class UpvoteActions {

  getUpvotes(posts) {
    return (dispatch) => {
      var db = firebase.firestore();
      var upvotes = {}; // {postID: [users]}
      posts.forEach((post) => {
        db.collection('userActivity').where('type', "==", 'upvote').where('postID',  '==', post.id).onSnapshot((querySnapshot) => {
          var upvotesForSinglePost = [];
          querySnapshot.forEach((upvote) => {
            upvotesForSinglePost.push(upvote.data());
          })
          upvotes[post.id] = upvotesForSinglePost;
          dispatch(upvotes);
        });
      });
    }
  }

  addUpvote(post) {
    return (dispatch) => {
      var db = firebase.firestore();
      // create upvote document if user is logged in
      if (firebase.auth().currentUser) {
        // Save to Firestore
        db.runTransaction(t => {
          return t.get(db.collection('posts').doc(post.id)).then(doc => {
            var fieldsToUpdate = {};
            const new_count = doc.data().upvoteCount + 1;
            fieldsToUpdate['upvoteCount'] = new_count;
            var tags = doc.data().tags;
            for (var tag in tags) {
              tags[tag] = new_count
            }
            fieldsToUpdate['tags'] = tags;
            if (post.type === 'event' || post.type === 'promo') {
              for (var city in post.city) {
                if (post.city[city]) {
                  var dates = post['onDatesIn' + city]
                  for (var date in dates) {
                    dates[date] = new_count;
                  }
                  fieldsToUpdate['onDatesIn' + city] = dates
                }
              }
            }
            t.update(db.collection('posts').doc(post.id), fieldsToUpdate);
            t.set(db.collection('userActivity').doc(firebase.auth().currentUser.uid + post.id), {
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              userID: firebase.auth().currentUser.uid,
              postID: post.id,
              type: 'upvote'
            });
          });
        });
        db.runTransaction(t => {
          return t.get(db.collection('users').doc(firebase.auth().currentUser.uid)).then(doc => {
            var new_count = doc.data().upvoteCount + 1;
            if (!new_count) {
              new_count = 1;
            }
            t.update(db.collection('users').doc(firebase.auth().currentUser.uid), { upvoteCount: new_count });
          });
        });
      }
    }
  }

  removeUpvote(post) {
    return (dispatch) => {
      var db = firebase.firestore();
      // delete document
      if (firebase.auth().currentUser) {
        db.runTransaction(t => {
          return t.get(db.collection('posts').doc(post.id)).then(doc => {

            var fieldsToUpdate = {};
            const new_count = doc.data().upvoteCount - 1;
            fieldsToUpdate['upvoteCount'] = new_count;
            var tags = doc.data().tags;
            for (var tag in tags) {
              tags[tag] = new_count
            }
            fieldsToUpdate['tags'] = tags;
            if (post.type === 'event' || post.type === 'promo') {
              for (var city in post.city) {
                if (post.city[city]) {
                  var dates = post['onDatesIn' + city]
                  for (var date in dates) {
                    dates[date] = new_count;
                  }
                  fieldsToUpdate['onDatesIn' + city] = dates
                }
              }
            }
            t.update(db.collection('posts').doc(post.id), fieldsToUpdate);
            t.delete(db.collection('userActivity').doc(firebase.auth().currentUser.uid + post.id));
          });
        });
        db.runTransaction(t => {
          return t.get(db.collection('users').doc(firebase.auth().currentUser.uid)).then(doc => {
            var new_count = doc.data().upvoteCount - 1;
            if (!new_count) {
              new_count = 0;
            }
            t.update(db.collection('users').doc(firebase.auth().currentUser.uid), { upvoteCount: new_count });
          });
        });
      }
    }
  }


}

export default alt.createActions(UpvoteActions);
