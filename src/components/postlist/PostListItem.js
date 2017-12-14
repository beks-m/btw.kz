import React, { Component } from 'react';
import { Label, Item, Button, Popup, Modal, Image, Header, Icon } from 'semantic-ui-react';
import Actions from '../../actions/Actions';
import { Link } from 'react-router-dom';

class PostListItem extends Component {

  handleUpvote = () => {
    if (this.props.isUpvoted) {
      Actions.removeUpvote(this.props.id);
    } else {
      Actions.addUpvote(this.props.id);
    }
  }

  renderItemImage() {
    return (
      <Item.Image
        src={this.props.media[0].link}
        label={{
          as: 'a',
          content: this.props.type,
          icon: this.props.icon,
          ribbon: true,
        }}
        alt={this.props.media[0].description}
      />
    )
  }

  // TODO:10 Finish single post modal implementation
  renderSinglePostModal(triggerComponent) {
    return (
      <Modal trigger={triggerComponent}>
        <Modal.Header>Profile Picture</Modal.Header>
        <Modal.Content image>
          <Image wrapped size='medium' src='/assets/images/wireframe/image.png' />
          <Modal.Description>
            <Header>Modal Header</Header>
            <p>This is an example of expanded content that will cause the modal's dimmer to scroll</p>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button primary>
            Proceed <Icon name='right chevron' />
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }

  renderItemHeader() {
    return (
      <Item.Header as={Link} to={{ pathname: 'post/' + this.props.id, post: this.props }}>{this.props.name}</Item.Header>
    )
  }

  render() {
    return (
      // TODO:30 Make whole postItem clickable
      <Item>

        {this.renderItemImage()}
        <Item.Content verticalAlign='middle'>
          {this.renderItemHeader()}
          <Item.Description>{this.props.description}</Item.Description>
          <Item.Extra>
            {this.props.tags.map(function(object, idx) {
              return <Label key={idx} content={object}/>;
            })}
          </Item.Extra>
        </Item.Content>

        <Item.Content verticalAlign='middle'>
          {
            // TODO:20 Make upvote and comment buttons align by left or fixed sizes
          }
          <Item.Extra>
            <Popup
              trigger={
                <Button
                  floated='right'
                  size='mini'
                  color={
                    this.props.isUpvoted
                    ?
                    'blue'
                    :
                    null
                  }
                  icon='chevron up'
                  onClick = {this.handleUpvote}
                  label={{ basic: true, pointing: 'left', content: this.props.upvoteCount }}
                />
              }
              content='Поднять выше'
              size='tiny'
              position='left center'
            />
          </Item.Extra>

          <Item.Extra>
            <Popup
              trigger={
                <Button
                  floated='right'
                  size='mini'
                  icon='comments'
                  label={{ basic: true, pointing: 'left', content: this.props.commentCount }}
                />
              }
              content='Оставить комментарий'
              size='tiny'
              position='left center'
            />

          </Item.Extra>
        </Item.Content>

      </Item>
    );
  }

}

export default PostListItem;
