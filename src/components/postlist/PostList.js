import React, { Component } from 'react';
import { Item, Segment} from 'semantic-ui-react';
import PostListItem from './PostListItem';

class PostList extends Component {

  render() {
    return (
      <Segment>
        <Item.Group divided relaxed>
          {
            this.props.postList.map(function(item, idx) {
              return <PostListItem key={idx} {...item}/>
            })
          }
        </Item.Group>
      </Segment>
    );
  }
}

export default PostList;
