import alt from '../alt/Alt';
import firebase from '@firebase/app';
import '@firebase/firestore';
import '@firebase/auth';
import '@firebase/storage';
import * as moment from 'moment';
import 'moment/locale/ru';
import ReactGA from 'react-ga';
import { urlRusLat } from '../components/utils/translit';
import { getRandomItemsFromArray } from '../components/utils/contentFunctions';

class Actions {

  initSession() {
    return (dispatch) => {
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          ReactGA.set({ userId: user.uid });
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
        firebase.firestore().collection('users').doc(user.uid).get().then(function(snapshot) {
          if (snapshot.exists) {
            // user is registered before and is logging in
            ReactGA.event({
              category: 'Login',
              action: 'Login success',
              label: 'Facebook'
            });
            firebase.firestore().collection('users').doc(user.uid).update({
              name: user.providerData[0].displayName,
              photoURL: user.providerData[0].photoURL,
              email: user.providerData[0].email,
              facebookUID: user.providerData[0].uid,
              lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
          }
          else {
            // user is newly registered
            ReactGA.event({
              category: 'Login',
              action: 'Registration success',
              label: 'Facebook'
            });
            firebase.firestore().collection('users').doc(user.uid).set({
              name: user.providerData[0].displayName,
              photoURL: user.providerData[0].photoURL,
              email: user.providerData[0].email,
              facebookUID: user.providerData[0].uid,
              registeredOn: firebase.firestore.FieldValue.serverTimestamp(),
              lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
          }
        });
        ReactGA.set({ userId: user.uid });
        // broadcast to the App
        dispatch(user);
      }, function(error) {
        if (error.code === 'auth/popup-closed-by-user') {
          ReactGA.event({
            category: 'Login',
            action: 'User refused Facebook access',
            label: 'Facebook'
          });
        }
      });
    }
  }

  logout() {
    return (dispatch) => {
      firebase.auth().signOut().then(function() {
        // Sign-out successful.
        ReactGA.event({
          category: 'Login',
          action: 'Logout success',
        });
        ReactGA.set({ userId: null });
        dispatch(null);
      }).catch(function(error) {
        // An error happened.
        console.log('Sign out error', error);
      });
    }
  }

  changeCity(city) {
    return (dispatch) => {
      localStorage.setItem('city', city);
      ReactGA.set({ dimension1: city });
      dispatch(city);
    }
  }

  getPosts(dateDocID, city) {
    return(dispatch) => {
      var db = firebase.firestore();
      var posts = {
        allPosts: [],
        productPosts: [],
        eventPosts: [],
        placePosts: [],
        promoPosts: []
      };
      db.collection('posts').doc(dateDocID).collection('posts').where(city, "==", true).orderBy('upvoteCount', 'desc').get().then(function(querySnapshot) {
        if (querySnapshot.metadata.fromCache) { // fix for getting empty list of posts
          dispatch({[dateDocID]: null});
        } else {
          if (querySnapshot.size > 0) {
            querySnapshot.forEach(function(doc) {
              var post = doc.data();
              post['id'] = doc.id;
              post['doc'] = doc;
              var type = post.type + 'Posts';
              posts[type].push(post);
              posts.allPosts.push(post);
            });
            dispatch({[dateDocID]: posts});
          } else {
            dispatch({[dateDocID]: posts});
          }
        }
      });
    }
  }

  getEvents(date, city) {
    return(dispatch) => {
      firebase.firestore().collection('events').doc(date).collection('posts').get().then(function(querySnapshot) {
        if (querySnapshot.metadata.fromCache) { // fix for getting empty list of posts
          dispatch({[date]: null});
        } else {
          var events = [];
          if (querySnapshot.size > 0) {
            querySnapshot.forEach(function(doc) {
              var postRef = doc.data().postRef;
              postRef.get().then(function(querySnapshot2) {
                var post = querySnapshot2.data();
                if (post[city]) {
                  events.push(querySnapshot2.data());
                  dispatch({[date]: events})
                }
              });
            });
          } else {
            dispatch({[date]: events});
          }
        }
      });
    }
  }

  getUpvotes(posts) {
    return (dispatch) => {
      var upvotes = {}; // {postID: [users]}
      posts.forEach(function(post) {
        firebase.firestore().collection('posts').doc(post.publicationDate).collection('posts').doc(post.id).collection('upvotes').onSnapshot(function(querySnapshot) {
          var upvotesForSinglePost = [];
          querySnapshot.forEach(function(upvote) {
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
      // create upvote document if user is logged in
      if (firebase.auth().currentUser) {
        // Save to Firestore
        firebase.firestore().runTransaction(t => {
          return t.get(post.doc.ref).then(doc => {
            const new_count = doc.data().upvoteCount + 1;
            t.update(post.doc.ref, { upvoteCount: new_count });
            t.set(post.doc.ref.collection('upvotes').doc(firebase.auth().currentUser.uid), {
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              user: firebase.auth().currentUser.uid
            });
            t.set(firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('upvotes').doc(post.doc.id), {
              postID: post.doc.id,
              postRef: post.doc.ref,
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
          });
        });
        dispatch({postID: post.id, isUpvoted: true});
      }
    }
  }

  removeUpvote(post) {
    return (dispatch) => {
      // delete document
      if (firebase.auth().currentUser) {
        firebase.firestore().runTransaction(t => {
          return t.get(post.doc.ref).then(doc => {
            const new_count = doc.data().upvoteCount - 1;
            t.update(post.doc.ref, { upvoteCount: new_count });
            t.delete(post.doc.ref.collection('upvotes').doc(firebase.auth().currentUser.uid));
            t.delete(firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('upvotes').doc(post.doc.id));
          });
        });
        dispatch({postID: post.id, isUpvoted: false})
      }
    }
  }

  getSinglePost(date, id) {
    return(dispatch) => {
      var db = firebase.firestore();
      db.collection('posts').doc(date).collection('posts').doc(id).onSnapshot(function(doc) {
        if (!doc.metadata.fromCache) {
          if (doc.exists) {
            var post = doc.data();
            post['id'] = doc.id;
            post['doc'] = doc;
            dispatch(post);
          } else {
            dispatch({id: 0});
          }
        }
      });
    }
  }

  unsubscribeForPost(date, id) {
    return(dispatch) => {
      var db = firebase.firestore();
      db.collection('posts').doc(date).collection('posts').doc(id).onSnapshot(function () {});
      db.collection('posts').doc(date).collection('posts').doc(id).collection('comments').onSnapshot(function () {});
      dispatch(null);
    }
  }

  getCommentsForPost(date, id) {
    return(dispatch) => { // {{postID: [comments]}, {postID: [comments]}}
      var ref = firebase.firestore().collection('posts').doc(date).collection('posts').doc(id);
      ref.collection('comments').orderBy('timestamp', 'desc').onSnapshot(function(querySnapshot) {
        var commentsArray = [];
        querySnapshot.forEach(function(doc) {
          var comment = doc.data();
          comment['id'] = doc.id;
          firebase.firestore().collection('users').doc(comment.user).get().then(function(doc) {
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

  addCommentForPost(date, id, commentValue) {
    return(dispatch) => {
      // create comment document if user is logged in
      if (firebase.auth().currentUser) {
        // Save to Firestore
        var ref = firebase.firestore().collection('posts').doc(date).collection('posts').doc(id);
        var newFileId = ref.collection('comments').doc();
        var newFileId2 = firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('comments').doc();
        firebase.firestore().runTransaction(t => {
          return t.get(ref).then(doc => {
            const new_count = doc.data().commentCount + 1;
            t.update(ref, { commentCount: new_count });
            t.set(newFileId, {
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              user: firebase.auth().currentUser.uid,
              content: commentValue
            });
            t.set(newFileId2, {
              postID: doc.id,
              postRef: doc.ref,
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              content: commentValue
            })
          });
        });
      }
    }
  }

  getUsers(userIDs) {
    return (dispatch) => { // {userID: {photoURL, name, link}}
      userIDs.forEach(function(uid) {
        firebase.firestore().collection('users').doc(uid).get().then(function(querySnapshot) {
          var user = querySnapshot.data();
          dispatch({[uid]: user});
        });
      });
    }
  }

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
                  firebase.firestore().collection('unmoderatedPosts').doc(postID).set(post).then(() => {
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
                  firebase.firestore().collection('unmoderatedPosts').doc(postID).set(post).then(() => {
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
              firebase.firestore().collection('unmoderatedPosts').doc(postID).set(post).then(() => {
                postSubmissionStatus['postSubmitted'] = true;
                postSubmissionStatus['uploadProgress'] = 100;
                dispatch(postSubmissionStatus);
              });
            }
          }
        }
      }
      else {
        firebase.firestore().collection('unmoderatedPosts').doc(postID).set(post).then(() => {
          postSubmissionStatus['postSubmitted'] = true;
          postSubmissionStatus['uploadProgress'] = 100;
          dispatch(postSubmissionStatus);
        });
      }
    }
  }

  getUnmoderatedPosts() {
    return (dispatch) => {
      firebase.firestore().collection('unmoderatedPosts').onSnapshot(function(querySnapshot) {
        var unmoderatedPosts = [];
        querySnapshot.forEach(function(s) {
          var post = s.data();
          post['id'] = s.id;
          unmoderatedPosts.push(post);
        })
        dispatch(unmoderatedPosts);
      });
    }
  }

  savePost(post, oldPost) {
    return(dispatch) => {
      // save to posts direction, then add refs to tags, users, events, promos, comments
      firebase.firestore().collection('posts').doc(post.publicationDate).collection('posts').doc(post.id).set(post).then(() => {

        var postRef = {
          postRef: firebase.firestore().collection('posts').doc(post.publicationDate).collection('posts').doc(post.id),
          postID: post.id,
          postDate: post.publicationDate
        }
        // add hunter/maker comment as comment
        if (post.comment !== '') {
          this.addCommentForPost(post.publicationDate, post.id, post.comment);
        }

        // Get a new write batch
        var batch = firebase.firestore().batch();

        // add to tags
        for (var tagIdx in post.tags) {
          batch.set(firebase.firestore().collection('tags').doc(post.tags[tagIdx]).collection('posts').doc(post.id), postRef);
        }

        // add to user's hunted posts
        batch.set(firebase.firestore().collection('users').doc(post.hunterID).collection('huntedPosts').doc(post.id), postRef);

        // add to user's maker posts
        for (var makerIdx in post.makers) {
          batch.set(firebase.firestore().collection('users').doc(post.makers[makerIdx]).collection('makerPosts').doc(post.id), postRef);
        }

        // add to user's editor posts
        for (var editorIdx in post.editors) {
          batch.set(firebase.firestore().collection('users').doc(post.editors[editorIdx]).collection('editedPosts').doc(post.id), postRef);
        }

        // save to events/promos if event/promo
        if (post.startDate) {
          // for every date when event happens
          var dateArray = [];
          var currentDate = moment(post.startDate).startOf('day');;
          var stopDate = moment(post.endDate);
          while (currentDate <= stopDate) {
              dateArray.push(moment(currentDate).utcOffset('+0600').format('L'));
              currentDate = moment(currentDate).add(1, 'days');
          }
          for (var dateIdx in dateArray) {
            batch.set(firebase.firestore().collection(post.type + 's').doc(dateArray[dateIdx]).collection('posts').doc(post.id), postRef);
          }

        }

        // move from unmoderatedPosts to moderated posts
        batch.delete(firebase.firestore().collection('unmoderatedPosts').doc(oldPost.id));
        oldPost['moderatedBy'] = firebase.auth().currentUser.uid;
        oldPost['postRef'] = firebase.firestore().collection('posts').doc(post.publicationDate).collection('posts').doc(post.id);
        oldPost['moderatedAt'] = firebase.firestore.FieldValue.serverTimestamp();
        batch.set(firebase.firestore().collection('moderatedPosts').doc(oldPost.id), oldPost);

        // Commit the batch
        batch.commit().then(function () {
          // update status
          dispatch({
            postSubmitted: true,
            uploadProgress: 100
          });
        });
      });
    }
  }

  addNewPost(post, oldPost) {
    return (dispatch) => {
      var storageRef = firebase.storage().ref();
      post['timestamp'] = firebase.firestore.FieldValue.serverTimestamp();
      post['commentCount'] = 0;
      post['upvoteCount'] = 0;
      var postSubmissionStatus = {
        postSubmitted: false,
        uploadProgress: 0
      };
      // check if post has media
      if (!post.media.length) {
        this.savePost(post, oldPost);
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
              this.savePost(post, oldPost);
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
                  this.savePost(post, oldPost);
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
                  this.savePost(post, oldPost);
                }
              }
            });
          }
        }
      }
    }
  }

  addSamplePosts() {
    return (dispatch) => {
      var types = ['product', 'event', 'place', 'promo'];
      var users = ['83kYwJwX1HTlTFXhdYGkxm18Rtk2', 'FjhVkknrtlQO9KXJpnczsQInZEw1', 'HCxKfES35Qb07MOOELUgPA0KbIj1', 'PkZMIB10cAaYltZXQUJsvW9hKYs1', 'PpKB8jmgfmOfGaBtr8SN9X5i1ma2', 'Qcd6NX3F9JUEHHkbfChtxL1fDjT2', 'iBEhE0ZoCbgALQTYjReNyVggfPz2', 'kMroZQFmD7U9EQEwy19COLuYml42', 'vYizwWaraVO1qoazWUwsqMkleX43', 'zbUs2ZW3CMcSGKsObcFZFzD0frA2'];
      var date = moment().subtract(0, 'days').utcOffset('+0600').format('L');
      var type = types[Math.floor(Math.random() * types.length)];
      var name = 'Test' + type + ' ' + moment().utcOffset('+0600').format('LTS');
      var user = users[Math.floor(Math.random() * users.length)];
      var makers = getRandomItemsFromArray(users, 2)
      var editors = getRandomItemsFromArray(users, 3)
      var id = urlRusLat(name);
      var post = {
        name: name,
        shortDescription: 'Очередной тестовый пост, посмотрим как будет отображаться',
        description: '<h2>Что такое <a href="http://btw.kz/">btw.kz</a>?&nbsp;</h2><p>Во первых мы за унификацию брэнда и произношения, так что начнем с того как это произносится.Произносится "бэтэвэ-кейзэд", в официальной транскрипции так - Так что же это? Наверное Вы уже поняли и сформулировали у себя в голове, что <a href="http://btw.kz/">btw.kz</a> это краудсорсиноговый информационный портал (возможно еще не сформулировалось), и это на самом деле так. Концепция сайта проста, она похожа на реддит, продактхант и хабрахабру - одни пользователи добавляют посты, а другие их апвоутят (лайкают). Самый апвоутнутый пост появляется наверху. Концепция удобна тем, что пользователи заходя на сайт видят сперва лучший контент, и только если у них много времени, могут доскролить до постов без апвоутов. Посты группируются на главной по датам и могут относиться к 7 категориям:</p><ul>  <li>Продукт</li>  <li>Место</li>  <li>Ивент</li>  <li>Промоакция</li></ul><p>В идеале по этим четырем категориям должна быть исчерпывающая информация на сайте, то есть если открылось новое заведение (будь то новый fancy бар или ноунэйм салон красоты) - об этом должна быть информация на сайте. Но кому охота читать про новый салон красоты? Правильно - никому, и он не наберет апвоутов и останется далеко внизу, а что-то интересное выберется наверх списка. Но пост об открытии этого салона красоты должен быть, потому что инфа должна быть исчерпывающей и вдобавок - мы же перфекционисты.</p><p><br></p><h2>Для чего он?</h2><p>Для создания специфично-универсального информационного портал города Алматы (для начала) и построения вокруг этого комьюнити из неравнодушных предприимчивых людей.Вещи тут публикуются в основном позитивные, например как открытие каких-то новых мест, объявлении о проведении мероприятии, запуск каких-то продуктов. Как бы в городе постоянно происходит много чего интересного, есть какая-то инфа об этом на разных новостных сайтах, в соц сетях, но хотелось бы эту всю инфу структурировать и систематизировать.В будущем надеемся, что наличие такого ресурса создаст созидательную атмосферу наличия в городе огромного количества предприимчивых/креативных/творческих людей и подстегнет других на развитие себя и запуск своих проектов. Например, человек зайдет на btw.kz, увидит, что за сегодня только открылось три шашлычных в городе, &nbsp;как бэ люди не сидят на месте, двигаются, что-то делают, и этот человек вдохновится открыть свой центр для проведения юзабилити исследовании диджитал продуктов 🤷?♂️. Ему хорошо, город развивается и на нашем сайте будет новый пост - всем одни плюсы.</p>',
        links: ['http://google.com', 'http://yandex.ru'],
        media: [{link: 'https://source.unsplash.com/random', type: 'image', thumbnail: 'https://source.unsplash.com/random/800x600'},
                {videoID: 'wENhHnJI1ys', type: 'youtube', thumbnail: 'https://img.youtube.com/vi/wENhHnJI1ys/hqdefault.jpg'}],
        tags: ['digital', 'ipsum', 'pop'],
        type: type,
        hunterID: user,
        makers: makers,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        upvoteCount: users.length,
        commentCount: 0,
        Almaty: true,
        publicationDate: date,
        editors: editors,
      }

      if (type !== 'product') {
        post['locationCoordinates'] = [43.24387753783079, 76.94002752645872];
        post['locationAddress'] = 'Алматы, улица Чайковского, 200';
        post['locationComment'] = 'Вход через арку'
      }

      if (type === 'event' || type === 'promo') {
        post['startDate'] = moment().toDate();
        post['endDate'] = moment().add(1, 'days').toDate();
      }

      firebase.firestore().collection('posts').doc(date).collection('posts').doc(id).set(post).then((snapshot) => {
        var batch = firebase.firestore().batch();

        for (var uid in users) {
          batch.set(firebase.firestore().collection('posts').doc(date).collection('posts').doc(id).collection('upvotes').doc(users[uid]), {timestamp: firebase.firestore.FieldValue.serverTimestamp(), user: users[uid]});
        }

        batch.commit();
      });

    }
  }

}

export default alt.createActions(Actions);
