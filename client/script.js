var $ = require('jquery');
var todoTemplate = require('../views/partials/todo.hbs');

var KEY_ENTER = 13;
var KEY_ESCAPE = 27;

$(function() {
  var app = (function() {
    
    var $todoTextField = $('#add-todo-text'),
        $todoButton = $(':button'),
        $todoList = $('ul'),
        $filter = $('.filter'),
        $clear = $('.clear'),
        $count = $('.count');
    
    var init = function() {
      registerEvents();
    };
    var registerEvents = function() {
      $todoButton.on('click', addTodo);
      $todoTextField.on('keypress', addTodoIfKeypressEnter);
      $todoList.on('change', 'li input:checkbox', updateTodoStatus);
      $todoList.on('keydown', 'li span', updateTodoText);
      $todoList.on('click', 'li a', deleteTodo);
      $filter.on('click', '.show-all', showAll);
      $filter.on('click', '.show-not-done', showNotDone);
      $filter.on('click', '.show-done', showDone);
      $clear.on('click', deleteTodosDone);
      
    };
    
    // Add Todos
    var getTodoText = function() {
      return $todoTextField.val();
    };
    var clearTodoText = function() {
      $todoTextField.val('');
    }
    var appendTodoLi = function(todo) {
      var todoHtml = todoTemplate(todo);
      $todoList.append(todoHtml);
    }
    var addTodo = function() {
      addTodoAjax();
    }
    var addTodoIfKeypressEnter = function(e) {
     var key = e.keyCode;
     if( key == KEY_ENTER) {
       addTodoAjax();
       e.preventDefault();
     }
    };
    var addTodoAjax = function() {
      var text = getTodoText();
      $.ajax({
        url: '/api/todos',
        type: 'POST',
        data: {
          text: text
        },
        dataType: 'json',
        success: function(data) {
          var todo = data.todo;
          appendTodoLi(todo);
          clearTodoText();
          updateTodoCount();
        }
      });
    };
    
    //Update Todos
    var getTodoLi = function(_this) {
      return $(_this).parent('li');
    }
    var getTodoData = function(_this) {
      var $li = getTodoLi(_this),
          id = $li.attr('id'),
          text = $li.children('span').text(),
          checked = $li.children('input').is(':checked');
      return {
        id: id,
        text: text,
        checked: checked
      };
    }
    var updateTodoLiAsChecked = function(_this) {
      getTodoLi(_this).toggleClass('checked');
    }
    var updateTodoStatus = function() {
      var todo = getTodoData(this);
      updateTodoAjax(todo.id, {done: todo.checked}, function(data) {
        updateTodoLiAsChecked(this);
      }.bind(this));
    }
    var updateTodoText = function(e) {
      var todo = getTodoData(this),
          $this = $(this),
          key = e.keyCode,
          target = e.target;
      $this.addClass('editing');
      if(key === KEY_ESCAPE) {
       $this.removeClass('editing');
       document.execCommand('undo');
       target.blur();
     } else if(key === KEY_ENTER) {
       updateTodoAjax(todo.id, {text: todo.text}, function(data) {
         $this.removeClass('editing');
         target.blur();
       });
       e.preventDefault();
      }
    }
    
    var updateTodoAjax = function(id, data, cb) {
      $.ajax({
        url: '/api/todos/'+id,
        type: 'PUT',
        data: data,
        dataType: 'json',
        success: function(data) {
          cb(data);
        }
      });
    };
    
    //Delete Todos
    var deleteTodoLi = function(_this) {
      getTodoLi(_this).remove();
    }
    var deleteTodo = function() {
      var todo = getTodoData(this);
      deleteTodoAjax(todo.id, function(data){
                      deleteTodoLi(this);
                      updateTodoCount();
      }.bind(this));
    };
    var deleteTodoAjax = function(id, cb) {
      $.ajax({
        url: '/api/todos/' + id,
        type: 'DELETE',
        data: {
          id: id
        },
        dataType: 'json',
        success: function(data) {
          cb(data);
        }
      });
    };
    
    //Footer
    //Count
    var updateTodoCount = function() {
      $count.text($todoList.children().length);
    }
    
    //Filter
    var getTodoLiList = function() {
      return $('li');
    }
    var getTodoLiCheckedList = function() {
      return $('li.checked');
    }
    var showAll = function() {
      getTodoLiList().removeClass('hide');
    }
    var showNone = function() {
      getTodoLiList().addClass('hide');
    }
    var showNotDone = function() {
      showAll();
      getTodoLiCheckedList().addClass('hide');
    }
    var showDone = function() {
      getTodoLiList().addClass('hide');
      getTodoLiCheckedList().removeClass('hide');
    }
    
    //Clear
    var deleteTodosDone = function() {
      var $done = getTodoLiCheckedList().find('span'),
          todo;
      for (var i = 0; i < $done.length; i++) {
        todo = getTodoData($done[i]);
        (function($done){
          deleteTodoAjax(todo.id, function(){
                          deleteTodoLi($done);
                          updateTodoCount();
          });
        })($done[i]);
      }
    };    
    
    return {
      init: init
    };
  })();
  app.init();
});