// $(document).ready(function(){
//
//   $.ajax({
//     method: "post",
//     async: true,
//     dataType: "json",
//     url: '/sge/queues',
//     success: function(data){
//       var usersets = [];
//       var html = '<tr>';
//       var data = JSON.parse(data);
//       for(var key in data){
//         html += '<td>'+key+'</td>';
//         for(var i=0; i<data[key].length; i++){
//           var obj = new Object(data[key][i]);
//           for(var k in obj){
//             //console.log(k +":"+ obj[k]);
//             if(k == 'slots'){
//               html += '<td>'+obj[k]+'</td>';
//             }
//             if(k == 'shell'){
//               html += '<td>'+obj[k]+'</td>';
//             }
//             if(k == 'user_lists'){
//               if (usersets.indexOf(obj[k]) == -1) {
//                   usersets.push(obj[k]);
//               }
//               html += '<td>'+obj[k]+'</td>';
//             }
//           }
//         }
//         html += '</tr>';
//       }
//       for(var i=0; i<usersets.length; i++){
//         var list = usersets[i];
//         $.ajax({
//           method: "post",
//           async: true,
//           dataType: "json",
//           data: {list:list},
//           url: 'localhost/sge/sgeusers',
//           success: function(data){
//             $('#users').append("<tr><td>"+list+"</td><td>"+data+"</td></tr>");
//           }
//         });
//       }
//       $('#queues').append(html);
//     }
//   });
//
// });
