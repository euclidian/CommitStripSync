/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var lastPublishedKey = 'last_page_published';
var lastSeenKey = 'last_seen';
function saveLastSeen(page_id) {
    chrome.storage.sync.set({last_seen: page_id}, function() {
        console.log(chrome.extension.lastError);
        console.log('Message seen');
    });
}

function saveLastPublished(page_id) {
    chrome.storage.sync.set({last_page_published: page_id}, function() {
        console.log(chrome.extension.lastError);
        console.log("Published save");
    });
}

function getLastSeen(callback) {
    chrome.storage.sync.get(lastSeenKey, function(result) {
        callback(result.last_seen);
    });
}

function fetchLastSeen(callback) {
    chrome.storage.sync.get([lastSeenKey, lastPublishedKey], function(result) {
        console.log(result);
        var lastSeenPage = result.last_seen;
        if (lastSeenPage == null) {
        } else {
            callback(result);
        }
    });
}

function fetchLastPublished(callback) {
    chrome.storage.sync.get(lastPublishedKey, function(result) {
        var lastPublished = result.last_page_published;
        if (lastPublished == null) {
            var lastPublished = 1;
            saveLastPublished(lastPublished);
            callback({last_page_published: lastPublished});
        } else {
            callback(result);
        }
    });
}
//function onConnect(port) {
//    console.assert(port.name == "commit_strip_last_seen");
//    console.log('masuk sini');
//    port.onMessage.addListener(function(msg) {
//        if (msg.data == "getLastRead") {
//            chrome.storage.sync.get('last_seen', function(result) {
//                var lastSeen = result.last_seen;
//                if (lastSeen == null) {
//                    saveLastSeen(1);
//                    port.postMessage({last_seen: '1'});
//                } else {
//                    port.postMessage({last_seen: lastSeen});
//                }
//            });
//        }
//    });
//}

//chrome.runtime.onConnect.addListener(onConnect);

function onRequest(request, sender, callback) {
    if (request.action === 'fetch_last_seen') {
        fetchLastSeen(callback);
    } else if (request.action === 'fetch_last_published') {
        fetchLastPublished(callback);
    } else if (request.action === 'ping') {
        var currUrl = sender.url;
        chrome.storage.sync.get('last_seen', function(result) {
            var lastSeenPage = result.last_seen;
            if (currUrl.indexOf("http://www.commitstrip.com/en") > -1) {
                var strings = currUrl.replace("http://", '').split('/');
                if (strings.length < 3) {
                    //berarti di halaman pertama
                    if (lastSeenPage == null || lastSeenPage == 0) {
                        saveLastSeen(1);
                    }
                } else {
                    var pageId = strings[3];
                    if (lastSeenPage == null || lastSeenPage == 0) {
                        saveLastSeen(pageId);
                    } else {
                        if (lastSeenPage > pageId) {
                            saveLastSeen(pageId);
                        }
                    }
                }
            }
        });
    }
}

////wire up commit strip popup listener
chrome.extension.onRequest.addListener(onRequest);

$(document).ready(function() {
    commitStripFeedLastPublished();
});

function commitStripFeedLastPublished() {
    $.ajax({
        type: 'GET',
        url: 'http://www.commitstrip.com/en/page/3/',
        success: function(successResponse, status) {
            var lastPage = $('.last', successResponse).first().attr('href');
            var lastPublished = lastPage.split('/')[5];
            console.log(lastPublished);
            chrome.storage.sync.get(null, function(response) {
                var allKeys = Object.keys(response);
                console.log(allKeys);
                console.log(response);
                console.log(response.last_page_published == null ? 'yes' : 'no');
                var currLastPublished = response.last_page_published;
                //commitstrip memiliki sistem blog, yang terbaru ada di halaman pertama
                //jadi ambil data last published, trus cek dengan last_published yang di save
                //jika LastPublished > saved LastPublished, berarti ada halaman baru
                if (currLastPublished == null) {
                    console.log('masuk sini');
                    var numLastPublished = parseInt(lastPublished);
                    saveLastPublished(lastPublished);
                    if (response.last_seen == null) {
                        saveLastSeen(lastPublished);
                    }
                } else {
                    var numLastPublished = parseInt(lastPublished);
                    var numCurrLastPublished = parseInt(currLastPublished);
                    console.log(numLastPublished + ' , ' + numCurrLastPublished);
                    if (numLastPublished >= numCurrLastPublished) {
                        //ambil selisih, trus tambahkan ke last seen
                        var diff = numLastPublished - numCurrLastPublished;
                        var currLastSeen = parseInt(response.last_seen);
                        currLastSeen += diff;
                        saveLastSeen(currLastSeen + '');
                        //update badge
                        chrome.browserAction.setBadgeText({text: (currLastSeen - 1) + ''});
                        saveLastPublished((numLastPublished) + '');
                        //show notification
                        var notification = webkitNotifications.createNotification(
                                'images/icon-32.png',
                                'New Strip!!',
                                diff + ' New Strip On Commitstrip'
                                );
                        notification.addEventListener('click', function() {
                            notification.cancel();
                            if (diff > 1) {
                                window.open('http://www.commitstrip.com/en/page/' + diff + '/');
                            } else {
                                window.open('http://www.commitstrip.com/en/');
                            }
                        });
                        notification.show();
                    }
                }
                setTimeout(commitStripFeedLastPublished, 1000 * 5);
            });
        },
        error: function(errorResponse, status) {
            setTimeout(commitStripFeedLastPublished, 1000 * 15);
        }
    });
}

//function onMessage(request, sender, callback) {
//    console.log(request);
//    console.log(sender);
//    console.log(callback);
//    if (request.action == 'ping') {
//
//    } else if (request.action == 'fetch_last_seen') {
//        fetch_commit(callback);
//    }
//}

////register onMessage listener
//chrome.runtime.onMessage.addListener(onMessage);
