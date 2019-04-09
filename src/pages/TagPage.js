import React, { Component } from 'react';
import connectToStores from 'alt-utils/lib/connectToStores';
import TagStore from '../stores/TagStore';
import TagActions from '../actions/TagActions';
import { Container, Header, Icon, Loader, Grid, Divider, Dropdown, Input } from 'semantic-ui-react';
import ReactGA from 'react-ga';
import PostGrid from '../components/PostGrid';
import ScrollToTop from '../components/ScrollToTop';
import { randomColor } from '../utils/contentFunctions';
import { Helmet } from 'react-helmet';

@connectToStores
class TagPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tag: this.props.history.location.pathname.split('/')[2],
      tagSearchFieldValue: '',
      tagSearchDropdownOpen: false
    }
    TagActions.getTagInfo(this.state.tag);
    TagActions.getPostsForTag(this.state.tag, null);
    TagActions.searchForTag('');
    ReactGA.pageview(window.location.pathname, 'Tag view - ' + this.state.tag);
  }

  static getStores() {
    return [TagStore];
  }

  static getPropsFromStores() {
    return TagStore.getState();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({morePostsLoaderIsActive: false});
    if (nextProps.history.location.pathname.split('/')[2] !== this.state.tag) {
      this.setState({tag: nextProps.history.location.pathname.split('/')[2]});
      TagActions.getTagInfo(nextProps.history.location.pathname.split('/')[2]);
      TagActions.getPostsForTag(nextProps.history.location.pathname.split('/')[2], null);
      TagActions.searchForTag('');
      this.setState({tagSearchDropdownOpen: false, tagSearchFieldValue: ''});
      ReactGA.pageview(window.location.pathname, 'Tag view - ' + nextProps.history.location.pathname.split('/')[2]);
    }
  }

  loadMorePosts = () => {
    if (!this.props.tagPostsEnded[this.state.tag]) {
      TagActions.getPostsForTag(this.state.tag, this.props.postsForTag[this.state.tag][this.props.postsForTag[this.state.tag].length-1].snapshot);
      this.setState({morePostsLoaderIsActive: true})
    }
  }

  render() {
    return (
      <Container>
        <ScrollToTop/>
        <Helmet>
          <title>{this.state.tag} | btw.kz</title>
          <meta name='description' content='Краудсорсинговый информационный портал' />
          <meta property='og:image' content='https://firebasestorage.googleapis.com/v0/b/btw-kz.appspot.com/o/logo-square-1024.png?alt=media&token=7c0b442b-ac8f-4779-9da7-2fb1228a2e89' />
        </Helmet>
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
            <Dropdown text='Другие тэги' icon='filter' open={this.state.tagSearchDropdownOpen} labeled button className='icon' direction='left' onClick={() => {this.setState({tagSearchDropdownOpen: true});}} onBlur={() => {this.setState({tagSearchDropdownOpen: false});}}>
              <Dropdown.Menu>
                <Input icon='search' iconPosition='left' className='search' fluid value={this.state.tagSearchFieldValue} onChange={(event, data) => {
                  this.setState({tagSearchFieldValue: data.value});
                  TagActions.searchForTag(data.value);
                }}/>
                <Dropdown.Divider />
                <Dropdown.Header icon='tags' content={this.state.tagSearchFieldValue === '' ? 'Популярные тэги' : 'Результаты поиска'} />
                <Dropdown.Menu scrolling>
                  {this.props.tagSearchResults.map(tag => <Dropdown.Item key={tag} text={tag} value={tag} label= {{ color: randomColor(), empty: true, circular: true }} onClick={() => {
                    this.props.history.push('/tags/' + tag)
                  }}/>)}
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

export default TagPage;
