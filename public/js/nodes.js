$(document).ready(function(){
  $.ajax({
    method: "get",
    async: false,
    dataType: "json",
    url: '/sge/node',
    success: function(data){
      var data = JSON.parse(data);
      for(var i=0; i<data.length; i++){
        if(data[i] != 'shrek'){
          var html = '<tr>';
          html += '<td>'+data[i]+'</td>';
          html += '<td><button node="'+data[i]+'" class="delete-node btn btn-sm btn-danger">Delete</button></td>';
          html += '</tr>';
          $('#node-list').append(html);
        }
      }
      var html = '<tr>';
      html += ' <td>';
      html += '   <div class="form-group">';
      html += '     <input class="form-control" type="text" id="new_node_name" placeholder="Node Name" style="max-width: 130px; display: inline;">';
      html += '   </div>';
      html += '   <span style="color:red">Make sure you add this node to the hosts file.</span>';
      html += ' </td>';
      html += ' <td>';
      html += '   <button class="add-node btn btn-sm btn-primary">Add</button>';
      html += ' </td>';
      html += '</tr>';
      $('#node-list').append(html);
    }
  });

  $(document).on('click', '.delete-node', function(){
    var node = $(this).attr('node');
    var row = $(this).parent().parent();
    bootbox.confirm("Are you sure you want to delete "+node+"?", function(confirmed) {
      if(confirmed){
        $.ajax({
          method: "delete",
          async: false,
          dataType: "json",
          data: {node:node},
          url: '/sge/node',
          success: function(data){
            if(data.success){
              row.remove();
            }else{
              bootbox.alert("Failed to delete node. Error: "+JSON.stringify(data.error));
            }
          }
        });
      }
    });
  });

  $(document).on('click', '.add-node', function(){
    var node = $('#new_node_name').val();
    var row = $(this).parent().parent();
    if(!node){
      bootbox.alert("Node name required.");
      return;
    }else{
      $.ajax({
        method: "put",
        async: false,
        dataType: "json",
        data: {node:node},
        url: '/sge/node',
        success: function(data){
          if(data.success){
            $('#new_node_name').val('');
            row.before('<tr><td>'+node+'</td><td><button node="'+node+'" class="delete-node btn btn-sm btn-danger">Delete</button></td></tr>');
          }else{
            bootbox.alert("Failed to add node. Error: "+JSON.stringify(data.error));
          }
        }
      });
    }
  });
});
