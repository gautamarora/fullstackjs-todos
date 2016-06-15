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
  render: function() {
    return(
      <div className="well todos">
        <TodoAdd />
        <TodoList data={this.state.data} />
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
  render: function() {
    return(
      <form action="#" method="post">
        <div className="form-group input-group">
          <input id="add-todo-text" className="form-control" type="text" value="" placeholder="Add a Todo" />
          <span className="input-group-btn">
            <input className="btn btn-default" type="button" value="add" />
          </span>
        </div>
      </form>
    );
  }
});

var TodoList = React.createClass({
  render: function() {
      var todos = this.props.data.map(function(todo) {
        return (
          <Todo key={todo._id}>{todo.text}</Todo>
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
  render: function() {
    return(
      <li className="list-group-item">
        <input type="checkbox" defaultChecked="true"/>
        <span contenteditable="true" class="checked">{this.props.children}</span>
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