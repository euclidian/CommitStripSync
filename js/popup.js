/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function() {
    fetchLastSeen();
    fetchLastPublished();
    $('#markAsSeenBtn').click(function(){
        markAsSeen();        
    });
    $('#continueBtn').click(function(){
        var href = $('#continueBtn').attr('href');
        if(href === '#'){
            return;
        }else{
            chrome.tabs.create({url : href});
        }
    });
    $('#chapters').change(function(){        
        var selected = $('#chapters option:selected').first();
        var url = selected.val();
        window.open(url);
    });
});

function fetchLastSeen() {    
    chrome.extension.sendRequest({'action': 'fetch_last_seen'},
    function(response) {        
        $('#latest_read').html(response.last_seen);        
        var lastSeen = parseInt(response.last_seen);                
        if(lastSeen > 1){
            nextSeen = lastSeen - 1;            
            $('#continueBtn').attr('href','http://www.commitstrip.com/en/page/'+nextSeen+"/");
        }else{
            nextSeen = 0;
            $('#continueBtn').attr('href','http://www.commitstrip.com/en/');
        }                
    });    
}

function fetchLastPublished(){
    chrome.extension.sendRequest({'action': 'fetch_last_published'},
    function(response) {                
        console.log(response);
        if(response.last_page_published != null && response.last_seen != null){
            var lastPublished = parseInt(response.last_page_published);
            var lastSeen = parseInt(response.last_seen);
            console.log(lastPublished);
            for(var i=1;i<=lastPublished;i++){
                var key;
                if(i==1){
                    key = "http://www.commitstrip.com/en/";
                }else{
                    key = "http://www.commitstrip.com/en/page/"+i+"/";
                }
                $('#chapters')
                        .append($("<option></option>")
                        .attr("value",key)
                        .text("Chapter "+i));                   
                if(i == lastSeen){
                    $('#chapters').val(key);
                }
            }            
        }
    });    
}

function markAsSeen(){
    chrome.extension.sendRequest({action : 'mark_as_seen'},
        function(response){                
        });
    $('#latest_read').html(1); 
}
