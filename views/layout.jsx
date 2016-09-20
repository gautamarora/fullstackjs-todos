var React = require('react');
var Header = require('./header');

var Layout = React.createClass({
  render: function() {
    return (
      <html>
        <head>
          <meta charset="utf-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{this.props.title}</title>
          <link rel="stylesheet" href="../stylesheets/style.css" />
        </head>
        <body>
          <Header title={this.props.title}/>
          {this.props.children}
          <script data-data={JSON.stringify({'title': this.props.title, 'user': this.props.user})} dangerouslySetInnerHTML={{__html: "var data = document.currentScript.dataset['data']; window.INITIAL_STATE = data;"}} />
          <script src='/javascripts/bundle.js'></script>
        </body>
      </html>
    );
  }
});

module.exports = Layout;