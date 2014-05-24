/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//chrome.runtime.sendMessage({action: 'ping'}, function(response) { 
//    
//});
(function($){
    //register keydown left arrow and right arrow
    $("body").keydown(function(e){
        if(e.keyCode == 37) { // left    	
        var prevLink = $('.previouspostslink').first();
        if(prevLink.length > 0){
            window.location.href=prevLink.attr('href');
        }else{
            alert("There is no more previous page");
        }
    }
    else if(e.keyCode == 39) { // right    
        var nextLink = $('.nextpostslink').first();
        if(nextLink.length > 0){
            window.location.href=nextLink.attr('href');
        }else{
            alert("There is no more next page");
        }
    }
  });
 })(jQuery);


chrome.extension.sendRequest({'action': 'ping'},
    function(response) {                
    });    