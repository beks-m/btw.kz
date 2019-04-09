import alt from '../utils/Alt';
import firebase from '@firebase/app';
import '@firebase/firestore';
import algoliasearch from 'algoliasearch';

class TagActions {

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

  searchForTag(query) {
    return (dispatch) => {
      var client = algoliasearch("XIN12YYIRV", "cb62d78aa7fee794413aef5ba3e58829");
      this.searchIndex = client.initIndex('tags');

      this.searchIndex.search({ query: query }, (err, content) => {
        if (err) {
          console.error(err);
          return;
        }
        var results = [];
        for (var h in content.hits) {
          results.push(content.hits[h].name)
        }
        dispatch(results);
      });
    }
  }

}

export default alt.createActions(TagActions);
