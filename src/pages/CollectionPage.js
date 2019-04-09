import React, { Component } from 'react';
import connectToStores from 'alt-utils/lib/connectToStores';
import CollectionStore from '../stores/CollectionStore';
import CollectionActions from '../actions/CollectionActions';
import { Container, Header, Icon, Loader, Grid, Divider, Dropdown, Input } from 'semantic-ui-react';
import ReactGA from 'react-ga';
import PostGrid from '../components/PostGrid';
import ScrollToTop from '../components/ScrollToTop';

@connectToStores
class CollectionPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      path: this.props.history.location.pathname.split('/')[1]
    };

    if (this.state.path === 'tags') {
      this.state.tag = this.props.history.location.pathname.split('/')[2];
      CollectionActions.getTagInfo(this.state.tag);
      CollectionActions.getPostsForTag(this.state.tag, null);
      ReactGA.pageview(window.location.pathname, 'Tag view - ' + this.state.tag);
    } else if (this.state.path === 'collections') {

    }
  }

  static getStores() {
    return [CollectionStore];
  }

  static getPropsFromStores() {
    return CollectionStore.getState();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({morePostsLoaderIsActive: false})
  }

  loadMorePosts = () => {
    if (!this.props.tagPostsEnded[this.state.tag]) {
      CollectionActions.getPostsForTag(this.state.tag, this.props.postsForTag[this.state.tag][this.props.postsForTag[this.state.tag].length-1].snapshot);
      this.setState({morePostsLoaderIsActive: true})
    }
  }

  render() {
    var tagOptions = [
      {
        text: 'Digital',
        value: 'digital',
        label: { color: 'red', empty: true, circular: true },
      },
      {
        text: 'Apple',
        value: 'apple',
        label: { color: 'blue', empty: true, circular: true },
      },
    ];
    return (
      <Container>
        <ScrollToTop/>
        <Divider hidden />
        <Grid verticalAlign='middle'>
          <Grid.Column width={8}>
            <Header size='large' >
              <Icon name='tags' />
              <Header.Content>
                {this.state.tag}
                {/* <Header.Subheader>
                  {this.props.tagInfo[this.state.tag] &&
                    <Header.Subheader>
                  Постов по тэгу - {this.props.tagInfo[this.state.tag].count}
                    </Header.Subheader>
                  }
                </Header.Subheader> */}
              </Header.Content>
            </Header>
          </Grid.Column>
          <Grid.Column width={8} textAlign='right'>
            <Dropdown text='Другие тэги' icon='filter' labeled button className='icon' direction='left'>
              <Dropdown.Menu>
                <Input icon='search' iconPosition='left' className='search' fluid />
                <Dropdown.Divider />
                <Dropdown.Header icon='tags' content='Популярные тэги' />
                <Dropdown.Menu scrolling>
                  {tagOptions.map(option => <Dropdown.Item key={option.value} {...option} />)}
                </Dropdown.Menu>
              </Dropdown.Menu>
            </Dropdown>
          </Grid.Column>
        </Grid>
        <Divider />
        {this.props.postsForTag[this.state.tag] ? (
          <PostGrid posts={this.props.postsForTag[this.state.tag]} loadMorePosts={this.loadMorePosts} ended={this.props.tagPostsEnded[this.state.tag]} morePostsLoaderIsActive={this.state.morePostsLoaderIsActive} />
        ) : (
          <Loader active />
        )}
      </Container>
    );
  }
}

export default CollectionPage;
