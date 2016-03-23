$(document).ready(function(){

  $.ajax({
    method: "post",
    async: true,
    dataType: "json",
    url: 'https://shrek.rx.umaryland.edu/sge/fetchuserconfig',
    success: function(data){
      //console.log(JSON.stringify(data));
      $.each(data, function(k, v) {
        $.each(v, function(list, users){
          $('#users').append('<tr><td>'+list+'</td><td>'+users+'</td></tr>');
        });
      });
    }
  });

  $.ajax({
    method: "post",
    async: true,
    dataType: "json",
    url: 'https://shrek.rx.umaryland.edu/sge/fetchqueueconfig',
    success: function(data){
      var html = '<tr>';
      var data = JSON.parse(data);
      for(var key in data){
        html += '<td>'+key+'</td>';
        for(var i=0; i<data[key].length; i++){
          var obj = new Object(data[key][i]);
          for(var k in obj){
            //console.log(k +":"+ obj[k]);
            if(k == 'slots'){
              html += '<td>'+obj[k]+'</td>';
            }
            if(k == 'shell'){
              html += '<td>'+obj[k]+'</td>';
            }
            if(k == 'user_lists'){
              html += '<td>'+obj[k]+'</td>';
            }
          }
        }
        html += '</tr>';
      }
      $('#queues').append(html);
    }
  });

});
