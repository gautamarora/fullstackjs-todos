var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');

var TodoApp = React.createClass({
  getInitialState: function() {
    return {
      data: []
    }
  },
  componentDidMount: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  addTodo: function(text, cb) {
    $.ajax({
      url: '/api/todos',
      type: 'POST',
      data: {
        text: text
      },
      dataType: 'json',
      success: function(data) {
        var todo = data.todo;
        var _data = this.state.data;
        _data.push({_id: todo._id, text: todo.text, done: todo.done});
        this.setState({data: _data});
        cb();
      }.bind(this)
    });
  },
  updateTodo: function(id, data) {
    $.ajax({
      url: '/api/todos/'+id,
      type: 'PUT',
      data: data,
      dataType: 'json',
      success: function(todo) {
        var _data = this.state.data;
        $.each(_data, function() {
          if(this._id === id) {
            this.done = data.done ? data.done : this.done;
            this.text = data.text ? data.text : this.text;
          }
        });
        this.setState({data: _data});
      }.bind(this)
    });
  },
  deleteTodo: function(id) {
    
  },
  render: function() {
    return(
      <div className="well todos">
        <TodoAdd addTodo={this.addTodo} />
        <TodoList updateTodo={this.updateTodo} data={this.state.data} />
        <div class="row">
          <TodoCounter />
          <TodoFilter />
          <TodoClear />
        </div>
      </div>
    );
  }
});

var TodoAdd = React.createClass({
  onButtonClick: function(e) {
    this.addTodo();
  },
  onTextFieldKeypress: function(e) {
    var key = e.charCode;
    if(key === 13 || key === 169) {
      this.addTodo();
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  },
  addTodo: function() {
    var text = this.refs.addTodoText.value;
    this.props.addTodo(text, function() {
      this.refs.addTodoText.value = '';
    }.bind(this));
  },
  render: function() {
    return(
      <form action="#" method="post">
        <div className="form-group input-group">
          <input ref="addTodoText" id="add-todo-text" className="form-control" type="text" defaultValue="" placeholder="Add a Todo" onKeyPress={this.onTextFieldKeypress} />
          <span className="input-group-btn">
            <input className="btn btn-default" type="button" value="add" onClick={this.onButtonClick} />
          </span>
        </div>
      </form>
    );
  }
});

var TodoList = React.createClass({
  render: function() {
      var self = this;
      var todos = this.props.data.map(function(todo) {
        return (
          <Todo updateTodo={self.props.updateTodo} key={todo._id} id={todo._id} done={todo.done} editing={todo.editing}> {todo.text}</Todo>
        );
      });
      return (
        <ul className="list-group">
          {todos}
        </ul>
      );
  }
});

var Todo = React.createClass({
  onCheckboxClick: function(e) {
    var id = this.props.id,
        checked = !this.props.done,
        data = {done: checked};
    this.updateTodo(id, data);
  },
  updateTodo: function(id, data) {
    this.props.updateTodo(id, data);
  },
  onTextFieldKeydown: function(e) {
    var key = e.charCode,
        target = e.target,
        id = this.props.id,
        text = this.props.text,
        data = { text: text };
        console.log("children", this.props.children);
    //  $this.addClass("editing");
    //  if(key === 27) { //escape key
    //    $this.removeClass("editing");
    //    document.execCommand('undo');
    //    target.blur();
    //  } else if(key === 13) { //enter key
    //    updateTodo(id, data, function(d) {
    //      $this.removeClass("editing");
    //      target.blur();
    //    });
    //    e.preventDefault();
    //  }
     console.log(key, id, text);
     if(key === 27) {
       this.updateTodoEditingDismiss();
     } else if(key === 13) {
       this.updateTodoEditingSave(id, data);
     } else {
       this.updateTodoEditingStart();
     }
  },
  updateTodoEditingStart: function() {
    console.log("start editing");
  },
  updateTodoEditingDismiss: function() {
    console.log("dismiss editing");
  },
  updateTodoEditingSave: function(id, data) {
    console.log("save editing");
    // this.props.updateTodo(id, data);
  },
  render: function() {
    return(
      <li id={this.props.id} className="list-group-item">
        <input type="checkbox" defaultChecked={this.props.done} onClick={this.onCheckboxClick}/>
        <span contentEditable className={this.props.done ? "checked editing" : ""} onKeyDown={this.onTextFieldKeydown}>{this.props.children}</span>
        <a className="pull-right"><small><i className="glyphicon glyphicon-trash"></i></small></a>
      </li>
    );
  }
});

var TodoCounter = React.createClass({
  render: function() {
    return(
      <div className="col-xs-12 col-sm-4 text-center">
        <span className="count">3</span> todos
      </div>
    );
  }
});

var TodoFilter = React.createClass({
  render: function() {
    return(
      <div className="col-xs-12 col-sm-4 text-center filter">
          <a className="show-all">all</a> | 
          <a className="show-not-done"> not done</a> | 
          <a className="show-done"> done</a>
      </div>
    );
  }
});

var TodoClear = React.createClass({
  render: function() {
    return(
      <div class="col-xs-12 col-sm-4 text-center">
        <a class="clear">clear</a>
      </div>
    );
  }
});

ReactDOM.render(
  <TodoApp url='/api/todos'/>,
  document.getElementById('app')
);