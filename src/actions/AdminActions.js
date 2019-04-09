import alt from '../utils/Alt';
import firebase from '@firebase/app';
import '@firebase/firestore';
import * as moment from 'moment';
import 'moment/locale/ru';
import { urlRusLat } from '../utils/translit';
import { getRandomItemsFromArray } from '../utils/contentFunctions'

class AdminActions {

  getUnmoderatedPosts() {
    return (dispatch) => {
      var db = firebase.firestore();
      db.collection('unmoderatedPosts').onSnapshot((querySnapshot) => {
        var unmoderatedPosts = [];
        querySnapshot.forEach((s) => {
          var post = s.data();
          post['id'] = s.id;
          unmoderatedPosts.push(post);
        })
        dispatch(unmoderatedPosts);
      });
    }
  }

  getUnmoderatedComments() {
    return (dispatch) => {
      var db = firebase.firestore();
      db.collection('userActivity').where('moderated', '==', false).orderBy('timestamp', 'desc').get().then((snapshot) => {
        if (snapshot.metadata.fromCache) { // fix for getting empty list of posts
          dispatch(null);
        } else {
          var comments = [];
          snapshot.forEach(doc => {
            var comment = doc.data();
            comment['id'] = doc.id;
            comments.push(comment);
          });
          dispatch(comments);
        }
      });
    }
  }

  setCommentStatus(commentID, commentStatus) {
    return (dispatch) => {
      var db = firebase.firestore();
      db.collection('userActivity').doc(commentID).update({moderated: true, approved: commentStatus}).then(() => {
        dispatch({[commentID]: commentStatus});
      });
    }
  }

  getUserActivityForDate(date) {
    return (dispatch) => {
      var db = firebase.firestore();
      if (date) {
        db.collection('userActivity').where('timestamp', '>', moment(date, 'DD-MM-YYYY').startOf('day').toDate()).where('timestamp', '<', moment(date, 'DD-MM-YYYY').endOf('day').toDate()).orderBy('timestamp', 'desc').get().then((snapshot) => {
          if (snapshot.metadata.fromCache) { // fix for getting empty list of posts
            dispatch({notFound: true, date: [date]});
          } else {
            var userActivity = [];
            snapshot.forEach(doc => {
              var u = doc.data();
              u['id'] = doc.id;
              userActivity.push(u);
            });
            dispatch({[date]: userActivity});
          }
        });
      } else {
        db.collection('userActivity').orderBy('timestamp', 'desc').limit(20).get().then((snapshot) => {
          if (snapshot.metadata.fromCache) { // fix for getting empty list of posts
            dispatch({notFound: true, date: [date]});
          } else {
            var userActivity = [];
            snapshot.forEach(doc => {
              var u = doc.data();
              u['id'] = doc.id;
              userActivity.push(u);
            });
            dispatch({Last: userActivity});
          }
        });
      }

    }
  }

  getUsers(lastSnapshot) {
    return (dispatch) => {
      var db = firebase.firestore();
      if (!lastSnapshot) {
        db.collection('users').orderBy('registeredOn', 'desc').limit(10).get().then((snapshot) => {
          if (snapshot.metadata.fromCache) { // fix for getting empty list of posts
            dispatch({notFound: true, lastSnapshot: [lastSnapshot]});
          } else {
            var users = [];
            snapshot.forEach(doc => {
              var user = doc.data();
              user['snapshot'] = doc;
              users.push(user);
            });
            dispatch(users);
          }
        });
      } else {
        db.collection('users').orderBy('registeredOn', 'desc').limit(10).startAfter(lastSnapshot).get().then((snapshot) => {
          if (snapshot.metadata.fromCache) { // fix for getting empty list of posts
            dispatch({notFound: true, lastSnapshot: [lastSnapshot]});
          } else {
            var users = [];
            snapshot.forEach(doc => {
              var user = doc.data();
              user['snapshot'] = doc;
              users.push(user);
            });
            dispatch(users);
          }
        });
      }
    }
  }

  addSamplePosts() {
    return (dispatch) => {
      var db = firebase.firestore();
      var types = ['product', 'event', 'place', 'promo', 'content'];
      var users = ['83kYwJwX1HTlTFXhdYGkxm18Rtk2', 'FjhVkknrtlQO9KXJpnczsQInZEw1', 'HCxKfES35Qb07MOOELUgPA0KbIj1', 'PkZMIB10cAaYltZXQUJsvW9hKYs1', 'PpKB8jmgfmOfGaBtr8SN9X5i1ma2', 'Qcd6NX3F9JUEHHkbfChtxL1fDjT2', 'iBEhE0ZoCbgALQTYjReNyVggfPz2', 'kMroZQFmD7U9EQEwy19COLuYml42', 'vYizwWaraVO1qoazWUwsqMkleX43', 'zbUs2ZW3CMcSGKsObcFZFzD0frA2'];
      var imageCollections = ['782142', '217461', '211', '589287', '975241', '612689', '762960', '208403', '369', '575196', '539469']
      var date = moment().subtract(0, 'days').utcOffset('+0600').format('DD-MM-YYYY');
      var type = types[Math.floor(Math.random() * types.length)];
      var mediaLink = 'https://source.unsplash.com/collection/' + imageCollections[Math.floor(Math.random() * imageCollections.length)];
      var name = 'Test' + type + ' ' + moment().utcOffset('+0600').format('LTS');
      var user = users[Math.floor(Math.random() * users.length)];
      var d = new Date();
      var makersArray = getRandomItemsFromArray(users, 2);
      var makers = {};
      makersArray.map((item, idx) => {
        return makers[item] = d;
      })
      var editorsArray = getRandomItemsFromArray(users, 3);
      var editors = {};
      editorsArray.map((item, idx) => {
        return editors[item] = d;
      })
      var id = urlRusLat(name);
      var post = {
        name: name,
        shortDescription: 'Очередной тестовый пост, посмотрим как будет отображаться',
        description: '<h2>Что такое <a href="http://btw.kz/">btw.kz</a>?&nbsp;</h2><p>Во первых мы за унификацию брэнда и произношения, так что начнем с того как это произносится.Произносится "бэтэвэ-кейзэд", в официальной транскрипции так - Так что же это? Наверное Вы уже поняли и сформулировали у себя в голове, что <a href="http://btw.kz/">btw.kz</a> это краудсорсиноговый информационный портал (возможно еще не сформулировалось), и это на самом деле так. Концепция сайта проста, она похожа на реддит, продактхант и хабрахабру - одни пользователи добавляют посты, а другие их апвоутят (лайкают). Самый апвоутнутый пост появляется наверху. Концепция удобна тем, что пользователи заходя на сайт видят сперва лучший контент, и только если у них много времени, могут доскролить до постов без апвоутов. Посты группируются на главной по датам и могут относиться к 7 категориям:</p><ul>  <li>Продукт</li>  <li>Место</li>  <li>Ивент</li>  <li>Промоакция</li></ul><p>В идеале по этим четырем категориям должна быть исчерпывающая информация на сайте, то есть если открылось новое заведение (будь то новый fancy бар или ноунэйм салон красоты) - об этом должна быть информация на сайте. Но кому охота читать про новый салон красоты? Правильно - никому, и он не наберет апвоутов и останется далеко внизу, а что-то интересное выберется наверх списка. Но пост об открытии этого салона красоты должен быть, потому что инфа должна быть исчерпывающей и вдобавок - мы же перфекционисты.</p><p><br></p><h2>Для чего он?</h2><p>Для создания специфично-универсального информационного портал города Алматы (для начала) и построения вокруг этого комьюнити из неравнодушных предприимчивых людей.Вещи тут публикуются в основном позитивные, например как открытие каких-то новых мест, объявлении о проведении мероприятии, запуск каких-то продуктов. Как бы в городе постоянно происходит много чего интересного, есть какая-то инфа об этом на разных новостных сайтах, в соц сетях, но хотелось бы эту всю инфу структурировать и систематизировать.В будущем надеемся, что наличие такого ресурса создаст созидательную атмосферу наличия в городе огромного количества предприимчивых/креативных/творческих людей и подстегнет других на развитие себя и запуск своих проектов. Например, человек зайдет на btw.kz, увидит, что за сегодня только открылось три шашлычных в городе, &nbsp;как бэ люди не сидят на месте, двигаются, что-то делают, и этот человек вдохновится открыть свой центр для проведения юзабилити исследовании диджитал продуктов 🤷?♂️. Ему хорошо, город развивается и на нашем сайте будет новый пост - всем одни плюсы.</p>',
        links: ['http://google.com', 'http://yandex.ru'],
        media: [{
          link: mediaLink,
          type: 'image',
          thumbnail: mediaLink
        }, {
          videoID: 'wENhHnJI1ys',
          type: 'youtube',
          thumbnail: 'https://img.youtube.com/vi/wENhHnJI1ys/hqdefault.jpg'
        }],
        tags: {
          'digital': users.length,
          'ipsum': users.length,
          'pop': users.length,
          'рубимания': users.length
        },
        type: type,
        hunterID: user,
        makers: makers,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        upvoteCount: users.length,
        commentCount: 0,
        city: { Almaty: true },
        publicationDate: date,
        editors: editors,
        id: id
      }

      if (type !== 'product') {
        post['locationCoordinates'] = [43.24387753783079, 76.94002752645872];
        post['locationAddress'] = 'Алматы, улица Чайковского, 200';
        post['locationComment'] = 'Вход через арку'
      }

      if (type === 'event' || type === 'promo') {
        post['startDate'] = moment().toDate();
        post['endDate'] = moment().add(1, 'days').toDate();
        // for every date when event happens
        var onDates = {};
        var currentDate = moment(post.startDate).startOf('day');
        var stopDate = post['endDate'];
        while (currentDate <= stopDate) {
            onDates[moment(currentDate).utcOffset('+0600').format('DD-MM-YYYY')] = users.length;
            currentDate = moment(currentDate).add(1, 'days');
        }
        post['onDatesInAlmaty'] = onDates;
      }

      db.collection('posts').doc(id).set(post).then((snapshot) => {
        var batch = db.batch();

        for (var uid in users) {
          batch.set(db.collection('userActivity').doc(users[uid] + id), {timestamp: firebase.firestore.FieldValue.serverTimestamp(), userID: users[uid], postID: id, type: 'upvote'});
        }

        batch.commit();
      });

    }
  }

}

export default alt.createActions(AdminActions);
