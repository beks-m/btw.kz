import React, { Component } from 'react';
import { Button, Popup, Label, Icon } from 'semantic-ui-react';
import connectToStores from 'alt-utils/lib/connectToStores';
import DefaultStore from '../stores/DefaultStore';
import UpvoteStore from '../stores/UpvoteStore';
import UpvoteActions from '../actions/UpvoteActions';
import ReactGA from 'react-ga';

@connectToStores
class UpvoteButton extends Component {

  static getStores() {
    return [DefaultStore, UpvoteStore];
  }

  static getPropsFromStores() {
    return {
      ...DefaultStore.getState(),
      ...UpvoteStore.getState()
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      isUpvoted: false,
      isLoading: true,
      count: this.props.post.upvoteCount
    };
    if (!this.props.upvotes[this.props.post]) {
      UpvoteActions.getUpvotes([this.props.post]);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.upvotes[this.props.post.id]) {
      this.setState({isLoading: false});
      this.setState({count: nextProps.upvotes[this.props.post.id].length});
      if (this.props.user) {
        this.setState({isUpvoted: false});
        nextProps.upvotes[this.props.post.id].forEach((upvote) => {
          if (this.props.user.uid === upvote.userID) {
            this.setState({isUpvoted: true});
          }
        });
      }
    }
  }

  handleUpvote = () => {
    if (this.props.user) {
      if (this.state.isUpvoted) {
        UpvoteActions.removeUpvote(this.props.post);
        this.setState({isUpvoted: false, count: this.state.count-1});
        ReactGA.event({
          category: 'Upvoting',
          action: 'Remove upvote',
          label: this.props.pageName
        });
      } else {
        UpvoteActions.addUpvote(this.props.post);
        this.setState({isUpvoted: true, count: this.state.count+1});
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
      this.props.user ? (
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
      ) : (
        <Popup
          trigger={
            <Label style={{marginRight: '0rem'}}><Icon name='like' />{this.state.count}</Label>
          }
          content='Авторизуйтесь, чтобы поставить лайк'
          size='tiny'
          position='left center'
        />
      )
    )
  }
}

export default UpvoteButton;
