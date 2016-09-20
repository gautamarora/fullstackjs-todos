var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');
var ContentEditable = require('react-contenteditable');

var TodoApp = React.createClass({
  getInitialState: function() {
    return {
      title: '',
      user: null,
      page: 'index', // index or login or register or todos
      data: [],
      show: 'all', // all or done or not-done
      addTodoText: '',
      beforeEditingTodoText: '',
      username: '',
      password: '',
    }
  },
  componentDidMount: function() {
    var initialState = JSON.parse(window.INITIAL_STATE || {});
    this.setState({title: initialState.title, user: initialState.user});
    if(initialState.user) {
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
    }
  },
  loginClick: function(e) {
    this.setState({page: 'login'});
  },
  registerClick: function(e) {
    this.setState({page: 'register'});
  },
  todosClick: function(e) {
    this.setState({page: 'todos'})
  },
  usernameChange: function(e) {
    this.setState({username: e.target.value});
  },
  passwordChange: function(e) {
    this.setState({password: e.target.value});
  },
  logout: function(e) {
    $.ajax({
      url: '/logout',
      type: 'GET',
      success: function(data) {
        this.setState({user: null, page: 'index'});
        if(typeof cb === "function") {
          cb();
        }
      }.bind(this)
    });
  },
  login: function(e) {
    $.ajax({
      url: '/login',
      type: 'POST',
      data: {
        username: this.state.username,
        password: this.state.password
      },
      dataType: 'json',
      success: function(data) {
        this.setState({user: data.user});
        $.ajax({ //DUPLICATE: Fetching Todos on ComponenentDidMount (already logged in), and Login Success (just logged in)
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
        if(typeof cb === "function") {
          cb();
        }
      }.bind(this)
    });
  },
  register: function(e) {
    $.ajax({
      url: '/register',
      type: 'POST',
      data: {
        username: this.state.username,
        password: this.state.password
      },
      dataType: 'json',
      success: function(data) {
        this.setState({user: data.user});
        if(typeof cb === "function") {
          cb();
        }
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
  //fired to revert on escape
  updateTodoChangeRevert: function(id, type, e) {
    var self = this;
    var _data = this.state.data;
    $.each(_data, function() {
      if(this._id === id) {
        if(type === 'text') {
          this.text = self.state.beforeEditingTodoText;
          self.setState({beforeEditingTodoText: ''});
        }
      }
    });
    this.setState({data: _data});
  },
  //fired on text field edits
  updateTodoChange: function(id, type, e) {
    var self = this;
    var _data = this.state.data;
    $.each(_data, function() {
      if(this._id === id) {
        if(type === 'text') {
          if(self.state.beforeEditingTodoText === '') {
            self.setState({beforeEditingTodoText: this.text});
          }
          this.text = e.target.value;
        }
      }
    });
    this.setState({data: _data});
  },
  //fired on saves
  updateTodo: function(id, type, e, cb) {
    var _data = this.state.data;
    var _dataTodo = {};
    var self = this;
    $.each(_data, function() {
      if(this._id === id) {
        if(type === 'done') {
          this.done = !this.done;
          _dataTodo.done = this.done;
        }
        if(type === 'text') {
          _dataTodo.text = this.text;
          self.setState({beforeEditingTodoText: ''});
        }
      }
    });
    $.ajax({
      url: '/api/todos/'+id,
      type: 'PUT',
      data: _dataTodo,
      dataType: 'json',
      success: function(todo) {
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
    if(!this.state.user && this.state.page === 'register') {
      return (
        <Register register={this.register} usernameChange={this.usernameChange} passwordChange={this.passwordChange} />      
      );
    } else if(!this.state.user && this.state.page === 'login') {
      return (
        <Login login={this.login} usernameChange={this.usernameChange} passwordChange={this.passwordChange} />
      );
    } else if(this.state.user && this.state.page === 'todos') {
      return(
        <div className="well todos">
          <TodoAdd addTodoText={this.state.addTodoText} addTodo={this.addTodo} addTodoChange={this.addTodoChange} />
          <TodoList data={this.state.data} show={this.state.show} updateTodoChange={this.updateTodoChange} updateTodoChangeRevert={this.updateTodoChangeRevert} updateTodo={this.updateTodo} deleteTodo={this.deleteTodo} />
          <div className="row">
            <TodoCounter data={this.state.data} />
            <TodoFilter show={this.state.show} updateShow={this.updateShow} />
            <TodoClear data={this.state.data} deleteTodo={this.deleteTodo} />
          </div>
        </div>
      );
    } else {
      return(
        <Index title={this.state.title} user={this.state.user} loginClick={this.loginClick} logoutClick={this.logout} registerClick={this.registerClick} todosClick={this.todosClick} />
      );
    }
  }
});

var Index = React.createClass({
  onLoginClick: function(e) {
    this.props.loginClick();
  },
  onRegisterClick: function(e) {
    this.props.registerClick();
  },
  onLogoutClick: function(e) {
    this.props.logoutClick();
  },
  onTodosClick: function(e) {
    this.props.todosClick();
  },
  render: function() {
    return (
      <div className="container">
        <div className="well todos">
            {this.props.user && <h4>Welcome {this.props.user.username}!</h4> }
            {!this.props.user && <h4>Welcome to the {this.props.title} app!</h4> }
            <div>
              {this.props.user && <button className="btn btn-md btn-success btn-todos" type="submit" onClick={this.onTodosClick}>Todos</button> }
              {this.props.user && <button className="btn btn-md btn-danger btn-logout" type="submit" onClick={this.onLogoutClick}>Log Out</button> }
              {!this.props.user && <button className="btn btn-md btn-success btn-login" type="submit" onClick={this.onLoginClick}>Log In</button> }
              {!this.props.user && <button className="btn btn-md btn-primary btn-register" type="submit" onClick={this.onRegisterClick}>Register</button> }
            </div>
        </div>
      </div>
    );
  }
});

var Login = React.createClass({
  onUsernameChange: function(e) {
    this.props.usernameChange(e);
  },
  onPasswordChange: function(e) {
    this.props.passwordChange(e);
  },
  onSubmit: function(e) {
    this.props.login();
    e.preventDefault();
  },
  render: function() {
    return (
      <div className="container">
        <form className="form-signin" onSubmit={this.onSubmit}>
          <h2 className="form-signin-heading">Sign in</h2>
          <label htmlFor="inputUsername" className="sr-only">Email address</label>
          <input type="username" name="username" id="inputUsername" className="form-control" value={this.props.username} placeholder="Username" required autoFocus onChange={this.onUsernameChange} />
          <label htmlFor="inputPassword" className="sr-only">Password</label>
          <input type="password" name="password" id="inputPassword" className="form-control" value={this.props.password} placeholder="Password" required onChange={this.onPasswordChange} />
          <button className="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
        </form>
      </div>
    );
  }
});

var Register = React.createClass({
  onUsernameChange: function(e) {
    this.props.usernameChange(e);
  },
  onPasswordChange: function(e) {
    this.props.passwordChange(e);
  },
  onSubmit: function(e) {
    this.props.register();
    e.preventDefault();
  },
  render: function() {
    return (
      <div className="container">
        <form className="form-signin" onSubmit={this.onSubmit}>
          <h2 className="form-signin-heading">Register</h2>
          <label htmlFor="inputUsername" className="sr-only">Email address</label>
          <input type="username" name="username" id="inputUsername" className="form-control" placeholder="Username" required autoFocus onChange={this.onUsernameChange} />
          <label htmlFor="inputPassword" className="sr-only">Password</label>
          <input type="password" name="password" id="inputPassword" className="form-control" placeholder="Password" required onChange={this.onPasswordChange} />
          <button className="btn btn-lg btn-primary btn-block" type="submit">Register</button>
        </form>
      </div>
    );
  }
});

var TodoAdd = React.createClass({
  onButtonClick: function(e) {
    this.props.addTodo();
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
            <Todo key={todo._id} id={todo._id} done={todo.done} updateTodoChange={self.props.updateTodoChange} updateTodoChangeRevert={self.props.updateTodoChangeRevert} updateTodo={self.props.updateTodo} deleteTodo={self.props.deleteTodo}>{todo.text}</Todo>
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
    this.props.updateTodo(this.props.id, 'done');
  },
  onKeyDown: function(e) {
    var key = e.keyCode;
    if(key === 13) {
      this.props.updateTodo(this.props.id, 'text', e);
      e.target.blur();
      e.preventDefault();
    } else if(key === 27) {
      this.props.updateTodoChangeRevert(this.props.id, 'text', e);
      e.target.blur();
      //note: onKeyDown for escape will not trigger on change, so e.preventDefault() is not needed here
      //however, it would have been fired for onKeyPress but that doesnt capture escapes, and only characters
    }
  },
  onChange: function(e) {
    this.props.updateTodoChange(this.props.id, 'text', e);
  },
  onDeleteClick: function(e) {
    var id = this.props.id;
    this.props.deleteTodo(id);
  },
  render: function() {
    return(
      <li id={this.props.id} className="list-group-item">
        <input type="checkbox" checked={!!this.props.done} onChange={this.onCheckboxClick}/>
        <ContentEditable tagName="span" html={this.props.children} className={!!this.props.done ? "checked" : ""} onChange={this.onChange} onKeyDown={this.onKeyDown} />
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