var getQueueList = function(){
  $.ajax({
    method: "post",
    async: true,
    dataType: "json",
    url: '/sge/queues',
    success: function(data){
      var html = '<tr>';
      var data = JSON.parse(data);
      for(var key in data){
        html += '<td foo="d">'+key+'</td>';
        for(var i=0; i<data[key].length; i++){
          var obj = new Object(data[key][i]);
          for(var k in obj){
            if(k == 'slots'){
              html += '<td>'+obj[k]+'</td>';
              queue = obj[k];
            }
            if(k == 'shell'){
              html += '<td>'+obj[k]+'</td>';
            }
            if(k == 'user_lists'){
              html += '<td>'+obj[k]+'</td>';
            }

          }
        }
        html += '<td><button class="btn btn-sm btn-primary" queue="'+key+'" id="edit-queue">Edit</button>&nbsp;&nbsp;<button class="btn btn-sm btn-danger" queue="'+key+'" id="delete-queue">Delete</button></td>';
        html += '</tr>';
      }
      html += '<tr><td colspan="4"></td><td><button class="btn btn-success btn-sm" data-toggle="modal" data-target="#add-queue-modal" id="add-queue">Add</button></td></tr>';
      var table = '<div class="table-responsive"><h3>Available Queue\'s</h3><table class="table table-hover"><thead><tr><th>Queue</th><th>Slots</th><th>Shell</th><th>User Lists</th><th></th></tr></thead><tbody id="queues">';
      table += html + '</tbody></table></div>';
      $('#queue-container').append(table);
    }
  });
}

var getQueue = function(queue){
  $('#edit-queue-container').html('');
  $.ajax({
    method: "post",
    async: true,
    dataType: "json",
    data: {queue:queue},
    url: '/sge/queue',
    success: function(data){
      var data = JSON.parse(data);
      var table = '<div class="table-responsive"><h3>Editing: '+queue+'</h3><table class="table table-hover"><thead><tr><th>Attribute</th><th>Value</th><th></th></tr></thead><tbody>';
      for(var i=0; i<data.length; i++){
        $.each( data[i], function( key, value ) {
          if(key == "priority" || key == "shell"){
            table += '<tr><td>'+key+'</td><td>'+value+'</td><td></td></tr>';
          }
          if(key == "hostlist"){
            table += '<tr><td>'+key+'</td><td id="hostlists">'+value+'</td><td><button id="edit-hostlists" class="btn btn-sm btn-primary" queue="'+queue+'" data-toggle="modal" data-target="#edit-hostlists-modal">Edit</button></td></tr>';
          }
          if(key == "slots"){
            table += '<tr><td>'+key+'</td><td id="slots">'+value+'</td><td><button id="edit-slots" class="btn btn-sm btn-primary" queue="'+queue+'" data-toggle="modal" data-target="#edit-slots-modal">Edit</button></td></tr>';
          }
          if(key == "user_lists"){
            table += '<tr><td>'+key+'</td><td id="userlists">'+value+'</td><td><button id="edit-userlists" class="btn btn-sm btn-primary" queue="'+queue+'" data-toggle="modal" data-target="#edit-userlists-modal">Edit</button></td></tr>';
          }
        });
      }
      table += '</tbody></table></div><div class=""><button id="edit-queue-done" class="btn btn-sm btn-primary">Done</button></div>';
      $('#edit-queue-container').append(table);
    }
  });
}

var initializeNewQueueForm = function(){
  $.ajax({
    method: "get",
    async: true,
    dataType: "json",
    url: '/sge/node',
    success: function(data){
      var data = JSON.parse(data);
      $('#newq-slots').append('<option></option>');
      data.forEach(function(slot){
        $('#newq-slots').append('<option value="'+slot+'">'+slot+'</option>');
      });
    }
  });

  $.ajax({
    method: "get",
    async: true,
    dataType: "json",
    url: '/sge/hgrps',
    success: function(data){
      var data = JSON.parse(data);
      $('#newq-hostgroup').append('<option></option>');
      data.forEach(function(hostgroup){
        $('#newq-hostgroup').append('<option value="'+hostgroup+'">'+hostgroup+'</option>');
      });
    }
  });

  $.ajax({
    method: "get",
    async: true,
    dataType: "json",
    url: '/sge/userlists',
    success: function(data){
      var data = JSON.parse(data);
      $('#newq-userlist').append('<option></option>');
      data.forEach(function(userlist){
        $('#newq-userlist').append('<option value="'+userlist+'">'+userlist+'</option>');
      });
    }
  });
}

$(document).ready(function(){

  getQueueList();

  initializeNewQueueForm();

  // ####################################################################################################################
  //            Queue
  // ####################################################################################################################

  $(document).on('click', '#edit-queue', function(){
    $('#queue-container').html('');
    getQueue($(this).attr('queue'));
  });

  $(document).on('click', '#edit-queue-done', function(){
    $('#edit-queue-container').html('');
    getQueueList();
  });

  $(document).on('click', '#edit-slots', function(){

    var queue = $(this).attr('queue');
    var slots = $('#slots').html().split(',');
    var nodes = [];

    $.ajax({
      method: "get",
      async: false,
      dataType: "json",
      url: '/sge/node',
      success: function(data){
        data = JSON.parse(data);
        for(var i=0; i<data.length; i++){
          if($('#slots').html().indexOf(data[i]) === -1){
            nodes.push(data[i]);
          }
        }
      }
    });

    var html = '<div class="table-responsive"><table class="table table-hover"><thead><tr><th>Node</th><th>Cores</th><th></th></tr></thead><tbody>';
    for(var i=1; i<slots.length; i++){
      var slot = slots[i].replace('[', '').replace(']', '').split('=');
      html += '<tr>';
      html += ' <td>'+slot[0]+'</td>';
      html += ' <td><div class="form-group"><input class="form-control" style="max-width: 100px;" type="number" min="0" step="1" id="'+slot[0]+'" value="'+slot[1]+'"></div></td>';
      html += ' <td>';
      html += '   <button class="btn btn-sm btn-primary update-slot" node="'+slot[0]+'" queue="'+queue+'">Save</button>&nbsp;';
      html += '   <button class="btn btn-sm btn-danger remove-slot" node="'+slot[0]+'" queue="'+queue+'">Remove</button>&nbsp;<span style="display:none;" class="slot-response"></span>';
      html += ' </td>';
      html += '</tr>';
    }
    html += '<tr>';
    html += ' <td><div class="form-group"><select id="new_node" class="form-control" style="max-width: 130px;">';
    html += '   <option></option>';
    for(var i=0; i<nodes.length; i++){
      html += ' <option value="'+nodes[i]+'">'+nodes[i]+'</option>';
    }
    html += ' </select></div></td>';
    html += ' <td><div class="form-group"><input class="form-control" style="max-width: 100px;" type="number" min="0" step="1"  placeholder="4" id="new_cores"></div></td>';
    html += '  <td><button id="add-slot" queue="'+queue+'" class="btn btn-sm btn-success">Add</button></td>';
    html += '</tr>';
    html += '</tbody></table></div>';
    var queue = $(this).attr('queue');
    $('#edit-slots-modal .modal-body p').html(html);
  });

  $(document).on('click', '#create-queue', function(){
    var queue = $('#newq-name').val();
    var slot = $('#newq-slots').val();
    var cores = $('#newq-cores').val();
    var hostgroup = $('#newq-hostgroup').val();
    var userlist = $('#newq-userlist').val();
    var slot = '['+slot+'='+cores+']';
    if(!queue || !slot || !cores || !hostgroup || !userlist){
      bootbox.alert('All fields required.');
      return;
    }else{
      $.ajax({
        method: "put",
        async: false,
        dataType: "json",
        data: {queue:queue, hostgroup:hostgroup, userlist:userlist, slot:slot},
        url: '/sge/queue',
        success: function(data){
          if(data.success){
            $('#add-queue-modal').modal('hide');
            $('#newq-name').val('');
            $('#newq-slots').val('');
            $('#newq-cores').val('');
            $('#newq-hostgroup').val('');
            $('#newq-userlist').val('');
            $('#queue-container').html('');
            getQueueList();
          }else{
            bootbox.alert('Failed to create queue: '+JSON.stringify(JSON.stringify(data.error)));
          }
        }
      });
    }
  });

  $(document).on('click', '#delete-queue', function(){
    var queue = $(this).attr('queue');
    bootbox.confirm("Are you sure you want to delete "+queue+"?", function(confirmed) {
      if(confirmed){
        $.ajax({
          method: "delete",
          async: false,
          dataType: "json",
          data: {queue:queue},
          url: '/sge/queue',
          success: function(data){
            if(data.success){
              $('#queue-container').html('');
              getQueueList();
            }else{
              bootbox.alert('Failed to create queue: '+JSON.stringify(JSON.stringify(data.error)));
            }
          }
        });
      }
    });
  });

  // ####################################################################################################################
  //            Slots
  // ####################################################################################################################

  $(document).on('click', '.update-slot', function(){
    var queue = $(this).attr('queue');
    var node = $(this).attr('node');
    var cores = $('#'+node).val();
    var button = $(this);
    $.ajax({
      method: "post",
      async: true,
      dataType: "json",
      data: {node:node, cores:cores, queue:queue},
      url: '/sge/queue/slot',
      success: function(data){
        if(data.success){
          getQueue(queue);
          button.parent().append('<span id="omgwtfbbq" style="color:green;">&#x2713;</span>');
          setTimeout(function(){ $('#omgwtfbbq').remove() }, 3000);
        }else{
          bootbox.alert('Failed to update slot: '+JSON.stringify(JSON.stringify(data.error)));
        }
      }
    });
  });

  $(document).on('click', '#add-slot', function(){
    var queue = $(this).attr('queue');
    var node = $('#new_node').val();
    var cores = $('#new_cores').val();
    var current_row = $(this).parent().parent();
    if(!cores || !node){
      bootbox.alert("Both 'node' and 'cores' are required.");
      return;
    }
    $.ajax({
      method: "put",
      async: true,
      dataType: "json",
      data: {node:node, cores:cores, queue:queue},
      url: '/sge/queue/slot',
      success: function(data){
        if(data.success){
          $("select#new_node option[value='"+node+"']").remove();
          $('#new_cores').val('');
          var new_row = '<tr><td>'+node+'</td> <td><input type="number" min="0" step="1" id="'+node+'" value="'+cores+'"></td> <td><button class="btn btn-sm btn-primary update-slot" node="'+node+'" queue="'+queue+'">Save</button>&nbsp;<button class="btn btn-sm btn-danger remove-slot" node="'+node+'" queue="'+queue+'">Remove</button>&nbsp;<span style="display:none;" class="slot-response"></span></td></tr>';
          current_row.before(new_row);
          getQueue(queue);
        }else{
          bootbox.alert("Failed to add node: "+JSON.stringify(JSON.stringify(data.error)));
        }
      }
    });
  });

  $(document).on('click', '.remove-slot', function(){
    var queue = $(this).attr('queue');
    var node = $(this).attr('node');
    var row = $(this).parent().parent();
    var button = $(this);

    bootbox.confirm("Are you sure you want to delete "+node+" from "+queue+"?", function(confirmed) {
      if(confirmed){
        $.ajax({
          method: "delete",
          async: true,
          dataType: "json",
          data: {node:node, queue:queue},
          url: '/sge/queue/slot',
          success: function(data){
            if(data.success){
              row.remove();
              $('#new_node').append('<option value="'+node+'">'+node+'</option>');
              getQueue(queue);
            }else{
              bootbox.alert("Failed to remove node: "+JSON.stringify(JSON.stringify(data.error)));
            }
          }
        });
      }
    });
  });

  // ####################################################################################################################
  //            Host Lists
  // ####################################################################################################################

  $(document).on('click', '#edit-hostlists', function(){
    $('#hostlist-rows').html('');
    var queue = $(this).attr('queue');
    var available_hosts = '<tr><td><div class="form-group"><select style="max-width: 130px;" class="form-control" id="new-hostgroup"><option></option>';

    $.ajax({
      method: "get",
      async: false,
      dataType: "json",
      url: '/sge/hgrps',
      success: function(data){
        hostgroups = JSON.parse(data);
        for(var i=0; i<hostgroups.length; i++){
          if($('#hostlists').html().indexOf(hostgroups[i]) === -1){
            available_hosts += '<option value="'+hostgroups[i]+'">' + hostgroups[i] + '</option>';
          }else{
            $('#hostlist-rows').append('<tr><td>'+hostgroups[i]+'</td><td><button class="btn btn-danger btn-sm remove-hostgroup" hostgroup="'+hostgroups[i]+'" queue="'+queue+'">Remove</button></td></tr>');
          }
        }

        available_hosts += '</select></div></td><td><button class="btn btn-success btn-sm" id="add-hostgroup" queue="'+queue+'">Add</button></td></tr>';
        $('#hostlist-rows').append(available_hosts);

      }
    });
  });

  $(document).on('click', '#add-hostgroup', function(){
    var queue = $(this).attr('queue');
    var hostgroup = $('#new-hostgroup').val();
    var row = $(this).parent().parent();
    if(hostgroup){
      $.ajax({
        method: "put",
        async: true,
        dataType: "json",
        data: {hostgroup:hostgroup,queue:queue},
        url: '/sge/queue/hostgroup',
        success: function(data){
          if(data.success){
            $("select#new-hostgroup option[value='"+hostgroup+"']").remove();
            row.before('<tr><td>'+hostgroup+'</td><td><button class="btn btn-danger btn-sm remove-hostgroup" hostgroup="'+hostgroup+'" queue="'+queue+'">Remove</button></td></tr>');
            getQueue(queue);
          }else{
            bootbox.alert("Failed to add hostgroup: "+JSON.stringify(JSON.stringify(data.error)));
          }
        }
      });
    }
  });

  $(document).on('click', '.remove-hostgroup', function(){
    $('select#new-hostgroup').html('');
    var queue = $(this).attr('queue');
    var hostgroup = $(this).attr('hostgroup');
    var row = $(this).parent().parent();
    bootbox.confirm("Are you sure you want to remove <b>"+hostgroup+"</b> from <b>"+queue+"</b>?", function(confirmed) {
      if(confirmed){
        $.ajax({
          method: "delete",
          async: true,
          dataType: "json",
          data: {hostgroup:hostgroup,queue:queue},
          url: '/sge/queue/hostgroup',
          success: function(data){
            if(data.success){
              $('select#new-hostgroup').append('<option value="'+hostgroup+'">'+hostgroup+'</option>');
              row.remove();
              getQueue(queue);
            }else{
              bootbox.alert("Failed to remove hostgroup: "+JSON.stringify(JSON.stringify(data.error)));
            }
          }
        });
      }
    });
  });

  // ####################################################################################################################
  //            User Lists
  // ####################################################################################################################


  $(document).on('click', '#edit-userlists', function(){
    $('#userlist-rows').html('');
    var queue = $(this).attr('queue');
    var available_userlists = '<tr><td><div class="form-group"><select class="form-control" id="new-userlist" style="max-width: 130px;"><option></option>';

    $.ajax({
      method: "post",
      async: false,
      dataType: "json",
      url: '/sge/sgelists',
      success: function(data){
        $.each(data, function(k, v) {
          $.each(v, function(list, users){
            if($('#userlists').html().indexOf(list) === -1){
              available_userlists += '<option value="'+list+'">' + list + '</option>';
            }else{
              $('#userlist-rows').append('<tr><td>'+list+'</td><td><button class="btn btn-danger btn-sm remove-userlist" userlist="'+list+'" queue="'+queue+'">Remove</button></td></tr>');
            }
          });
        });
        available_userlists += '</select></div></td><td><button class="btn btn-success btn-sm" id="add-userlist" queue="'+queue+'">Add</button></td></tr>';
        $('#userlist-rows').append(available_userlists);

      }
    });
  });

  $(document).on('click', '#add-userlist', function(){
    var queue = $(this).attr('queue');
    var userlist = $('#new-userlist').val();
    var row = $(this).parent().parent();
    if(userlist){
      $.ajax({
        method: "put",
        async: true,
        dataType: "json",
        data: {userlist:userlist,queue:queue},
        url: '/sge/queue/userlist',
        success: function(data){
          if(data.success){
            $("select#new-userlist option[value='"+userlist+"']").remove();
            row.before('<tr><td>'+userlist+'</td><td><button class="btn btn-danger btn-sm remove-userlist" userlist="'+userlist+'" queue="'+queue+'">Remove</button></td></tr>');
            getQueue(queue);
          }else{
            bootbox.alert("Failed to add userlist: "+JSON.stringify(JSON.stringify(data.error)));
          }
        }
      });
    }
  });

  $(document).on('click', '.remove-userlist', function(){
    var queue = $(this).attr('queue');
    var userlist = $(this).attr('userlist');
    var row = $(this).parent().parent();
    bootbox.confirm("Are you sure you want to remove <b>"+userlist+"</b> from <b>"+queue+"</b>?", function(confirmed) {
      if(confirmed){
        $.ajax({
          method: "delete",
          async: true,
          dataType: "json",
          data: {userlist:userlist,queue:queue},
          url: '/sge/queue/userlist',
          success: function(data){
            if(data.success){
              $('select#new-userlist').append('<option value="'+userlist+'">'+userlist+'</option>');
              row.remove();
              getQueue(queue);
            }else{
              bootbox.alert("Failed to remove userlist: "+JSON.stringify(JSON.stringify(data.error)));
            }
          }
        });
      }
    });
  });

});
