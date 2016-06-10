var $ = require('jquery');
var todoTemplate = require("../views/partials/todo.hbs");
$(function() {
  //update status checkbox event handler
  $("ul").on('change', 'li :checkbox', function() {
    var $this = $(this),
        $input = $this[0],
        $li = $this.parent(),
        id = $li.attr('id'),
        checked = $input.checked,
        data = { done: checked };
    updateTodo(id, data, function(d) {
      $this.next().toggleClass("checked");
    });
  });
  
  //add todo event handler
  $(":button").on('click', addTodo);
  $(":text").on('keypress',function(e) {
   var key = e.keyCode;
   if( key == 13 || key == 169) {
     addTodo();
     e.preventDefault();
     e.stopPropagation();
     return false;
   }
  });
  
  //update text field event handler
  $('ul').on('keydown', 'li span', function(e) {
   var $this = $(this),
       $span = $this[0],
       $li = $this.parent(),
       id = $li.attr('id'),
       key = e.keyCode,
       target = e.target,
       text = $span.innerHTML,
       data = { text: text};
   $this.addClass("editing");
   if(key === 27) { //escape key
     $this.removeClass("editing");
     document.execCommand('undo');
     target.blur();
   } else if(key === 13) { //enter key
     updateTodo(id, data, function(d) {
       $this.removeClass("editing");
       target.blur();
     });
     e.preventDefault();
   }
  });

  // delete link click event handler
  $("ul").on('click', 'li a', function() {
    var $this = $(this),
    $input = $this[0],
    $li = $this.parent(),
    id = $li.attr('id');
    deleteTodo(id, deleteTodoLi($li));
  });
  
  //ajax to add todo
  var addTodo = function() {
    var text = $('#add-todo-text').val();
    console.log(text);
    $.ajax({
      url: '/api/todos',
      type: 'POST',
      data: {
        text: text
      },
      dataType: 'json',
      success: function(data) {
        var todo = data.todo;
        var newLiHtml = todoTemplate(todo);
        $('form + ul').append(newLiHtml);
        $('#add-todo-text').val('');
      }
    });
  };
  
  //ajax to update todo
  var updateTodo = function(id, data, cb) {
    $.ajax({
      url: '/api/todos/'+id,
      type: 'PUT',
      data: data,
      dataType: 'json',
      success: function(data) {
        cb();
      }
    });
  };
  
  //ajax to delete todo
  var deleteTodo = function(id, cb) {
    $.ajax({
      url: '/api/todos/'+id,
      type: 'DELETE',
      data: {
        id: id
      },
      dataType: 'json',
      success: function(data) {
        cb();
      }
    });
  };
  var deleteTodoLi = function($li) {
    $li.remove();
  };
  
  //setup mutation observer
  var initTodoObserver = function () {
    var target = $('ul')[0];
    var config = { attributes: true, childList: true, characterData: true };
    var observer = new MutationObserver(function(mutationRecords) {
      $.each(mutationRecords, function(index, mutationRecord) {
        updateTodoCount();
      });
    });
    observer.observe(target, config);
    updateTodoCount();
  };
  //setup mutation observer event handler
  var updateTodoCount = function () {
    $(".count").text($("li").length);
  };
  //kick off mutation observing
  initTodoObserver();

  //setup filters
  $('.filter').on('click', '.show-all', function() {
    $('.hide').removeClass('hide');
  });
  $('.filter').on('click', '.show-not-done', function() {
    $('.hide').removeClass('hide');
    $('.checked').closest('li').addClass('hide');
  });
  $('.filter').on('click', '.show-done', function() {
    $('li').addClass('hide');
    $('.checked').closest('li').removeClass('hide');
  });
  
  //batch delete todos on clear link
  $(".clear").on("click", function() {
    var $doneLi = $(".checked").closest("li");
    for (var i = 0; i < $doneLi.length; i++) {
      var $li = $($doneLi[i]); //you get a li out, and still need to convert into $li
      var id = $li.attr('id');
      deleteTodo(id, deleteTodoLi($li));
    }
  });
  
});