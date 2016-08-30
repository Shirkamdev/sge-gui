var getAvailableNodes = function(){
  $.ajax({
    method: "get",
    async: false,
    dataType: "json",
    url: '/sge/node',
    success: function(data){
      var nodes = JSON.parse(data);
      return nodes;
    }
  });
}

var initializeHostgroups = function(){
  $.ajax({
    method: "get",
    async: true,
    dataType: "json",
    url: '/sge/hgrps',
    success: function(data){
      var data = JSON.parse(data);
      for(var i=0; i<data.length; i++){
        var hostgroup = data[i];
        $.ajax({
          method: "get",
          async: false,
          dataType: "json",
          data: {hostgroup:hostgroup},
          url: '/sge/hgrp',
          success: function(data){
            var nodes = JSON.parse(data);
            if(nodes[0]=='NONE'){nodes = 'This hostgroup has no nodes.';}
            $('#hostgroup-list').append('<tr><td>'+hostgroup+'</td><td>'+nodes+'</td><td><button class="btn btn-primary btn-sm edit-hostgroup" hostgroup="'+hostgroup+'">Edit</button>&nbsp;&nbsp;<button class="btn btn-danger btn-sm remove-hostgroup" hostgroup="'+hostgroup+'">Delete</button></td></tr>');
          }
        });
      }
      $('#hostgroup-list').append('<tr><td colspan="2"><div class="form-group"><input class="form-control" id="new-hostgroup" type="text" placeholder="@name" style="max-width: 130px;" required></div></td><td><button class="btn btn-success btn-sm" id="add-hostgroup">Add</button></td></tr>');
    }
  });
}

var initializeNodeList = function(hostgroup){
  $.ajax({
    method: "get",
    async: false,
    dataType: "json",
    data: {hostgroup:hostgroup},
    url: '/sge/hgrp',
    success: function(data){
      $('#edit-hostgroup #editing').text(hostgroup);
      var nodes = JSON.parse(data);
      for(var i=0; i<nodes.length; i++){
        var node = nodes[i];
        if(node != 'NONE'){
          $('#node-list').append('<tr><td>'+node+'</td><td>&nbsp;&nbsp;<button class="btn btn-danger btn-sm remove-node" hostgroup="'+hostgroup+'" node="'+node+'">Remove</button></td></tr>');
        }
      }
      $.ajax({
        method: "get",
        async: false,
        dataType: "json",
        url: '/sge/node',
        success: function(data){
          var n = JSON.parse(data);
          html = '<tr><td><div class="form-group"><select class="form-control" id="node" style="max-width: 130px;">';
          for(var i=0; i<n.length; i++){
            html += '<option value="'+n[i]+'">'+n[i]+'</option>';
          }
          html += '</select></div></td><td>&nbsp;&nbsp;<button class="btn btn-success btn-sm" hostgroup="'+hostgroup+'" id="add-node">Add</button></td></tr>';
          $('#node-list').append(html);
        }
      });
    }
  });
}

$(document).ready(function(){

  initializeHostgroups();

  $(document).on('click', '#add-hostgroup', function(){
    var hostgroup = $('#new-hostgroup').val();
    var row = $(this).parent().parent();
    if(/^(@[a-z]+)$/.test(hostgroup)){
      $.ajax({
        method: "put",
        async: true,
        dataType: "json",
        data: {hostgroup:hostgroup},
        url: '/sge/hgrps',
        success: function(data){
          if(data.success){
            $('#new-hostgroup').val('');
            row.before('<tr><td>'+hostgroup+'</td><td>NONE</td><td><button class="btn btn-primary btn-sm edit-hostgroup" hostgroup="'+hostgroup+'">Edit</button>&nbsp;&nbsp;<button class="btn btn-danger btn-sm remove-hostgroup" hostgroup="'+hostgroup+'">Delete</button></td></tr>');
          }else{
            bootbox.alert('Failed to add '+hostgroup+': '+JSON.stringify(JSON.stringify(data.error)));
          }
        }
      });
    }else{
      bootbox.alert("Hostgroup name with format @name required.");
    }

  });

  $(document).on('click', '.remove-hostgroup', function(){
    var row = $(this).parent().parent();
    var hostgroup = $(this).attr('hostgroup');

    bootbox.confirm("Are you sure you want to delete "+hostgroup+"?", function(confirmed) {
      if(confirmed){
        $.ajax({
          method: "delete",
          async: true,
          dataType: "json",
          data: {hostgroup:hostgroup},
          url: '/sge/hgrps',
          success: function(data){
            if(data.success){
              row.remove();
            }else{
              bootbox.alert('Failed to remove '+hostgroup+': '+JSON.stringify(JSON.stringify(data.error)));
            }
          }
        });
      }
    });
  });

  $(document).on('click', '.edit-hostgroup', function(){
    var hostgroup = $(this).attr('hostgroup');
    $('#hostgroup-container').hide();
    $('#hostgroup-list').html('');
    $('#edit-hostgroup').show();
    initializeNodeList(hostgroup);
  });

  $(document).on('click', '#done-editing', function(){
    initializeHostgroups();
    $('#hostgroup-container').show();
    $('#edit-hostgroup').hide();
    $('#node-list').html('');
  });

  $(document).on('click', '#add-node', function(){
    var node = $('#node').val();
    var hostgroup = $(this).attr('hostgroup');
    var row = $(this).parent().parent();
    $.ajax({
      method: "put",
      async: true,
      dataType: "json",
      data: {hostgroup:hostgroup,node:node},
      url: '/sge/hgrp',
      success: function(data){
        if(data.success){
          row.before('<tr><td>'+node+'</td><td>&nbsp;&nbsp;<button class="btn btn-danger btn-sm remove-node" hostgroup="'+hostgroup+'" node="'+node+'">Remove</button></td></tr>');
        }else{
          bootbox.alert('Failed to remove '+hostgroup+': '+JSON.stringify(JSON.stringify(data.error)));
        }
      }
    });
  });

  $(document).on('click', '.remove-node', function(){
    var node = $(this).attr('node');
    var hostgroup = $(this).attr('hostgroup');
    var row = $(this).parent().parent();
    bootbox.confirm("Are you sure you want to delete "+node+" from "+hostgroup+"?", function(confirmed) {
      if(confirmed){
        $.ajax({
          method: "delete",
          async: true,
          dataType: "json",
          data: {hostgroup:hostgroup,node:node},
          url: '/sge/hgrp',
          success: function(data){
            if(data.success){
              row.remove();
            }else{
              bootbox.alert('Failed to remove '+hostgroup+': '+JSON.stringify(JSON.stringify(data.error)));
            }
          }
        });
      }
    });
  });

});
