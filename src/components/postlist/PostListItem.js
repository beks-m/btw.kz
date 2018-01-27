import React, { Component } from 'react';
import { Label, Button, Popup, Header, Image, Grid, Segment, Responsive, Divider } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import UpvoteButton from '../upvoteButton/UpvoteButton';
import { iconForType, nameForType, randomColor } from '../utils/contentFunctions';

class PostListItem extends Component {

  render() {
    return (
      <Segment>
        <Label icon={iconForType(this.props.type)} content={nameForType(this.props.type)} ribbon />
        <Grid stackable>
          <Grid.Row verticalAlign='middle'>
            <Grid.Column width={5}>
              <Image src={this.props.media[0].thumbnail}
                alt={this.props.name}
                fluid
                bordered
              />
            </Grid.Column>
            <Grid.Column width={8}>
              <Header as={Link} to={{ pathname: 'post/' + this.props.publicationDate + '/' + this.props.id, post: this.props }}>{this.props.name}</Header>
              <p>{this.props.shortDescription}</p>
              {this.props.tags.map((object, idx) => {
                return <Label as='a' key={idx} content={object} color={randomColor()} onClick={() => {this.props.history.push('/tags/' + object)}} />;
              })}
            </Grid.Column>
            <Grid.Column width={3} textAlign='right'>
              <UpvoteButton post={this.props} pageName='Homepage'/>
              <Responsive
                minWidth={500}
              >
                <Divider fitted hidden />
              </Responsive>
              <Popup
                trigger={
                  <Button
                    size='mini'
                    icon='comments'
                    label={{ basic: true, pointing: 'left', content: this.props.commentCount }}
                  />
                }
                content={this.props.authorizedUser ? 'Оставить комментарий' : 'Авторизуйтесь, чтобы оставить комментарий'}
                  size='tiny'
                  position='left center'
                />
                <Responsive
                  maxWidth={500}
                >
                  <br />
                </Responsive>
              </Grid.Column>
            </Grid.Row>
          </Grid>
      </Segment>
    );
  }

}

export default PostListItem;
