var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');

var TodoApp = React.createClass({
  getInitialState: function() {
    return {
      data: [],
      show: 'all',
      addTodoText: ''
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
  addTodoChange: function(e) {
    this.setState({addTodoText: e.target.value});
  },
  addTodo: function(text, cb) {
    $.ajax({
      url: '/api/todos',
      type: 'POST',
      data: {
        text: this.state.addTodoText
      },
      dataType: 'json',
      success: function(data) {
        var todo = data.todo;
        var _data = this.state.data;
        _data.push({_id: todo._id, text: todo.text, done: todo.done});
        this.setState({data: _data, addTodoText: ''});
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
            this.done = 'done' in data ? data.done : this.done;
            this.text = 'text' in data ? data.text : this.text;
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
        });
        this.setState({data: _data});
        if(typeof cb === "function") {
          cb();
        }
      }.bind(this)
    })
  },
  updateShow: function(show) {
    this.setState({show: show});
  },
  render: function() {
    return(
      <div className="well todos">
        <TodoAdd addTodoText={this.state.addTodoText} addTodo={this.addTodo} addTodoChange={this.addTodoChange} />
        <TodoList data={this.state.data} show={this.state.show} updateTodo={this.updateTodo} deleteTodo={this.deleteTodo} />
        <div className="row">
          <TodoCounter data={this.state.data} />
          <TodoFilter show={this.state.show} updateShow={this.updateShow} />
          <TodoClear data={this.state.data} deleteTodo={this.deleteTodo} />
        </div>
      </div>
    );
  }
});

var TodoAdd = React.createClass({
  onButtonClick: function(e) {
    this.addTodo();
  },
  onChange: function(e) {
    this.props.addTodoChange(e);
  },
  onSubmit: function(e) {
    this.props.addTodo();
    e.preventDefault();
  },
  render: function() {
    return(
      <form onSubmit={this.onSubmit} >
        <div className="form-group input-group">
          <input id="add-todo-text" className="form-control" type="text" value={this.props.addTodoText} placeholder="Add a Todo" onChange={this.onChange} />
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
        var showTodo = false;
        if(self.props.show === 'all') {
          showTodo = true;
        } else if(self.props.show === 'done' && todo.done) {
          showTodo = true;
        } else if(self.props.show === 'not-done' && !todo.done) {
          showTodo = true
        };
        if(showTodo) {
          return (
            <Todo key={todo._id} id={todo._id} done={todo.done} updateTodo={self.props.updateTodo} deleteTodo={self.props.deleteTodo}>{todo.text}</Todo>
          );
        } else {
          return null;
        }
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
        <span ref={"todoText-"+this.props.id} contentEditable={true} suppressContentEditableWarning={true} className={this.props.done ? "checked" : ""} onKeyDown={this.onTextFieldKeyDown}>{this.props.children}</span>
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
  onFilterClickAll: function() {
    this.props.updateShow('all');
  },
  onFilterClickDone: function() {
    this.props.updateShow('done');
  },
  onFilterClickNotDone: function() {
    this.props.updateShow('not-done')
  },
  render: function() {
    return(
      <div className="col-xs-12 col-sm-4 text-center filter">
          <a className="show-all" onClick={this.onFilterClickAll} >all</a> | 
          <a className="show-not-done" onClick={this.onFilterClickNotDone} > not done</a> | 
          <a className="show-done" onClick={this.onFilterClickDone}> done</a>
      </div>
    );
  }
});

var TodoClear = React.createClass({
  onClearClick: function() {
    var todosDone = $.grep(this.props.data, function(d) {
      return d.done === true;
    });
    for(var i=0; i < todosDone.length; i++) {
      this.props.deleteTodo(todosDone[i]._id);
    }
  },
  render: function() {
    return(
      <div className="col-xs-12 col-sm-4 text-center">
        <a className="clear" onClick={this.onClearClick}>clear</a>
      </div>
    );
  }
});

ReactDOM.render(
  <TodoApp url='/api/todos'/>,
  document.getElementById('app')
);