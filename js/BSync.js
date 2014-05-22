/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function saveLastSeen(page_id) {
    chrome.storage.sync.set({'last_seen': page_id}, function() {
        console.log('Message seen');
    });
}

function getLastSeen(callback) {
    chrome.storage.sync.get('last_seen', function(result) {
        callback(result.last_seen);
    });
}

function fetch_commit(callback) {
    chrome.storage.sync.get('last_seen', function(result) {        
        var lastSeenPage = result.last_seen;
        if (lastSeenPage == null) {
            saveLastSeen(1);
            callback({last_seen: 1});
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
        fetch_commit(callback);
    } else if (request.action === 'ping') {
        var currUrl = sender.url;        
        chrome.storage.sync.get('last_seen', function(result) {
            var lastSeenPage = result.last_seen;
            if (currUrl.indexOf("http://www.commitstrip.com/en") > -1) {
                var strings = currUrl.replace("http://", '').split('/');
                if (strings.length < 3) {
                    //berarti di halaman pertama
                    if (lastSeenPage == null || lastSeenPage == 0) {
                        saveLastSeen(1)
                    }
                } else {
                    var pageId = strings[3];
                    if (lastSeenPage == null || lastSeenPage == 0) {
                        saveLastSeen(pageId);
                    } else {
                        if (lastSeenPage < pageId) {
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
