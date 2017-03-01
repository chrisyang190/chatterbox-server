// YOUR CODE HERE:
var app = {
  message: {
    username: window.username,
    text: null,
    roomname: null
  },
  friends: [],
  rooms: [],
  server: 'http://127.0.0.1:3000/classes/messages'
};

$(document).ready(function() {
  app.init = function() {

    $('body').on('click', '.username', function(e) {
      e.preventDefault();
      console.log('username');
      app.handleUsernameClick(e);
    });
    $('form').on('submit', function(e) {
      e.preventDefault();
      app.handleSubmit();
      $('.textbox').val('');
    });
    $('.newroom').on('click', function() {
      var roomName = prompt('What is the new name of your room?');
      app.rooms.push(roomName);
      app.renderRoom(roomName);
      $('#roomSelect').val(roomName);
    });

  };
  app.init();
  app.fetch();
  setInterval(app.fetch.bind(app), 2000);
});

app.send = function(message) {
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: 'http://127.0.0.1:3000/classes/messages',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });

};
app.handleUsernameClick = function(e) { 
  var newFriend = $(e.target).text();
  app.friends.push(newFriend);
};

app.handleSubmit = function() {
  //configure the message
  app.message.text = $('.textbox').val();
  app.message.username = window.location.search.slice(10);
  app.message.roomname = $('#roomSelect option:selected').text();
  app.send(app.message);

};
var newMessages = [];
app.fetch = function() {
  $.ajax({
  // This is the url you should use to communicate with the parse API server.
    url: 'http://127.0.0.1:3000/classes/messages',
    type: 'GET',
    // data: {'order': '-createdAt'},
    contentType: 'application/json',
    success: function (data) {
      newMessages = [];
      
      // REMEMBER TO PARSE THIS DATA, SINCE IT WAS STRINGIFIED FROM SERVER TO CLIENT!
      (JSON.parse(data)).results.forEach(function(value) {
        newMessages.push(value);
      });
      $('#chats').children('.message').remove();
      newMessages.forEach(function(value) {
        if (value.roomname === $('#roomSelect option:selected').text()) {
          app.renderMessage(value);
        }
      });

      (JSON.parse(data)).results.forEach(function(value) {
        var roomname = _escape(value.roomname);
        if (app.rooms.indexOf(value.roomname) === -1) {
          app.rooms.push(value.roomname);
          app.renderRoom(value.roomname);
        }
      });
      
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to receive message', data);
    }
  });
};

app.clearMessages = function() {
  $('#chats').empty();

};

var htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
};
var htmlEscaper = /[&<>"'\/]/g;

var _escape = function(string) {
  return ('' + string).replace(htmlEscaper, function(match) {
    return htmlEscapes[match];
  });
};

app.renderMessage = function(message) {
  var username = _escape(message.username);
  var text = _escape(message.text);

  if (app.friends.indexOf(message.username) > -1) {
    $('#chats').append(`<section class="message"><h3><a class="username" href="#">${username}</a></h3> <div><b>${text}</b></div></section>`);
  } else {
    $('#chats').append(`<section class="message"><h3><a href="#" class="username">${username}</a></h3> <div>${text}</div></section>`);
  }
};

app.renderRoom = function(roomname) {
  $('#roomSelect').prepend(`<option>${roomname}</option>`);
};

