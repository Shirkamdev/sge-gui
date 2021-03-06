var getUsersetLists = function(){
  $.ajax({
    method: "post",
    async: true,
    dataType: "json",
    url: '/sge/sgelists',
    success: function(data){
      var html = '<div class="table-responsive"><table class="table table-hover"><thead><tr><th>User Lists</th><th>Users</th><th></th></tr></thead><tbody>';
      $.each(data, function(k, v) {
        $.each(v, function(list, users){
          html += '<tr><td>'+list+'</td><td>'+users+'</td><td><button type="button" class="btn btn-sm btn-primary" list="'+list+'" id="editUserset">Edit</button>&nbsp;&nbsp;<button type="button" class="btn btn-sm btn-danger" list="'+list+'" id="delete-userlist">Delete</button></td></tr>';
        });
      });
      html += '<tr><td><input id="new-userlist" type="text" placeholder="list name"><select id="new-userlist-user"><option></option></select></td><td>When creating a user list, at least one user must be added.</td><td><button class="btn btn-sm btn-success" id="add-userlist">Add</button></td></tr>';
      html += '</tbody></table></div>';
      $('#usersets-container').append(html);
    }
  });
  initializeUserList();
}

var deleteUser = function(list, user, row){
  bootbox.confirm("Are you sure you want to delete "+user+" from "+list+"?", function(confirmed) {
    if(confirmed){
      $.ajax({
        method: "delete",
        async: true,
        dataType: "json",
        url: '/sge/sgeuser',
        data: {list:list, user:user},
        success: function(data){
          if(data.success){
            row.remove();
          }else{
            bootbox.alert('Error: '+JSON.stringify(data.error));
          }
        }
      });
    }
  });
}

var getUsersInList = function(list){
  $.ajax({
    method: "post",
    async: true,
    dataType: "json",
    url: '/sge/sgeusers',
    data: {list:list},
    success: function(data){
      var users = JSON.parse(data);
      $('#usersets-container').html('');
      $('#userset-container').html('');
      var table = '<div class="table-responsive"><table class="table table-hover table-condensed"><thead><tr><th>Editing: '+list+'</th><th></th></tr></thead><tbody>';
      for(var i=0; i<users.length; i++){
        if(users[i] != 'NONE'){
          table += '<tr><td>'+users[i]+'</td><td><button id="deleteUser" class="btn btn-sm btn-danger" list="'+list+'" user="'+users[i]+'">Delete</button></td></tr>';
        }
      }
      table += '<tr><td><div class="form-group"><input class="form-control" type="text" name="newUser" /></div></td><td><button id="addUser" class="btn btn-sm btn-success" list="'+list+'">Add</button></td></tr>';
      table += '</tbody></table></div><div class=""><button id="edit-userset-done" class="btn btn-sm btn-primary">Done</button></div>';
      $('#userset-container').append(table);
    }
  });
}

var addUser = function(list, user, row){
  $.ajax({
    method: "put",
    async: true,
    dataType: "json",
    url: '/sge/sgeuser',
    data: {list:list, user:user},
    success: function(data){
      if(data.success){
        row.before('<tr><td>'+user+'</td><td><button id="deleteUser" class="btn btn-sm btn-danger" list="'+list+'" user="'+user+'">-</button></td></tr>');
        $('input[name="newUser"]').val('');
      }else{
        bootbox.alert('Error: '+JSON.stringify(data.error));
      }
    }
  });
}

var initializeUserList = function(){
  $.ajax({
    method: "get",
    async: true,
    dataType: "json",
    url: '/sge/sgeusers',
    success: function(data){
      var data = JSON.parse(data);
      data.forEach(function(user){
        $('#new-userlist-user').append('<option value="'+user+'">'+user+'</option>');
      });
    }
  });
}

$(document).ready(function(){

  getUsersetLists();

  $(document).on('click', '#editUserset', function(){
    getUsersInList($(this).attr('list'));
  });

  $(document).on('click', '#deleteUser', function(){
    deleteUser($(this).attr('list'), $(this).attr('user'), $(this).parent().parent());
  });

  $(document).on('click', '#addUser', function(){
    addUser($(this).attr('list'), $('input[name="newUser"]').val(), $(this).parent().parent());
  });

  $(document).on('click', '#edit-userset-done', function(){
    $('#usersets-container').html('');
    $('#userset-container').html('');
    getUsersetLists();
  });

  $(document).on('click', '#add-userlist', function(){
    var list = $('#new-userlist').val();
    var user = $('#new-userlist-user').val();
    if(/^([a-z]+)$/.test(list) && user){
      $.ajax({
        method: "put",
        async: true,
        dataType: "json",
        url: '/sge/userlists',
        data: {list:list,user:user},
        success: function(data){
          if(data.success){
            $('#usersets-container').html('');
            $('#new-userlist').val('');
            $('#new-userlist-user').val('');
            getUsersetLists();
          }else{
            bootbox.alert('Error: '+JSON.stringify(data.error));
          }
        }
      });
    }else{
      bootbox.alert('List name is required and must be lowercase a-z only.');
      return;
    }
  });

  $(document).on('click', '#delete-userlist', function(){
    var list = $(this).attr('list');
    bootbox.confirm("Are you sure you want to delete "+list+"?", function(confirmed) {
      if(confirmed){
        $.ajax({
          method: "delete",
          async: true,
          dataType: "json",
          url: '/sge/userlists',
          data: {list:list},
          success: function(data){
            if(data.success){
              $('#usersets-container').html('');
              getUsersetLists();
            }else{
              bootbox.alert('Error: '+JSON.stringify(data.error));
            }
          }
        });
      }
    });
  });

});
