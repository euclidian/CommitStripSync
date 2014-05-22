/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//chrome.runtime.sendMessage({action: 'ping'}, function(response) { 
//    
//});
chrome.extension.sendRequest({'action': 'ping'},
    function(response) {                
    });    