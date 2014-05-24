/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var lastPublishedKey = 'last_page_published';
var lastSeenKey = 'last_seen';
var debug = false;

function checkWriteQuotaError() {    
    if (chrome.extension.lastError != null) {                
        if (chrome.extension.lastError.message.indexOf('MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE') > -1) {
            console.log('error quota');
            return true;
        }
    }

    return false;
}
function saveLastSeen(page_id) {
    if (!checkWriteQuotaError()) {
        chrome.storage.sync.set({last_seen: page_id}, function() {            
        });
    }
}

function saveLastPublished(page_id) {
    if (!checkWriteQuotaError()) {
        chrome.storage.sync.set({last_page_published: page_id}, function() {            
        });
    }

}

function getLastSeen(callback) {
    chrome.storage.sync.get(lastSeenKey, function(result) {
        callback(result.last_seen);
    });
}

function fetchLastSeen(callback) {
    chrome.storage.sync.get([lastSeenKey, lastPublishedKey], function(result) {        
        var lastSeenPage = result.last_seen;
        if (lastSeenPage == null) {
        } else {
            callback(result);
        }
    });
}

function fetchLastPublished(callback) {
    chrome.storage.sync.get([lastSeenKey,lastPublishedKey], function(result) {
        var lastPublished = result.last_page_published;
        if (lastPublished == null) {
            var lastPublished = 1;
            saveLastPublished(lastPublished);
            callback({last_page_published: lastPublished, last_seen:lastPublished});
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
                if (strings.length <= 3) {
                    //berarti di halaman pertama
                    saveLastSeen(1);
                    setBadgeNumber(null);
                } else {
                    var pageId = strings[3];
                    if (lastSeenPage == null || lastSeenPage == 0) {
                        saveLastSeen(pageId);
                        setBadgeNumber(pageId);
                    } else {
                        if (lastSeenPage > pageId) {
                            saveLastSeen(pageId);
                            setBadgeNumber(pageId);
                        }
                    }
                }
            }
        });
    } else if(request.action === 'mark_as_seen'){
        saveLastSeen(1);
        setBadgeNumber(0);
    }
}

function setBadgeNumber(number) {
    if (number == null || number == 0 | number == 1) {
        chrome.browserAction.setBadgeText({text: ''});    
    } else {
        var currLastSeen = parseInt(number);
        chrome.browserAction.setBadgeText({text: (currLastSeen - 1) + ''});
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
            chrome.storage.sync.get([lastSeenKey, lastPublishedKey], function(response) {
                var currLastPublished = response.last_page_published;
                //commitstrip memiliki sistem blog, yang terbaru ada di halaman pertama
                //jadi ambil data last published, trus cek dengan last_published yang di save
                //jika LastPublished > saved LastPublished, berarti ada halaman baru
                if (currLastPublished == null) {                    
                    var numLastPublished = parseInt(lastPublished);
                    saveLastPublished((numLastPublished)+'');
                    setBadgeNumber(numLastPublished + 1);
                    if (response.last_seen == null) {
                        saveLastSeen((numLastPublished+1)+'');
                    }
                } else {
                    var numLastPublished = parseInt(lastPublished);
                    var numCurrLastPublished = parseInt(currLastPublished);                    
                    if (numLastPublished > numCurrLastPublished) {
                        //ambil selisih, trus tambahkan ke last seen
                        var diff = numLastPublished - numCurrLastPublished;
                        var currLastSeen = parseInt(response.last_seen);
                        currLastSeen += diff;
                        saveLastSeen(currLastSeen + '');
                        //update badge
                        setBadgeNumber(currLastSeen - 1);
                        saveLastPublished((numLastPublished - 1) + '');
                        //show notification
                        var opt = {
                            type: "basic",
                            title: "New Strip!!",
                            message: diff + ' New Strip On Commitstrip',
                            iconUrl: "images/icon-32.png"
                        };
                        chrome.notifications.create("commitstrtip-" + diff, opt, function(notifId) {

                        });
                        chrome.notifications.onClicked.addListener(function(notifId) {
                            chrome.notifications.clear(notifId, function(response) {

                            });
                            var pageDiff = parseInt(notifId.split('-')[1]);
                            if (pageDiff > 1) {
                                window.open('http://www.commitstrip.com/en/page/' + pageDiff + '/');
                            } else {
                                window.open('http://www.commitstrip.com/en/');
                            }

                        });
                    }
                }
            });
        },
        error: function(errorResponse, status) {
        }
    });
    setTimeout(commitStripFeedLastPublished, 1000 * 60 * 1);
}

function log(data){
    if(debug){
        console.log(data);
    }
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
