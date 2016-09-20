var React = require('react');
var Layout = require('./layout');

var App = React.createClass({
  render: function() {
    return (
      <Layout title={this.props.title} user={this.props.user}>
        <div id="app" class="container"></div>
      </Layout>
    );
  }
});

module.exports = App;