const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

function buildHtmlWithPost(post) {
  const string = '<!DOCTYPE html><head>' +
    '<title>' + post.name + ' | btw.kz</title>' +
    '<meta name="description" content="' + post.shortDescription + '" />' +
    '<meta property="og:title" content="' + post.name + ' | btw.kz" />' +
    '<meta property="og:image" content="' + post.media[0].link + '" />' +
    '<meta property="og:type" content="website" />' +
    '<meta property="og:site_name" content="btw.kz"/>' +
    '<meta property="og:description" content="' + post.shortDescription + '" />' +
    '<meta property="og:url" content="https://btw.kz/posts/' + post.publicationDate + '/' +  post.id + '"/>' +
    '<meta property="fb:app_id" content="668812386840509" />' +
    '<meta name="twitter:card" content="summary_large_image" />' +
    '<meta name="twitter:domain" value="btw.kz" />' +
    '<meta name="twitter:title" value="' + post.name + ' | btw.kz" />' +
    '<meta name="twitter:description" value="' + post.shortDescription + '"/>' +
    '<meta name="twitter:image" content="' + post.media[0].link + '" />' +
    '<meta name="twitter:label1" value="🔝 ' + post.upvoteCount + '"/>' +
    '<link rel="manifest" href="%PUBLIC_URL%/manifest.json">' +
    '<link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">' +
    '</head><body style="background-color: #f9f9f9">' +
    '<script>window.location="https://btw.kz/post/' + post.publicationDate + '/' + post.id  + '";</script>' +
    '</body></html>';
  return string;
}

function pageNotFoundHtml(url) {
  const string = '<!DOCTYPE html><head>' +
  '<title>btw.kz</title>' +
  '<meta name="description" content="Страница не найдена 😕" />' +
  '<meta property="og:title" content="btw.kz" />' +
  '<meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/btw-kz.appspot.com/o/logo-square-1024.png?alt=media&token=7c0b442b-ac8f-4779-9da7-2fb1228a2e89" />' +
  '<meta property="og:type" content="website" />' +
  '<meta property="og:site_name" content="btw.kz"/>' +
  '<meta property="og:description" content="Страница не найдена 😕" />' +
  '<meta property="og:url" content="https://btw.kz' + url + '"/>' +
  '<meta property="fb:app_id" content="668812386840509" />' +
  '<meta name="twitter:card" content="summary" />' +
  '<meta name="twitter:domain" value="btw.kz" />' +
  '<meta name="twitter:title" value="btw.kz" />' +
  '<meta name="twitter:description" value="Страница не найдена 😕" />' +
  '<meta name="twitter:image" content="https://firebasestorage.googleapis.com/v0/b/btw-kz.appspot.com/o/logo-square-1024.png?alt=media&token=7c0b442b-ac8f-4779-9da7-2fb1228a2e89" />' +
  '<link rel="manifest" href="%PUBLIC_URL%/manifest.json">' +
  '<link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">' +
  '</head><body style="background-color: #f9f9f9">' +
  '<script>window.location="https://btw.kz' + url + '";</script>' +
  '</body></html>';
  return string;
}

exports.post = functions.https.onRequest((req, res) => {
  const path = req.path.split('/');
  const postDate = path[2];
  const postID = path[3];
  var htmlString = '';
  admin.firestore().collection('posts').doc(postDate).collection('posts').doc(postID).get().then(snapshot => {
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

// bots will access btw.kz/sitemaps-main or btw.kz/sitemaps-12.2017
exports.sitemap = functions.https.onRequest((req, res) => {
  console.log('sitemap');
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

// Update the search index every time a post is added.
exports.onPostCreated = functions.firestore.document('posts/{dateID}/posts/{postID}').onCreate(event => {
  // Get the post document
  var post = event.data.data();

  // Add to Sitemap batch
  const parsedDate = event.params.dateID.split('.');
  const docID = parsedDate[1] + '.' + parsedDate[2];
  var dateNow = new Date();
  // Construct new string to attach
  const str = '<url><loc>https://btw.kz/posts/' + event.params.dateID + '/' + event.params.postID + '</loc><lastmod>' + dateNow.toISOString() + '</lastmod></url>';
  // Get necessary sitemap, if there is no such sitemap -> create
  admin.firestore().collection('sitemaps').doc(docID).get().then(snapshot => {
    if (snapshot.exists) {
      // place new url into existing sitemap
      var sitemapString = snapshot.data().sitemap;
      var sitemapBeginning = sitemapString.slice(0, -9);
      var sitemapEnd = sitemapString.slice(-9);
      var newSitemap = sitemapBeginning + str + sitemapEnd;
      // save new sitemap
      admin.firestore().collection('sitemaps').doc(docID).set({sitemap: newSitemap})
      // update main sitemap lastmod
      admin.firestore().collection('sitemaps').doc('main').get().then(snapshot => {
        var mainSitemap = snapshot.data().sitemap;
        var entryToUpdate = '<loc>https://btw.kz/sitemap-' + docID + '</loc>';
        var startPos = mainSitemap.indexOf(entryToUpdate) + entryToUpdate.length;
        endString = '</lastmod>';
        var endPos = mainSitemap.indexOf(endString, startPos) + endString.length;
        var newLastMod = '<lastmod>' + dateNow.toISOString() + '</lastmod>';
        var newMainSitemap = mainSitemap.slice(0, startPos) + newLastMod + mainSitemap.substr(endPos);
        admin.firestore().collection('sitemaps').doc('main').set({sitemap: newMainSitemap});
      });
    } else {
      // if there is no such sitemap -> create new one and save
      var newSitemap = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + str +  '</urlset>';
      admin.firestore().collection('sitemaps').doc(docID).set({sitemap: newSitemap})
      // add to main sitemap
      admin.firestore().collection('sitemaps').doc('main').get().then(snapshot => {
        var mainSitemap = snapshot.data().sitemap;
        var mainSitemapBeginning = mainSitemap.slice(0, -15);
        var mainSitemapEnd = mainSitemap.slice(-15);
        var entryToInsert = '<sitemap><loc>https://btw.kz/sitemap-' + docID + '</loc><lastmod>' + dateNow.toISOString() + '</lastmod></sitemap>';
        var newMainSitemap = mainSitemapBeginning + entryToInsert + mainSitemapEnd;
        admin.firestore().collection('sitemaps').doc('main').set({sitemap: newMainSitemap});
      });
    }
  });

  // Add an 'objectID' field which Algolia requires
  post.objectID = event.params.postID;
  // Write to the algolia index
  const index = client.initIndex(ALGOLIA_INDEX_NAME);
  return index.saveObject(post);
});

// Update the search index every time a post is added.
exports.onPostUpdated = functions.firestore.document('posts/{dateID}/posts/{postID}').onUpdate(event => {
  // Get the post document
  var post = event.data.data();

  const previousPost = event.data.previous.data();

  if (post.updatedAt != previousPost.updatedAt) {
    // Sitemap related
    const parsedDate = event.params.dateID.split('.');
    const docID = parsedDate[1] + '.' + parsedDate[2];
    // Construct new string to attach
    const str = '<url><loc>https://btw.kz/posts/' + event.params.dateID + '/' + event.params.postID + '</loc><lastmod>' + dateNow.toISOString() + '</lastmod></url>';
    // Get necessary sitemap, if there is no such sitemap -> create
    admin.firestore().collection('sitemaps').doc(docID).get().then(snapshot => {
      // change date modified in sitemap
      var sitemapString = snapshot.data().sitemap;
      var entryToUpdate = '<loc>https://btw.kz/posts/' + event.params.dateID + '/' + event.params.postID + '</loc>';
      var startPos = sitemapString.indexOf(entryToUpdate) + entryToUpdate.length;
      endString = '</lastmod>';
      var endPos = mainSitemap.indexOf(endString, startPos) + endString.length;
      var dateNow = new Date();
      var newLastMod = '<lastmod>' + dateNow.toISOString() + '</lastmod>';
      var newSitemapString = sitemapString.slice(0, startPos) + newLastMod + sitemapString.substr(endPos);
      // save new sitemap
      admin.firestore().collection('sitemaps').doc(docID).set({sitemap: newSitemapString});
      // update main sitemap lastmod
      admin.firestore().collection('sitemaps').doc('main').get().then(snapshot => {
        var mainSitemap = snapshot.data().sitemap;
        var entryToUpdate = '<loc>https://btw.kz/sitemap-' + docID + '</loc>';
        var startPos = mainSitemap.indexOf(entryToUpdate) + entryToUpdate.length;
        endString = '</lastmod>';
        var endPos = mainSitemap.indexOf(endString, startPos) + endString.length;
        var newLastMod = '<lastmod>' + dateNow.toISOString() + '</lastmod>';
        var newMainSitemap = mainSitemap.slice(0, startPos) + newLastMod + mainSitemap.substr(endPos);
        admin.firestore().collection('sitemaps').doc('main').set({sitemap: newMainSitemap});
      });
    });
  }
  // Add an 'objectID' field which Algolia requires
  post.objectID = event.params.postID;
  // Write to the algolia index
  const index = client.initIndex(ALGOLIA_INDEX_NAME);
  return index.saveObject(post);
});

// Update the search index every time a post is added.
exports.onPostDeleted = functions.firestore.document('posts/{dateID}/posts/{postID}').onDelete(event => {

  // Sitemap related
  const parsedDate = event.params.dateID.split('.');
  const docID = parsedDate[1] + '.' + parsedDate[2];
  // string to delete
  const str = '<url><loc>https://btw.kz/posts/' + event.params.dateID + '/' + event.params.postID + '</loc><lastmod>' + parsedDate[2] + '-' + parsedDate[1] + '-' + parsedDate[0] + '</lastmod></url>';
  // Get necessary sitemap, if there is no such sitemap -> create
  admin.firestore().collection('sitemaps').doc(docID).get().then(snapshot => {
    // delete entry in sitemap
    var sitemapString = snapshot.data().sitemap;
    var startPos = sitemapString.indexOf(str);
    var newSitemapString = sitemapString.slice(0, startPos) + sitemapString.substr(startPos + str.length);
    // save new sitemap
    admin.firestore().collection('sitemaps').doc(docID).set({sitemap: newSitemapString});
    // update main sitemap lastmod
    admin.firestore().collection('sitemaps').doc('main').get().then(snapshot => {
      var mainSitemap = snapshot.data().sitemap;
      var entryToUpdate = '<loc>https://btw.kz/sitemap-' + docID + '</loc>';
      var startPos = mainSitemap.indexOf(entryToUpdate) + entryToUpdate.length;
      endString = '</lastmod>';
      var endPos = mainSitemap.indexOf(endString, startPos) + endString.length;
      var dateNow = new Date();
      var newLastMod = '<lastmod>' + dateNow.toISOString() + '</lastmod>';
      var newMainSitemap = mainSitemap.slice(0, startPos) + newLastMod + mainSitemap.substr(endPos);
      admin.firestore().collection('sitemaps').doc('main').set({sitemap: newMainSitemap})
    });
  });

  // Write to the algolia index
  const index = client.initIndex(ALGOLIA_INDEX_NAME);
  return index.deleteObject(event.params.postID);
});

function buildAmpWithPost(post) {
  const string = '<!DOCTYPE html><html amp lang="ru"><head>' +
    '<title>' + post.name + ' | btw.kz</title>' +
    '<meta name="description" content="' + post.description.slice(0, 280) + '" />' +
    '<meta property="og:title" content="' + post.name + ' | btw.kz" />' +
    '<meta property="og:image" content="' + post.media[0].link + '" />' +
    '<meta property="og:type" content="website" />' +
    '<meta property="og:site_name" content="btw.kz"/>' +
    '<meta property="og:description" content="' + post.description.slice(0, 280) + '" />' +
    '<meta property="og:url" content="https://btw.kz/posts/' + post.date + '/' +  post.id + '"/>' +
    '<meta property="fb:app_id" content="668812386840509" />' +
    '<meta name="twitter:card" content="summary_large_image" />' +
    '<meta name="twitter:domain" value="btw.kz" />' +
    '<meta name="twitter:title" value="' + post.name + ' | btw.kz" />' +
    '<meta name="twitter:description" value="' + post.description.slice(0, 280) + '"/>' +
    '<meta name="twitter:image" content="' + post.media[0].link + '" />' +
    '<meta name="twitter:label1" value="🔝 ' + post.upvoteCount + '"/>' +
    '<link rel="manifest" href="%PUBLIC_URL%/manifest.json">' +
    '<link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">' +
    '</head><body style="background-color: #f9f9f9">' +
    '</body></html>';
  return string;
}

exports.amp = functions.https.onRequest((req, res) => {
  const path = req.path.split('/');
  const postDate = path[3];
  const postID = path[4];
  var htmlString = '';
  admin.firestore().collection('posts').doc(postDate).collection('posts').doc(postID).get().then(snapshot => {
    if (snapshot.exists) {
      const post = snapshot.data();
      post.id = snapshot.id;
      post.date = postDate;
      htmlString = buildAmpWithPost(post);
      res.status(200).end(htmlString);
    } else {
      htmlString = pageNotFoundHtml(req.path);
      res.status(200).end(htmlString);
    }
  });
});
