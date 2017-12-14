import alt from '../alt/Alt';
import * as firebase from 'firebase';
import 'firebase/firestore';

const num_shards = 2;

class Actions {

  initSession() {
    return (dispatch) => {
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          dispatch(user);
        }
      });
    }
  }

  login() {
    return (dispatch) => {
      var provider = new firebase.auth.FacebookAuthProvider();
      firebase.auth().languageCode = 'ru_RU';
      firebase.auth().signInWithPopup(provider).then(function(result) {
        // The signed-in user info.
        var user = result.user;
        // broadcast to the App
        dispatch(user);
      });
    }
  }

  logout() {
    return (dispatch) => {
      firebase.auth().signOut().then(function() {
        // Sign-out successful.
        dispatch(null);
      }).catch(function(error) {
        // An error happened.
        console.log('Sign out error', error);
      });
    }
  }

  getPosts() {
    return(dispatch) => {
      var db = firebase.firestore();
      db.collection('posts').limit(10).onSnapshot(function(querySnapshot) {
        var posts = [];
        querySnapshot.forEach(function(doc) {
          var post = doc.data();
          post['id'] = doc.id;
          post['isUpvoted'] = false;
          posts.push(post);
          dispatch(posts);

          // check if current user upvoted post
          if (firebase.auth().currentUser) {
            // listen for user upvoted or not the post
            db.collection('posts').doc(doc.id).collection('upvotes').where('user', '==', firebase.auth().currentUser.uid).onSnapshot(function(snapshot3) {
              var index = posts.findIndex(function(item){return (item.id===doc.id);})
              if (snapshot3.size > 0) {
                posts[index]['isUpvoted'] = true;
              } else {
                posts[index]['isUpvoted'] = false;
              }
              dispatch(posts);
            });
          }

          // listen for changes in upvote counts
          db.collection('posts').doc(doc.id).collection('upvoteCounts').onSnapshot(function(snapshot1) {
            let upvote_count = 0;
            snapshot1.forEach(doc1 => {
                upvote_count += doc1.data().count;
            });
            var index = posts.findIndex(function(item){return (item.id===doc.id);})
            posts[index]['upvoteCount'] = upvote_count;
            dispatch(posts);
          });

          // listen for changes in comment counts
          db.collection('posts').doc(doc.id).collection('commentCounts').onSnapshot(function(snapshot2) {
            let comment_count = 0;
            snapshot2.forEach(doc2 => {
                comment_count += doc2.data().count;
            });
            var index = posts.findIndex(function(item){return (item.id===doc.id);})
            posts[index]['commentCount'] = comment_count;
            dispatch(posts);
          });

        });
      });
      // var next = db.collection('cities')
      //     .orderBy('population')
      //     .startAfter(lastVisible)
      //     .limit(25);
    }
  }

  getSinglePost(postID) {
    return(dispatch) => {
      var db = firebase.firestore();
      db.collection('posts').doc(postID).get().then(function(doc) {
        if (doc.exists) {
          var post = doc.data();
          post['id'] = doc.id;
          post['isUpvoted'] = false;
          dispatch(post);

          // listen if current user upvoted post
          if (firebase.auth().currentUser) {
            db.collection('posts').doc(doc.id).collection('upvotes').where('user', '==', firebase.auth().currentUser.uid).onSnapshot(function(snapshot) {
              post['isUpvoted'] = false;
              if (snapshot.size > 0) {
                post['isUpvoted'] = true;
              }
              dispatch(post);
            });
          }

          // listen for upvote counts
          db.collection('posts').doc(postID).collection('upvoteCounts').onSnapshot(function(snapshot1) {
            let upvote_count = 0;
            snapshot1.forEach(doc => {
                upvote_count += doc.data().count;
            });
            post['upvoteCount'] = upvote_count;
            dispatch(post);
          });

        } else {
          post = {
            id: 0
          }
          dispatch(post);
        }
      });
    }
  }

  unsubscribeForPost(postID) {
    return(dispatch) => {
      var db = firebase.firestore();
      db.collection('posts').doc(postID).onSnapshot(function () {});
      db.collection('posts').doc(postID).collection('upvoteCounts').onSnapshot(function () {});
      db.collection('posts').doc(postID).collection('upvotes').onSnapshot(function () {});
    }
  }

  getCommentsForPost(postID) {
    return(dispatch) => {
      var db = firebase.firestore();
      db.collection('posts').doc(postID).collection('comments').orderBy('timestamp', 'desc').onSnapshot(function(querySnapshot) {
        var commentsArray = [];

        querySnapshot.forEach(function(doc) {
          var comment = doc.data();
          comment['id'] = doc.id;
          db.collection('users').doc(comment.user).get().then(function(doc) {
            if (doc.exists) {
              comment.user = doc.data();
            }
            commentsArray.push(comment);
            var comments = {
              [postID]: commentsArray
            };
            dispatch(comments);
          });
        });
      });

      // var next = db.collection('cities')
      //     .orderBy('population')
      //     .startAfter(lastVisible)
      //     .limit(25);
    }
  }

  addCommentForPost(commentValue, postID) {
    return(dispatch) => {
      var db = firebase.firestore();
      db.collection('posts').doc(postID).collection('comments').add({
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        user: firebase.auth().currentUser.uid,
        content: commentValue
      });

      // increment commentCount
      const shard_id = Math.floor(Math.random() * num_shards).toString();
      const shard_ref = db.collection('posts').doc(postID).collection('commentCounts').doc(shard_id);

      // Update count in a transaction
      firebase.firestore().runTransaction(t => {
        return t.get(shard_ref).then(doc => {
          const new_count = doc.data().count + 1;
          t.update(shard_ref, { count: new_count });
        });
      });
    }
  }

  addNewPost(post) {
    return (dispatch) => {
      var db = firebase.firestore();

      // create document
      db.collection('posts').add(post).then(function(docRef) {
        console.log('Document written with ID: ', docRef.id);

        var batch = db.batch();

        // Initialize the counter for upvotes and comments
        batch.set(docRef, { num_shards: num_shards });

        // Initialize each shard with count=0 for upvoteCounts
        for (let i = 0; i < num_shards; i++) {
          let shardRef = docRef.collection('upvoteCounts').doc(i.toString());
          batch.set(shardRef, { count: 0 });
        }

        // Initialize each shard with count=0 for commentCounts
        for (let i = 0; i < num_shards; i++) {
          let shardRef = docRef.collection('commentCounts').doc(i.toString());
          batch.set(shardRef, { count: 0 });
        }

        // Commit the write batch
        batch.commit();

      });
    }
  }

  addUpvote(postID) {

    return (dispatch) => {

      // create upvote document
      var db = firebase.firestore();
      db.collection('posts').doc(postID).collection('upvotes').doc(firebase.auth().currentUser.uid).set({
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        user: firebase.auth().currentUser.uid
      });

      // TODO: check if document created above before updating counts

      // increment upvoteCount
      const shard_id = Math.floor(Math.random() * num_shards).toString();
      const shard_ref = db.collection('posts').doc(postID).collection('upvoteCounts').doc(shard_id);

      // Update count in a transaction
      firebase.firestore().runTransaction(t => {
        return t.get(shard_ref).then(doc => {
          const new_count = doc.data().count + 1;
          t.update(shard_ref, { count: new_count });
        });
      });

    }
  }

  removeUpvote(postID) {
    return (dispatch) => {

      // delete document
      var db = firebase.firestore();
      db.collection('posts').doc(postID).collection('upvotes').doc(firebase.auth().currentUser.uid).delete();

      // decrement upvoteCount
      const shard_id = Math.floor(Math.random() * num_shards).toString();
      const shard_ref = db.collection('posts').doc(postID).collection('upvoteCounts').doc(shard_id);

      // Update count in a transaction
      firebase.firestore().runTransaction(t => {
        return t.get(shard_ref).then(doc => {
          const new_count = doc.data().count - 1;
          t.update(shard_ref, { count: new_count });
        });
      });
    }
  }


}

export default alt.createActions(Actions);
