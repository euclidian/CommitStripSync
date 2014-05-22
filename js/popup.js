/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function() {
    fetch_commit();
});

function fetch_commit() {    
    chrome.extension.sendRequest({'action': 'fetch_last_seen'},
    function(response) {        
        $('#latest_read').html(response.last_seen);        
    });    
}
