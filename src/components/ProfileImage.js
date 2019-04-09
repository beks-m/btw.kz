import React, { Component } from 'react';
import { Image } from 'semantic-ui-react';

class ProfileImage extends Component {

  render() {
    return (
      <Image avatar={this.props.avatar} as={this.props.as} src={'https://graph.facebook.com/v3.0/' + this.props.facebookUID + '/picture?type=' + this.props.facebookSize} size={this.props.size} circular={this.props.circular} to={this.props.to} />
    )
  }

}

export default ProfileImage;
