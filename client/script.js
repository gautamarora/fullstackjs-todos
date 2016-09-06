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
        if(typeof cb === "function") {
          cb();
        }
      }.bind(this)
    });
  },
  updateTodo: function(id, data, cb) {
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
        if(typeof cb === "function") {
          cb();
        }
      }.bind(this)
    });
  },
  deleteTodo: function(id, cb) {
    $.ajax({
      url: '/api/todos/'+id,
      type: 'DELETE',
      success: function(todo) {
        var _data = $.grep(this.state.data, function(d) {
          return d._id !== id;
        })
        this.setState({data: _data});
        if(typeof cb === "function") {
          cb();
        }
      }.bind(this)
    })
  },
  render: function() {
    return(
      <div className="well todos">
        <TodoAdd addTodo={this.addTodo} />
        <TodoList updateTodo={this.updateTodo} deleteTodo={this.deleteTodo} data={this.state.data} />
        <div className="row">
          <TodoCounter data={this.state.data} />
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
          <Todo updateTodo={self.props.updateTodo} deleteTodo={self.props.deleteTodo} key={todo._id} id={todo._id} done={todo.done}>{todo.text}</Todo>
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
    this.props.updateTodo(id, data);
  },
  onTextFieldKeyDown: function(e) {
    var key = e.keyCode, //note: For keydown (when detecting escape), use key code. For keypress, use char code.
        target = e.target,
        id = this.props.id,
        text = this.refs["todoText-"+id].innerHTML, //note: for text fields, use innerHTML. For input text fields, use value.
        data = { text: text };
    if(key === 27) {
      document.execCommand('undo');
      target.blur();
    } else if(key === 13) {
      this.props.updateTodo(id, data, function() {
        target.blur();
      });
      e.preventDefault();
    }
  },
  onDeleteClick: function(e) {
    var id = this.props.id;
    this.props.deleteTodo(id);
  },
  render: function() {
    return(
      <li id={this.props.id} className="list-group-item">
        <input type="checkbox" defaultChecked={this.props.done} onClick={this.onCheckboxClick}/>
        <span ref={"todoText-"+this.props.id} contentEditable={true} className={this.props.done ? "checked" : ""} onKeyDown={this.onTextFieldKeyDown}>{this.props.children}</span>
        <a className="pull-right" onClick={this.onDeleteClick}><small><i className="glyphicon glyphicon-trash"></i></small></a>
      </li>
    );
  }
});

var TodoCounter = React.createClass({
  render: function() {
    return(
      <div className="col-xs-12 col-sm-4 text-center">
        <span className="count">{this.props.data.length}</span> todos
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
      <div className="col-xs-12 col-sm-4 text-center">
        <a className="clear">clear</a>
      </div>
    );
  }
});

ReactDOM.render(
  <TodoApp url='/api/todos'/>,
  document.getElementById('app')
);