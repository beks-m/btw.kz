import React, { Component } from 'react';
import Popup from './Popup';
import Actions from '../../actions/Actions'

class NewPostPopup extends Component {
  handlePost = () => {
    var userReference = this.props.user.uid;
    var newPost = {
      name: this.refs.name.value,
      link: this.refs.link.value,
      media: this.refs.media.value,
      description: this.refs.description.value,
      upvoteCount: 0,
      user: userReference
    }

    Actions.addPost(newPost);
  };

  render() {
    return(
      <Popup {...this.props} style="new-post-popup">
        <header className="new-post-header">Post a new post</header>
        <section>
          <table>
            <tbody>
              <tr>
                <td>Name</td>
                <td><input placeholder="Enter post's name"></input></td>
              </tr>
              <tr>
                <td>Description</td>
                <td><input placeholder="Enter post's description"></input></td>
              </tr>
              <tr>
                <td>Link</td>
                <td><input placeholder="http://www"></input></td>
              </tr>
              <tr>
                <td>Media</td>
                <td><input placeholder="Paste a direct link to an image"></input></td>
              </tr>
            </tbody>
          </table>
        </section>
        <footer className="new-post-footer">
          <button onClick={this.handlePost} className="new-post-btn">Hunt It!</button>
        </footer>
      </Popup>
    );
  }
}

export default NewPostPopup;
