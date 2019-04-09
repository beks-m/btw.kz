import alt from '../utils/Alt';
import firebase from '@firebase/app';
import '@firebase/firestore';
import '@firebase/auth';
import '@firebase/storage';
import * as moment from 'moment';
import 'moment/locale/ru';
import { urlRusLat } from '../utils/translit';
import { getRandomItemsFromArray } from '../utils/contentFunctions'

class NewPostActions {

  clearNewPostProps() {
    return (dispatch) => {
      dispatch({
        postSubmitted: false,
        uploadProgress: 0,
      })
    }
  }

  sendPostToModeration(post) {
    // upload files
    return (dispatch) => {
      var db = firebase.firestore();
      var storageRef = firebase.storage().ref();
      post['timestamp'] = firebase.firestore.FieldValue.serverTimestamp();
      var media = [];
      var postID = urlRusLat(post.name); // beatiful ID and URL
      var postSubmissionStatus = {
        postSubmitted: false,
        uploadProgress: 0
      };
      var emptyMedia = [];
      if (post.media.length) {
        for (var i = 0; i < post.media.length; i++) {
          if (post.media[i].type === 'image') {

            emptyMedia.push({
              type: 'image',
              link: '',
              thumbnail: ''
            });

            // upload thumbnail
            var thumbRef = storageRef.child('postImages/' + post.publicationDate + '/' + postID + '-thumbnail-' + i);
            var metadata = {
              contentType: 'image',
            };
            thumbRef.put(post.media[i].thumbFile, metadata).then((snapshot) => {
              const path = snapshot.ref.name.split('-');
              var idx = path[path.length-1];
              emptyMedia[idx].thumbnail = snapshot.downloadURL;
              // check if all files are uploaded
              if (emptyMedia[idx].link) {
                media.push(emptyMedia[idx]);
                postSubmissionStatus['uploadProgress'] = (media.length / post.media.length) * 100;
                dispatch(postSubmissionStatus);
                if (media.length === post.media.length) {
                  // send to moderation
                  post['media'] = media;
                  db.collection('unmoderatedPosts').doc(postID).set(post).then(() => {
                    postSubmissionStatus['postSubmitted'] = true;
                    postSubmissionStatus['uploadProgress'] = 100;
                    dispatch(postSubmissionStatus);
                  });
                }
              }
            });

            // upload original
            var ref = storageRef.child('postImages/' + post.publicationDate + '/' + postID + '-' + i);
            ref.put(post.media[i].file, metadata).then((snapshot) => {
              // Handle successful uploads on complete
              const path = snapshot.ref.name.split('-');
              var idx = path[path.length-1];
              emptyMedia[idx].link = snapshot.downloadURL;
              // check if all files are uploaded
              if (emptyMedia[idx].thumbnail) {
                media.push(emptyMedia[idx]);
                postSubmissionStatus['uploadProgress'] = (media.length / post.media.length) * 100;
                dispatch(postSubmissionStatus);
                if (media.length === post.media.length) {
                  // send to moderation
                  post['media'] = media;
                  db.collection('unmoderatedPosts').doc(postID).set(post).then(() => {
                    postSubmissionStatus['postSubmitted'] = true;
                    postSubmissionStatus['uploadProgress'] = 100;
                    dispatch(postSubmissionStatus);
                  });
                }
              }
            });

          } else { // youtube
            var mediaToAdd = post.media[i];
            media.push(mediaToAdd);
            emptyMedia.push(mediaToAdd);
            if (media.length === post.media.length) {
              // send to moderation
              post['media'] = media;
              db.collection('unmoderatedPosts').doc(postID).set(post).then(() => {
                postSubmissionStatus['postSubmitted'] = true;
                postSubmissionStatus['uploadProgress'] = 100;
                dispatch(postSubmissionStatus);
              });
            }
          }
        }
      }
      else {
        db.collection('unmoderatedPosts').doc(postID).set(post).then(() => {
          postSubmissionStatus['postSubmitted'] = true;
          postSubmissionStatus['uploadProgress'] = 100;
          dispatch(postSubmissionStatus);
        });
      }
    }
  }

  // save post after images are uploaded after moderation
  saveModeratedPostToFirebase(post, oldPost) {
    return(dispatch) => {
      // save to posts direction, then add refs to tags, users, events, promos, comments
      var db = firebase.firestore();
      db.collection('posts').doc(post.id).set(post).then(() => {

        // add hunter/maker comment as comment
        if (post.comment !== '') {
          var ref = db.collection('posts').doc(post.id);
          var newFileId = db.collection('userActivity').doc();
          db.runTransaction(t => {
            return t.get(ref).then(doc => {
              const new_count = doc.data().commentCount + 1;
              t.update(ref, { commentCount: new_count });
              t.set(newFileId, {
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userID: post.hunterID,
                postID: post.id,
                content: post.comment,
                type: 'comment'
              });
            });
          });
          // update user's comment count
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

        // update Tags count
        for (var tag in post.tags) {
          db.collection('tags').doc(tag).get().then((snapshot) => {
            if (snapshot.exists) {
              var count = snapshot.data().postCount + 1;
              db.collection('tags').doc(snapshot.id).set({ postCount: count });
            } else {
              db.collection('tags').doc(snapshot.id).set({ postCount: 1 });
            }
          })
        }

        // update user's hunter posts
        db.collection('users').doc(post.hunterID).get().then((snapshot) => {
          var count = snapshot.data().hunterPostsCount + 1;
          if (!count) {
            count = 1;
          }
          db.collection('users').doc(snapshot.id).update({ hunterPostsCount: count });
        })

        // update makers posts
        for (var maker in post.makers) {
          db.collection('users').doc(maker).get().then((snapshot) => {
            var count = snapshot.data().makerPostsCount + 1;
            if (!count) {
              count = 1;
            }
            db.collection('users').doc(snapshot.id).update({ makerPostsCount: count });
          })
        }

        // update editor's edited posts
        for (var user in post.editors) {
          db.collection('users').doc(user).get().then((snapshot) => {
            var count = snapshot.data().editorPostsCount + 1;
            if (!count) {
              count = 1;
            }
            db.collection('users').doc(snapshot.id).update({ editorPostsCount: count });
          })
        }

        // Get a new write batch
        var batch = db.batch();

        // move from unmoderatedPosts to moderated posts
        batch.delete(db.collection('unmoderatedPosts').doc(oldPost.id));
        oldPost['moderatedBy'] = firebase.auth().currentUser.uid;
        oldPost['postRef'] = db.collection('posts').doc(post.id);
        oldPost['moderatedAt'] = firebase.firestore.FieldValue.serverTimestamp();
        batch.set(db.collection('moderatedPosts').doc(oldPost.id), oldPost);

        // add upvotes
        var users = ['83kYwJwX1HTlTFXhdYGkxm18Rtk2', 'FjhVkknrtlQO9KXJpnczsQInZEw1', 'HCxKfES35Qb07MOOELUgPA0KbIj1', 'PkZMIB10cAaYltZXQUJsvW9hKYs1', 'PpKB8jmgfmOfGaBtr8SN9X5i1ma2', 'Qcd6NX3F9JUEHHkbfChtxL1fDjT2', 'iBEhE0ZoCbgALQTYjReNyVggfPz2', 'kMroZQFmD7U9EQEwy19COLuYml42', 'vYizwWaraVO1qoazWUwsqMkleX43', 'zbUs2ZW3CMcSGKsObcFZFzD0frA2'];
        var likedUsers = getRandomItemsFromArray(users, post.upvoteCount);
        for (var uid in likedUsers) {
          batch.set(db.collection('userActivity').doc(users[uid] + post.id), {timestamp: firebase.firestore.FieldValue.serverTimestamp(), userID: users[uid], postID: post.id, type: 'upvote'});
        }

        // Commit the batch
        batch.commit().then(() => {
          // update status
          dispatch({
            postSubmitted: true,
            uploadProgress: 100
          });
        });
      });
    }
  }

  // after moderation
  saveModeratedPost(post, oldPost) {
    return (dispatch) => {
      var storageRef = firebase.storage().ref();
      post['timestamp'] = firebase.firestore.FieldValue.serverTimestamp();
      post['commentCount'] = 0;
      post['updatedAt'] = firebase.firestore.FieldValue.serverTimestamp();
      // for every date when event happens
      var onDates = {};
      var currentDate = moment(post.startDate).startOf('day');
      var stopDate = post['endDate'];
      while (currentDate <= stopDate) {
          onDates[moment(currentDate).utcOffset('+0600').format('DD-MM-YYYY')] = post.upvoteCount;
          currentDate = moment(currentDate).add(1, 'days');
      }
      Object.keys(post.city).map((item, idx) => {
        if (post.city[item] === true) {
          var onDatesInCity = 'onDatesIn' + item;
          return post[onDatesInCity] = onDates;
        }
        return null;
      })
      var postSubmissionStatus = {
        postSubmitted: false,
        uploadProgress: 0
      };
      // check if post has media
      if (!post.media.length) {
        this.saveModeratedPostToFirebase(post, oldPost);
      } else {
        // upload new media, then save post
        var media = [];
        var emptyMedia = [];
        for (var i = 0; i < post.media.length; i++) {
          if (post.media[i].thumbnail) { // check if image is newly added on moderation
            media.push(post.media[i]);
            emptyMedia.push(post.media[i]);
            if (media.length === post.media.length) {
              post['media'] = media;
              this.saveModeratedPostToFirebase(post, oldPost);
            }
          } else {
            emptyMedia.push({
              type: 'image',
              link: '',
              thumbnail: ''
            });

            // upload thumbnail
            var thumbRef = storageRef.child('postImages/' + post.publicationDate + '/' + post.id + '-thumbnail-' + i);
            var metadata = {
              contentType: 'image',
            };
            thumbRef.put(post.media[i].thumbFile, metadata).then((snapshot) => {
              const path = snapshot.ref.name.split('-');
              var idx = path[path.length-1];
              emptyMedia[idx].thumbnail = snapshot.downloadURL;
              // check if all files are uploaded
              if (emptyMedia[idx].link) {
                media.push(emptyMedia[idx]);
                postSubmissionStatus['uploadProgress'] = (media.length / post.media.length) * 100;
                dispatch(postSubmissionStatus);
                if (media.length === post.media.length) {
                  // send to moderation
                  post['media'] = media;
                  this.saveModeratedPostToFirebase(post, oldPost);
                }
              }
            });

            // upload original
            var ref = storageRef.child('postImages/' + post.publicationDate + '/' + post.id + '-' + i);
            ref.put(post.media[i].file, metadata).then((snapshot) => {
              // Handle successful uploads on complete
              const path = snapshot.ref.name.split('-');
              var idx = path[path.length-1];
              emptyMedia[idx].link = snapshot.downloadURL;
              // check if all files are uploaded
              if (emptyMedia[idx].thumbnail) {
                media.push(emptyMedia[idx]);
                postSubmissionStatus['uploadProgress'] = (media.length / post.media.length) * 100;
                dispatch(postSubmissionStatus);
                if (media.length === post.media.length) {
                  // send to moderation
                  post['media'] = media;
                  this.saveModeratedPostToFirebase(post, oldPost);
                }
              }
            });
          }
        }
      }
    }
  }

  deleteUnmoderatedPost(post) {
    return (dispatch) => {
      var db = firebase.firestore();
      var batch = db.batch();

      // move from unmoderatedPosts to moderated posts
      batch.delete(db.collection('unmoderatedPosts').doc(post.id));
      post['moderatedBy'] = firebase.auth().currentUser.uid;
      post['moderatedAt'] = firebase.firestore.FieldValue.serverTimestamp();
      batch.set(db.collection('moderatedPosts').doc(post.id), post);

      batch.commit().then(() => {
        // update status
        dispatch({
          postSubmitted: true,
          uploadProgress: 100
        });
      });
    }
  }

  saveEditedPost(post, oldPost) {
    return (dispatch) => {
      var storageRef = firebase.storage().ref();
      post['updatedAt'] = firebase.firestore.FieldValue.serverTimestamp();
      // for every date when event happens
      var onDates = {};
      var currentDate = moment(post.startDate).startOf('day');
      var stopDate = post['endDate'];
      while (currentDate <= stopDate) {
          onDates[moment(currentDate).utcOffset('+0600').format('DD-MM-YYYY')] = post.upvoteCount;
          currentDate = moment(currentDate).add(1, 'days');
      }
      Object.keys(post.city).map((item, idx) => {
        if (post.city[item] === true) {
          var onDatesInCity = 'onDatesIn' + item;
          return post[onDatesInCity] = onDates;
        }
        return null;
      })
      var postSubmissionStatus = {
        postSubmitted: false,
        uploadProgress: 0
      };
      // check if post has media
      if (!post.media.length) {
        this.saveEditedPostToFirebase(post, oldPost);
      } else {
        // upload new media, then save post
        var media = [];
        var emptyMedia = [];
        for (var i = 0; i < post.media.length; i++) {
          if (post.media[i].thumbnail) { // check if image is newly added on moderation
            media.push(post.media[i]);
            emptyMedia.push(post.media[i]);
            if (media.length === post.media.length) {
              post['media'] = media;
              this.saveEditedPostToFirebase(post, oldPost);
            }
          } else {
            emptyMedia.push({
              type: 'image',
              link: '',
              thumbnail: ''
            });

            // upload thumbnail
            var thumbRef = storageRef.child('postImages/' + post.publicationDate + '/' + post.id + '-thumbnail-' + i);
            var metadata = {
              contentType: 'image',
            };
            thumbRef.put(post.media[i].thumbFile, metadata).then((snapshot) => {
              const path = snapshot.ref.name.split('-');
              var idx = path[path.length-1];
              emptyMedia[idx].thumbnail = snapshot.downloadURL;
              // check if all files are uploaded
              if (emptyMedia[idx].link) {
                media.push(emptyMedia[idx]);
                postSubmissionStatus['uploadProgress'] = (media.length / post.media.length) * 100;
                dispatch(postSubmissionStatus);
                if (media.length === post.media.length) {
                  // send to moderation
                  post['media'] = media;
                  this.saveEditedPostToFirebase(post, oldPost);
                }
              }
            });

            // upload original
            var ref = storageRef.child('postImages/' + post.publicationDate + '/' + post.id + '-' + i);
            ref.put(post.media[i].file, metadata).then((snapshot) => {
              // Handle successful uploads on complete
              const path = snapshot.ref.name.split('-');
              var idx = path[path.length-1];
              emptyMedia[idx].link = snapshot.downloadURL;
              // check if all files are uploaded
              if (emptyMedia[idx].thumbnail) {
                media.push(emptyMedia[idx]);
                postSubmissionStatus['uploadProgress'] = (media.length / post.media.length) * 100;
                dispatch(postSubmissionStatus);
                if (media.length === post.media.length) {
                  // send to moderation
                  post['media'] = media;
                  this.saveEditedPostToFirebase(post, oldPost);
                }
              }
            });
          }
        }
      }
    }
  }

  saveEditedPostToFirebase(post, oldPost) {
    return (dispatch) => {
      // save to posts direction, then add refs to tags, users, events, promos, comments
      var db = firebase.firestore();
      db.collection('posts').doc(post.id).update(post).then(() => {

        // decrease old tags count
        for (var tag in oldPost.tags) {
          db.collection('tags').doc(tag).get().then((snapshot) => {
            if (snapshot.exists) {
              var count = snapshot.data().postCount - 1;
              db.collection('tags').doc(snapshot.id).set({ postCount: count });
            }
          })
        }

        // increase new tags count
        for (var tag in post.tags) {
          db.collection('tags').doc(tag).get().then((snapshot) => {
            if (snapshot.exists) {
              var count = snapshot.data().postCount + 1;
              db.collection('tags').doc(snapshot.id).set({ postCount: count });
            } else {
              db.collection('tags').doc(snapshot.id).set({ postCount: 1 });
            }
          })
        }

        // update user's hunter posts
        if (oldPost.hunterID !== post.hunterID) {
          // decrease old hunter's post count
          db.collection('users').doc(oldPost.hunterID).get().then((snapshot) => {
            var count = snapshot.data().hunterPostsCount - 1;
            db.collection('users').doc(snapshot.id).update({ hunterPostsCount: count });
          })

          // increase new hunter's post count
          db.collection('users').doc(post.hunterID).get().then((snapshot) => {
            var count = snapshot.data().hunterPostsCount + 1;
            if (!count) {
              count = 1;
            }
            db.collection('users').doc(snapshot.id).update({ hunterPostsCount: count });
          })
        }

        // update makers posts
        // decrease old maker's post count
        for (var maker in oldPost.makers) {
          db.collection('users').doc(maker).get().then((snapshot) => {
            var count = snapshot.data().makerPostsCount - 1;
            db.collection('users').doc(snapshot.id).update({ makerPostsCount: count });
          })
        }
        // increase new maker's post count
        for (var maker in post.makers) {
          db.collection('users').doc(maker).get().then((snapshot) => {
            var count = snapshot.data().makerPostsCount + 1;
            if (!count) {
              count = 1;
            }
            db.collection('users').doc(snapshot.id).update({ makerPostsCount: count });
          })
        }

        // decrease old editor's edited posts
        for (var user in oldPost.editors) {
          db.collection('users').doc(user).get().then((snapshot) => {
            var count = snapshot.data().editorPostsCount - 1;
            db.collection('users').doc(snapshot.id).update({ editorPostsCount: count });
          })
        }
        // increase editor's edited posts
        for (var user in post.editors) {
          db.collection('users').doc(user).get().then((snapshot) => {
            var count = snapshot.data().editorPostsCount + 1;
            if (!count) {
              count = 1;
            }
            db.collection('users').doc(snapshot.id).update({ editorPostsCount: count });
          })
        }

        dispatch({
          postSubmitted: true,
          uploadProgress: 100
        });

      });
    }
  }

  deletePost(post) {
    return (dispatch) => {
      var db = firebase.firestore();
      var batch = db.batch();

      // move from posts to deleted posts
      batch.delete(db.collection('posts').doc(post.id));
      post['deletedBy'] = firebase.auth().currentUser.uid;
      batch.set(db.collection('deletedPosts').doc(post.id), post);

      batch.commit().then(() => {
        // update status
        dispatch({
          postSubmitted: true,
          uploadProgress: 100
        });
      });
    }
  }


}

export default alt.createActions(NewPostActions);
