var React = require('react');
var ReactDOM = require('react-dom');
var TodoApp = React.createClass({
  render: function() {
    return(
      <div>Hello React!</div>  
    );
  }
});
ReactDOM.render(
  <TodoApp />,
  document.getElementById('app')
);