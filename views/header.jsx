var React = require('react');

var Header = React.createClass({
  render: function() {
    return (
      <nav className="navbar navbar-default navbar-fixed-top">
        <div className="container">
          <div className="navbar-header">
            <a className="navbar-brand" href="#">{this.props.title}</a>
          </div>
        </div>
      </nav>
    );
  }
});

module.exports = Header;