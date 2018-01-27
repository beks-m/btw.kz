import React, { Component } from 'react';
import { Button, Popup } from 'semantic-ui-react';
import Actions from '../../actions/Actions';
import DefaultStore from '../../stores/DefaultStore';
import connectToStores from 'alt-utils/lib/connectToStores';
import ReactGA from 'react-ga';

@connectToStores
class UpvoteButton extends Component {

  constructor(props) {
    super(props)
    this.state = {
      isUpvoted: false,
      isLoading: true,
      count: this.props.post.upvoteCount
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.upvotes && nextProps.upvotes[this.props.post.id]) {
      this.setState({isLoading: false});
      this.setState({count: nextProps.upvotes[this.props.post.id].length});
      this.setState({isUpvoted: nextProps.isUpvoted[this.props.post.id]});
    }
  }

  static getStores() {
    return [DefaultStore];
  }

  static getPropsFromStores() {
    return DefaultStore.getState();
  }

  handleUpvote = () => {
    if (this.props.user) {
      if (this.state.isUpvoted) {
        Actions.removeUpvote(this.props.post);
        ReactGA.event({
          category: 'Upvoting',
          action: 'Remove upvote',
          label: this.props.pageName
        });
      } else {
        Actions.addUpvote(this.props.post);
        ReactGA.event({
          category: 'Upvoting',
          action: 'Add upvote',
          label: this.props.pageName
        });
      }
    }
  }

  render() {
    return(
      <Popup
        trigger={
          <Button
            loading={this.state.isLoading}
            floated={this.props.floated}
            size='mini'
            color={this.state.isUpvoted ? 'red' : null}
            icon='like'
            onClick={this.handleUpvote}
            label={{ basic: true, pointing: 'left', content: this.state.count }}
            fluid={this.props.fluid}
          />
        }
        content={this.props.user ? 'Поднять выше' : 'Авторизуйтесь, чтобы поднять выше'}
        size='tiny'
        position='left center'
      />
    )
  }
}

export default UpvoteButton;
