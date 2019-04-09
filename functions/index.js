const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

function buildHtmlWithPost(post) {
  var mediaLink = post.media && post.media.length ? post.media[0].link : 'https://firebasestorage.googleapis.com/v0/b/btw.kz/o/main%2Flogo%20black%20minified.jpg?alt=media&token=4523f60f-1453-4655-ac8b-44ce4ae9f377';
  const string = '<!DOCTYPE html><head>' +
    '<title>' + post.name + ' | btw.kz</title>' +
    '<meta name="description" content="' + post.shortDescription + '" />' +
    '<meta property="og:title" content="' + post.name + ' | btw.kz" />' +
    '<meta property="og:image" content="' + mediaLink + '" />' +
    '<meta property="og:type" content="website" />' +
    '<meta property="og:site_name" content="btw.kz"/>' +
    '<meta property="og:description" content="' + post.shortDescription + '" />' +
    '<meta property="og:url" content="https://btw.kz/posts/' +  post.id + '"/>' +
    '<meta property="fb:app_id" content="668812386840509" />' +
    '<meta name="twitter:card" content="summary_large_image" />' +
    '<meta name="twitter:domain" value="btw.kz" />' +
    '<meta name="twitter:title" value="' + post.name + ' | btw.kz" />' +
    '<meta name="twitter:description" value="' + post.shortDescription + '"/>' +
    '<meta name="twitter:image" content="' + mediaLink + '" />' +
    '<meta name="twitter:label1" value="🔝 ' + post.upvoteCount + '"/>' +
    '<link rel="manifest" href="%PUBLIC_URL%/manifest.json">' +
    '<link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">' +
    '</head><body style="background-color: #f9f9f9">' +
    '<script>window.location="https://btw.kz/post/' + post.id  + '";</script>' +
    '</body></html>';
  return string;
}

function pageNotFoundHtml(url) {
  const string = '<!DOCTYPE html><head>' +
  '<title>btw.kz</title>' +
  '<meta name="description" content="Страница не найдена 😕" />' +
  '<meta property="og:title" content="btw.kz" />' +
  '<meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/btw.kz/o/main%2Flogo%20black%20minified.jpg?alt=media&token=4523f60f-1453-4655-ac8b-44ce4ae9f377" />' +
  '<meta property="og:type" content="website" />' +
  '<meta property="og:site_name" content="btw.kz"/>' +
  '<meta property="og:description" content="Страница не найдена 😕" />' +
  '<meta property="og:url" content="https://btw.kz' + url + '"/>' +
  '<meta property="fb:app_id" content="668812386840509" />' +
  '<meta name="twitter:card" content="summary" />' +
  '<meta name="twitter:domain" value="btw.kz" />' +
  '<meta name="twitter:title" value="btw.kz" />' +
  '<meta name="twitter:description" value="Страница не найдена 😕" />' +
  '<meta name="twitter:image" content="https://firebasestorage.googleapis.com/v0/b/btw.kz/o/main%2Flogo%20black%20minified.jpg?alt=media&token=4523f60f-1453-4655-ac8b-44ce4ae9f377" />' +
  '<link rel="manifest" href="%PUBLIC_URL%/manifest.json">' +
  '<link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">' +
  '</head><body style="background-color: #f9f9f9">' +
  '<script>window.location="https://btw.kz' + url + '";</script>' +
  '</body></html>';
  return string;
}

// unfurling links
exports.post = functions.https.onRequest((req, res) => {
  const path = req.path.split('/');
  const postID = path[2];
  var htmlString = '';
  admin.firestore().collection('posts').doc(postID).get().then(snapshot => {
    if (snapshot.exists) {
      const post = snapshot.data();
      post.id = snapshot.id;
      htmlString = buildHtmlWithPost(post);
      res.status(200).end(htmlString);
    } else {
      htmlString = pageNotFoundHtml(req.path);
      res.status(200).end(htmlString);
    }
  });
});

// bots will access btw.kz/sitemap-main or btw.kz/sitemap-12.2017
exports.sitemap = functions.https.onRequest((req, res) => {
  const path = req.path.split('-');
  const date = path[1];
  admin.firestore().collection('sitemaps').doc(date).get().then(snapshot => {
    if (snapshot.exists) {
      const sitemap = snapshot.data().sitemap;
      res.status(200).end(sitemap);
    } else {
      res.status(200).end(pageNotFoundHtml(req.path));
    }
  });
});

var algoliasearch = require('algoliasearch');
const ALGOLIA_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.admin_key;
const ALGOLIA_SEARCH_KEY = functions.config().algolia.search_key;

const ALGOLIA_INDEX_NAME = 'posts';
const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);

exports.onPostCreated = functions.firestore.document('posts/{postID}').onCreate((snap, context) => {
  // Get the post document
  var post = snap.data();

  // Add an 'objectID' field which Algolia requires
  post.objectID = context.params.postID;
  // Write to the algolia index
  const index = client.initIndex(ALGOLIA_INDEX_NAME);
  index.saveObject(post);

  // Add to Sitemap batch
  const parsedDate = post.publicationDate.split('-');
  const docID = parsedDate[1] + '.' + parsedDate[2];
  var dateNow = new Date();
  // Construct new string to attach
  const str = '<url><loc>https://btw.kz/posts/' + context.params.postID + '</loc><lastmod>' + dateNow.toISOString() + '</lastmod></url>';
  // Get necessary sitemap, if there is no such sitemap -> create
  return admin.firestore().collection('sitemaps').doc(docID).get().then(snapshot => {
    if (snapshot.exists) {
      // place new url into existing sitemap
      var sitemapString = snapshot.data().sitemap;
      var sitemapBeginning = sitemapString.slice(0, -9);
      var sitemapEnd = sitemapString.slice(-9);
      var newSitemapString = sitemapBeginning + str + sitemapEnd;

      // batch write of sitemap and main sitemap
      return admin.firestore().runTransaction(t => {
        return t.get(admin.firestore().collection('sitemaps').doc('main')).then(snapshot => {
          var mainSitemap = snapshot.data().sitemap;
          var entryToUpdate = '<loc>https://btw.kz/sitemap-' + docID + '</loc>';
          var startPos = mainSitemap.indexOf(entryToUpdate) + entryToUpdate.length;
          var endString = '</lastmod>';
          var endPos = mainSitemap.indexOf(endString, startPos) + endString.length;
          var newLastMod = '<lastmod>' + dateNow.toISOString() + '</lastmod>';
          var newMainSitemap = mainSitemap.slice(0, startPos) + newLastMod + mainSitemap.substr(endPos);
          // update main sitemap lastmod
          t.set(admin.firestore().collection('sitemaps').doc('main'), {sitemap: newMainSitemap});
          // save new sitemap
          t.set(admin.firestore().collection('sitemaps').doc(docID), {sitemap: newSitemapString})
        });
      });
    } else {
      // if there is no such sitemap -> create new one and save
      var newSitemap = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + str +  '</urlset>';
      // batch write of sitemap and main sitemap
      return admin.firestore().runTransaction(t => {
        return t.get(admin.firestore().collection('sitemaps').doc('main')).then(snapshot => {
          var mainSitemap = snapshot.data().sitemap;
          var mainSitemapBeginning = mainSitemap.slice(0, -15);
          var mainSitemapEnd = mainSitemap.slice(-15);
          var entryToInsert = '<sitemap><loc>https://btw.kz/sitemap-' + docID + '</loc><lastmod>' + dateNow.toISOString() + '</lastmod></sitemap>';
          var newMainSitemap = mainSitemapBeginning + entryToInsert + mainSitemapEnd;
          // update main sitemap lastmod
          t.set(admin.firestore().collection('sitemaps').doc('main'), {sitemap: newMainSitemap});
          // save new sitemap
          t.set(admin.firestore().collection('sitemaps').doc(docID), {sitemap: newSitemap})
        });
      });
    }
  });

});

exports.onPostUpdated = functions.firestore.document('posts/{postID}').onUpdate((change, context) => {
  // Get the post document
  var post = change.after.data();

  // Add an 'objectID' field which Algolia requires
  post.objectID = context.params.postID;
  // Write to the algolia index
  const index = client.initIndex(ALGOLIA_INDEX_NAME);
  index.saveObject(post);

  const previousPost = change.before.data();

  if (post.updatedAt.getTime() !== previousPost.updatedAt.getTime()) {
    // Sitemap related
    const parsedDate = post.publicationDate.split('-');
    const docID = parsedDate[1] + '.' + parsedDate[2];
    // Get necessary sitemap
    return admin.firestore().collection('sitemaps').doc(docID).get().then(snapshot => {
      // change date modified in sitemap
      var sitemapString = snapshot.data().sitemap;
      var entryToUpdate = '<loc>https://btw.kz/posts/' + context.params.postID + '</loc>';
      var startPos = sitemapString.indexOf(entryToUpdate) + entryToUpdate.length;
      var endString = '</lastmod>';
      var endPos = sitemapString.indexOf(endString, startPos) + endString.length;
      var dateNow = new Date();
      var newLastMod = '<lastmod>' + dateNow.toISOString() + '</lastmod>';
      var newSitemapString = sitemapString.slice(0, startPos) + newLastMod + sitemapString.substr(endPos);

      // batch write of sitemap and main sitemap
      return admin.firestore().runTransaction(t => {
        return t.get(admin.firestore().collection('sitemaps').doc('main')).then(snapshot => {
          var mainSitemap = snapshot.data().sitemap;
          var entryToUpdate = '<loc>https://btw.kz/sitemap-' + docID + '</loc>';
          var startPos = mainSitemap.indexOf(entryToUpdate) + entryToUpdate.length;
          endString = '</lastmod>';
          var endPos = mainSitemap.indexOf(endString, startPos) + endString.length;
          var newLastMod = '<lastmod>' + dateNow.toISOString() + '</lastmod>';
          var newMainSitemap = mainSitemap.slice(0, startPos) + newLastMod + mainSitemap.substr(endPos);
          // update main sitemap lastmod
          t.set(admin.firestore().collection('sitemaps').doc('main'), {sitemap: newMainSitemap});
          // save new sitemap
          t.set(admin.firestore().collection('sitemaps').doc(docID), {sitemap: newSitemapString})
        });
      });
    });
  } else {
    return 'ok';
  }
});

exports.onPostDeleted = functions.firestore.document('posts/{postID}').onDelete((snap, context) => {

  // Get the post document
  var post = snap.data();

  // Write to the algolia index
  const index = client.initIndex(ALGOLIA_INDEX_NAME);
  index.deleteObject(context.params.postID);

  // Sitemap related
  const parsedDate = post.publicationDate.split('-');
  const docID = parsedDate[1] + '.' + parsedDate[2];
  // Get necessary sitemap, if there is no such sitemap -> create
  return admin.firestore().collection('sitemaps').doc(docID).get().then(snapshot => {
    // delete entry in sitemap
    var sitemapString = snapshot.data().sitemap;
    var startString = '<url><loc>https://btw.kz/posts/' + context.params.dateID + '/' + context.params.postID + '</loc>';
    var startPos = sitemapString.indexOf(startString);
    var endString = '</url>';
    var endPos = sitemapString.indexOf(endString, startPos) + endString.length;
    var newSitemapString = sitemapString.slice(0, startPos) + sitemapString.substr(endPos);

    // batch write of sitemap and main sitemap
    return admin.firestore().runTransaction(t => {
      return t.get(admin.firestore().collection('sitemaps').doc('main')).then(snapshot => {
        var mainSitemap = snapshot.data().sitemap;
        var entryToUpdate = '<loc>https://btw.kz/sitemap-' + docID + '</loc>';
        var startPos = mainSitemap.indexOf(entryToUpdate) + entryToUpdate.length;
        endString = '</lastmod>';
        var endPos = mainSitemap.indexOf(endString, startPos) + endString.length;
        var dateNow = new Date();
        var newLastMod = '<lastmod>' + dateNow.toISOString() + '</lastmod>';
        var newMainSitemap = mainSitemap.slice(0, startPos) + newLastMod + mainSitemap.substr(endPos);
        // update main sitemap lastmod
        t.set(admin.firestore().collection('sitemaps').doc('main'), {sitemap: newMainSitemap});
        // save new sitemap
        t.set(admin.firestore().collection('sitemaps').doc(docID), {sitemap: newSitemapString})
      });
    });
  });
});

exports.onTagCreated = functions.firestore.document('tags/{tag}').onCreate((snap, context) => {
  // Add an 'objectID' field which Algolia requires
  var tag = {name: context.params.tag, postCount: 1};
  tag.objectID = context.params.tag;
  // Write to the algolia index
  const index = client.initIndex('tags');
  return index.saveObject(tag);
});

exports.onTagUpdated = functions.firestore.document('tags/{tag}').onUpdate((change, context) => {
  // Add an 'objectID' field which Algolia requires
  var tag = {name: context.params.tag, postCount: change.before.data().postCount};
  tag.objectID = context.params.tag;
  // Write to the algolia index
  const index = client.initIndex('tags');
  return index.saveObject(tag);
});

function buildAmpWithPost(post) {
  var mediaLink = post.media && post.media.length ? post.media[0].link : 'https://firebasestorage.googleapis.com/v0/b/btw.kz/o/main%2Flogo%20black%20minified.jpg?alt=media&token=4523f60f-1453-4655-ac8b-44ce4ae9f377';
  const string = '<!DOCTYPE html><html amp lang="ru"><head>' +
    '<title>' + post.name + ' | btw.kz</title>' +
    '<meta name="description" content="' + post.shortDescription + '" />' +
    '<meta property="og:title" content="' + post.name + ' | btw.kz" />' +
    '<meta property="og:image" content="' + mediaLink + '" />' +
    '<meta property="og:type" content="website" />' +
    '<meta property="og:site_name" content="btw.kz"/>' +
    '<meta property="og:description" content="' + post.shortDescription + '" />' +
    '<meta property="og:url" content="https://btw.kz/posts/' +  post.id + '"/>' +
    '<meta property="fb:app_id" content="668812386840509" />' +
    '<meta name="twitter:card" content="summary_large_image" />' +
    '<meta name="twitter:domain" value="btw.kz" />' +
    '<meta name="twitter:title" value="' + post.name + ' | btw.kz" />' +
    '<meta name="twitter:description" value="' + post.shortDescription + '"/>' +
    '<meta name="twitter:image" content="' + mediaLink + '" />' +
    '<meta name="twitter:label1" value="🔝 ' + post.upvoteCount + '"/>' +
    '<link rel="manifest" href="%PUBLIC_URL%/manifest.json">' +
    '<link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">' +
    '</head><body style="background-color: #f9f9f9">' +
    '</body></html>';
  return string;
}

exports.amp = functions.https.onRequest((req, res) => {
  const path = req.path.split('/');
  const postID = path[3];
  var htmlString = '';
  admin.firestore().collection('posts').doc(postID).get().then(snapshot => {
    if (snapshot.exists) {
      const post = snapshot.data();
      post.id = snapshot.id;
      htmlString = buildAmpWithPost(post);
      res.status(200).end(htmlString);
    } else {
      htmlString = pageNotFoundHtml(req.path);
      res.status(200).end(htmlString);
    }
  });
});
