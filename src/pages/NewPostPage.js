import React, { Component } from 'react';
import NewPostActions from '../actions/NewPostActions';
import connectToStores from 'alt-utils/lib/connectToStores';
import NewPostStore from '../stores/NewPostStore';
import DefaultStore from '../stores/DefaultStore';
import { Container, Icon, Form, Input, Button, Label, Header, Segment, Divider, Modal, Image, Popup, Search, Message, TextArea, Accordion, Radio, Dropdown, Grid, Progress, Dimmer, Loader, Rating } from 'semantic-ui-react';
import Dropzone from 'react-dropzone';
import ReactGA from 'react-ga';
import RichTextEditor from '../utils/react-rte-semantic/RichTextEditor';
import PropTypes from 'prop-types';
import algoliasearch from 'algoliasearch';
import Interweave from 'interweave';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-datepicker/dist/react-datepicker-cssmodules.css';
import { YMaps, Map, Placemark } from 'react-yandex-maps';
import scrollToComponent from 'react-scroll-to-component';
import { encode } from 'node-base64-image';
// import ImageCompressor from 'image-compressor.js';
import { allStrings } from './NewPostPageStrings';
import { iconForType, nameForType } from '../utils/contentFunctions';
import { Helmet } from 'react-helmet';

@connectToStores
class NewPostPage extends Component {

  constructor(props) {
    super(props);

    NewPostActions.clearNewPostProps();
    this.state = {
        mode: 'new',
        activeSectionIndexes: {0: true, 1: false, 2: false},
        nameFieldValue: '',
        nameFieldValueError: false,
        startDate: null,
        startDateFieldValueError: false,
        endDate: null,
        endDateFieldValueError: false,
        shortDescriptionFieldValue: '',
        shortDescriptionFieldValueError: false,
        AlmatyFieldValue: (this.props.city === 'Almaty'),
        AstanaFieldValue: (this.props.city === 'Astana'),
        publishNextDayField: false,
        cityFieldValueError: false,
        locationCoordinatesFieldValueError: false,
        locationAddressFieldValue: null,
        locationCommentFieldValue: '',
        linkFieldValue: '',
        links: [],
        linkFieldValueError: false,
        tagSearchFieldValue: '',
        tags: {},
        tagSearchIsLoading: false,
        tagSearchResults: [],
        tagSearchFieldValueError: false,
        dropzoned: true,
        mediaPreviews: [],
        mediaModalOpen: false,
        mediaModalLoading: false,
        media: [],
        mediaLink: '',
        descriptionFieldValue: RichTextEditor.createEmptyValue(),
        descriptionFocusedStyle: null,
        eventIsPaid: -1,
        hunterOrMakerValue: 'hunter',
        makerIDFieldValue: '',
        commentFieldValue: '',
        showSinglePostPreview: false,
        showPostListPreview: false,
        termsFieldValue: false,
        termsFieldValueError: false,
        successModalIsOpen: false
    };

    this.locationCoordinatesFieldValue = null;

    this.mapCenter = (this.props.city === 'Almaty') ? [43.242051, 76.939534] : [51.128433, 71.430546];

    if (this.props.unmoderatedPost) { // to allow embeding this page into moderation page
      this.state.mode = 'moderation';
      this.state.activeSectionIndexes = {0: true, 1: true, 2: true, 3: true};
      this.state.type = this.props.unmoderatedPost.type;
      this.state.nameFieldValue = this.props.unmoderatedPost.name;
      if (this.props.unmoderatedPost.startDate) {
        this.state.startDate = moment(this.props.unmoderatedPost.startDate, 'DD.MM.YYYY');
        this.state.endDate = moment(this.props.unmoderatedPost.endDate, 'DD.MM.YYYY');
      }
      this.state.shortDescriptionFieldValue = this.props.unmoderatedPost.shortDescription;
      this.state.AlmatyFieldValue = this.props.unmoderatedPost.city.Almaty;
      this.state.AstanaFieldValue = this.props.unmoderatedPost.city.Astana;
      this.state.publicationDateFieldValue = moment(this.props.unmoderatedPost.publicationDate, 'DD.MM.YYYY');
      if (this.props.unmoderatedPost.locationCoordinates) {
        this.locationCoordinatesFieldValue = this.props.unmoderatedPost.locationCoordinates;
        this.mapCenter = this.props.unmoderatedPost.locationCoordinates;
        this.state.locationAddressFieldValue = this.props.unmoderatedPost.locationAddress;
        this.state.locationCommentFieldValue = this.props.unmoderatedPost.locationComment;
      }
      this.state.links = this.props.unmoderatedPost.links;
      this.state.tags = this.props.unmoderatedPost.tags;
      this.state.descriptionFieldValue = RichTextEditor.createValueFromString(this.props.unmoderatedPost.description, 'html');
      if (this.props.unmoderatedPost.eventIsPaid !== null) {
        this.state.eventIsPaid = this.props.unmoderatedPost.eventIsPaid;
        if (this.props.unmoderatedPost.price) {
          this.state.priceFieldValue = this.props.unmoderatedPost.price;
        }
      }
      this.state.postIDFieldValue = this.props.unmoderatedPost.id;
      if (this.props.unmoderatedPost.makers && this.props.unmoderatedPost.makers.length) {
        this.state.makerIDFieldValue = this.props.unmoderatedPost.makers[0];
      }
      this.state.hunterOrMakerValue = this.props.unmoderatedPost.makers && this.props.unmoderatedPost.hunterID === Object.keys(this.props.unmoderatedPost.makers)[0] ? 'maker' : 'hunter';
      this.state.commentFieldValue = this.props.unmoderatedPost.comment;
      if (this.props.unmoderatedPost.makerContacts) {
        this.state.makerContactsFieldValue = this.props.unmoderatedPost.makerContacts;
      }
      this.state.termsFieldValue = true;
      this.state.upvoteCount = 0;
      this.state.hunterID = this.props.unmoderatedPost.hunterID;
      this.state.editors = {};
      this.state.media = this.props.unmoderatedPost.media;
      var mediaPreviews = [];
      for (var i in this.props.unmoderatedPost.media) {
        if (this.props.unmoderatedPost.media[i].type === 'image') {
          mediaPreviews.push(this.props.unmoderatedPost.media[i].link);
        } else { // youtube
          mediaPreviews.push(this.props.unmoderatedPost.media[i].thumbnail);
        }
      }
      this.state.mediaPreviews = mediaPreviews;
    } else if (this.props.editedPost) {
      this.state.mode = 'editing';
      this.state.activeSectionIndexes = {0: true, 1: true, 2: true, 3: true};
      this.state.type = this.props.editedPost.type;
      this.state.nameFieldValue = this.props.editedPost.name;
      if (this.props.editedPost.startDate) {
        this.state.startDate = moment(this.props.editedPost.startDate, 'DD.MM.YYYY');
        this.state.endDate = moment(this.props.editedPost.endDate, 'DD.MM.YYYY');
      }
      this.state.shortDescriptionFieldValue = this.props.editedPost.shortDescription;
      this.state.AlmatyFieldValue = this.props.editedPost.city.Almaty;
      this.state.AstanaFieldValue = this.props.editedPost.city.Astana;
      this.state.publicationDateFieldValue = moment(this.props.editedPost.publicationDate, 'DD.MM.YYYY');
      if (this.props.editedPost.locationCoordinates) {
        this.locationCoordinatesFieldValue = this.props.editedPost.locationCoordinates;
        this.mapCenter = this.props.editedPost.locationCoordinates;
        this.state.locationAddressFieldValue = this.props.editedPost.locationAddress;
        this.state.locationCommentFieldValue = this.props.editedPost.locationComment;
      }
      this.state.links = this.props.editedPost.links;
      this.state.tags = this.props.editedPost.tags;
      this.state.descriptionFieldValue = RichTextEditor.createValueFromString(this.props.editedPost.description, 'html');
      if (this.props.editedPost.eventIsPaid !== null) {
        this.state.eventIsPaid = this.props.editedPost.eventIsPaid;
        if (this.props.editedPost.price) {
          this.state.priceFieldValue = this.props.editedPost.price;
        }
      }
      this.state.postIDFieldValue = this.props.editedPost.id;
      this.state.hunterOrMakerValue = this.props.editedPost.makers && this.props.editedPost.hunterID === Object.keys(this.props.editedPost.makers)[0] ? 'maker' : 'hunter';
      this.state.commentFieldValue = this.props.editedPost.comment;
      this.state.termsFieldValue = true;
      this.state.upvoteCount = this.props.editedPost.upvoteCount;
      this.state.hunterID = this.props.editedPost.hunterID;
      if (this.props.editedPost.makers && this.props.editedPost.makers.length) {
        this.state.makerIDFieldValue = this.props.editedPost.makers[0];
      }
      if (this.props.editedPost.makerContacts) {
        this.state.makerContactsFieldValue = this.props.editedPost.makerContacts;
      }
      this.state.editors = this.props.editedPost.editors;
      this.state.media = this.props.editedPost.media;
      var mediaPreviews = [];
      for (var i in this.props.editedPost.media) {
        if (this.props.editedPost.media[i].type === 'image') {
          mediaPreviews.push(this.props.editedPost.media[i].link);
        } else { // youtube
          mediaPreviews.push(this.props.editedPost.media[i].thumbnail);
        }
      }
      this.state.mediaPreviews = mediaPreviews;
    } else {
      ReactGA.pageview(window.location.pathname, 'New post page');
      this.state.type = this.props.match.params.type;
      if (this.props.match.params.type === 'content') {
        this.state.AlmatyFieldValue = true;
        this.state.AstanaFieldValue = true;
      }
    }

    // algolia search
    const client = algoliasearch("XIN12YYIRV", "cb62d78aa7fee794413aef5ba3e58829");
    this.searchIndex = client.initIndex('tags');
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match) {
      this.setState({ type: nextProps.match.params.type });
    }
  }

  static getStores() {
    return [NewPostStore, DefaultStore];
  }

  static getPropsFromStores() {
    return {
      ...NewPostStore.getState(),
      ...DefaultStore.getState()
    }
  }

  static propTypes = {
    onChange: PropTypes.func
  };

  // common function to handle all Inputs' onChange
  handleInputChange = (e, { name, value }) => {
    e.preventDefault();
    var errorString = name + 'Error';
    this.setState({ [name]: value, [errorString]: false });
  }

  handleSectionTitleClick = (e, titleProps) => {
    const { index } = titleProps;
    var newActiveSectionIndexes = this.state.activeSectionIndexes;
    newActiveSectionIndexes[index] = !newActiveSectionIndexes[index];
    this.setState({ activeSectionIndexes: newActiveSectionIndexes });
  }

  // first section - name and Tagline

  renderSection0() {
    return([
      <Accordion.Title key='01' active={this.state.activeSectionIndexes[0]} index={0} onClick={this.handleSectionTitleClick}>
        <Icon name='dropdown' />
        <span style={{fontSize:'1.2em'}}><b>{allStrings[this.state.type]['section0Title']}</b></span>
      </Accordion.Title>,
      <Accordion.Content key='02' active={this.state.activeSectionIndexes[0]}>
        <Segment.Group>
          <Segment clearing>
            <Form>
              <Form.Field required error={this.state.nameFieldValueError}>
                <label ref={(c) => {this.nameFieldInput = c}}>{allStrings[this.state.type]['nameFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
                  <Interweave tagName="div" content={allStrings[this.state.type]['nameFieldPopup']}/>
                </Popup></label>
                <Input maxLength='100' name='nameFieldValue' placeholder={allStrings[this.state.type]['nameFieldPlaceholder']} onChange={this.handleInputChange} defaultValue={this.state.nameFieldValue} />
              </Form.Field>

              {(this.state.type === 'event' || this.state.type === 'promo') &&
                <Form.Field>
                  <Grid stackable>
                    <Grid.Column width={5}>
                      <Form.Field required error={this.state.startDateFieldValueError}>
                        <label ref={(input) => { this.startDateFieldInput = input; }}>{allStrings[this.state.type]['startDateFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
                          <Interweave tagName="div" content={allStrings[this.state.type]['startDateFieldPopup']}/>
                        </Popup></label>
                        <DatePicker
                          selected={this.state.startDate}
                          placeholderText={moment().format('LLL')}
                          onChange={(date) => {
                            this.setState({ startDate: date });
                            if (this.state.endDate < date) {
                              this.setState({endDate: moment(date).endOf('day')});
                            }
                          }}
                          showTimeSelect
                          timeFormat='H:mm'
                          dateFormat='LLL'
                          className='dateInput'
                          startDate={this.state.startDate}
                          endDate={this.state.endDate}
                          selectsStart
                        />
                      </Form.Field>
                    </Grid.Column>
                    <Grid.Column width={5}>
                      <Form.Field required error={this.state.endDateFieldValueError}>
                        <label ref={(input) => { this.endDateFieldInput = input; }}>{allStrings[this.state.type]['endDateFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
                          <Interweave tagName="div" content={allStrings[this.state.type]['endDateFieldPopup']}/>
                        </Popup></label>
                        <DatePicker
                          selected={this.state.endDate}
                          placeholderText={moment().endOf('day').format('LLL')}
                          onChange={(date) => {
                            if (date > this.state.startDate) {
                              this.setState({endDate: date});
                            } else {
                              this.setState({endDate: moment(this.state.startDate).endOf('day')});
                            }
                          }}
                          showTimeSelect
                          locale='ru'
                          minDate={this.state.startDate}
                          dateFormat='LLL'
                          timeFormat='H:mm'
                          className='dateInput'
                          startDate={this.state.startDate}
                          endDate={this.state.endDate}
                          selectsEnd
                        />
                      </Form.Field>
                    </Grid.Column>
                  </Grid>
                </Form.Field>
              }

              <Form.Field required error={this.state.shortDescriptionFieldValueError}>
                <label ref={(c) => {this.shortDescriptionFieldInput = c}}>{allStrings[this.state.type]['shortDescriptionFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
                  <Interweave tagName="div" content={allStrings[this.state.type]['shortDescriptionFieldPopup']}/>
                </Popup></label>
                <TextArea autoHeight maxLength='200' name='shortDescriptionFieldValue' placeholder={allStrings[this.state.type]['shortDescriptionFieldPlaceholder']} onKeyDown={(e) => {
                  if (e.keyCode === 13) {
                    e.preventDefault();
                    return false
                  }
                }} onChange={this.handleInputChange} defaultValue={this.state.shortDescriptionFieldValue} />
              </Form.Field>

              {this.state.type !== 'content' && (
                <Form.Group inline>
                  <Form.Field required error={this.state.cityFieldValueError}>
                    <label ref={(c) => {this.cityFieldInput = c}}>{allStrings[this.state.type]['cityFieldLabel']}<Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
                      <Interweave tagName="div" content={allStrings[this.state.type]['cityFieldPopup']}/>
                    </Popup></label>
                  </Form.Field>
                  {
                    this.state.type === 'place'
                      ?
                        [<Form.Field key='Almaty' control={Radio} label='Алматы' error={this.state.cityFieldValueError} checked={this.state.AlmatyFieldValue} onChange={() => { this.setState({ AlmatyFieldValue: true, AstanaFieldValue: false }) }} />,
                        <Form.Field key='Astana' control={Radio} label='Астана' error={this.state.cityFieldValueError} checked={this.state.AstanaFieldValue} onChange={() => { this.setState({ AlmatyFieldValue: false, AstanaFieldValue: true }) }} />]
                      :
                      [<Form.Checkbox key='Almaty' label='Алматы' error={this.state.cityFieldValueError} onChange={() => { this.setState({AlmatyFieldValue: !this.state.AlmatyFieldValue, cityFieldValueError: false}); }} checked={this.state.AlmatyFieldValue}/>,
                    <Form.Checkbox key='Astana' label='Астана' error={this.state.cityFieldValueError} onChange={() => {this.setState({AstanaFieldValue: !this.state.AstanaFieldValue, cityFieldValueError: false})}} checked={this.state.AstanaFieldValue}/>]
                  }
                </Form.Group>
              )}

              {this.state.type !== 'product' && this.state.type !== 'content' &&
                <Form.Field required={this.state.type === 'place'} error={this.state.locationCoordinatesFieldValueError}>
                  <label ref={(c) => {this.locationFieldInput = c}}>{allStrings[this.state.type]['locationFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
                    <Interweave tagName='div' content={allStrings[this.state.type]['locationFieldPopup']}/>
                  </Popup></label>
                  <Segment.Group>
                    <Segment>
                      <Grid verticalAlign='middle' stackable>
                        <Grid.Column width={3}>
                          <Form.Field><label>Выбранное расположение</label></Form.Field>
                        </Grid.Column>
                        <Grid.Column width={13}>

                          {this.state.locationAddressFieldValue ? (
                            <span>{this.state.locationAddressFieldValue}<i>{'   (' + this.locationCoordinatesFieldValue[0] + ', ' + this.locationCoordinatesFieldValue[1] + ')'}</i></span>
                          ) : (
                            <i>Расположение не выбрано, Вы можете выбрать расположение нажав на карту ниже</i>
                          )}

                        </Grid.Column>
                      </Grid>
                    </Segment>
                    {this.state.locationAddressFieldValue &&
                      <Segment>
                        <Grid stackable>
                          <Grid.Column width={3}>
                            <Form.Field><label>Комментарий к расположению</label></Form.Field>
                          </Grid.Column>
                          <Grid.Column width={13}>
                            <Form.Input maxLength='200' name='locationCommentFieldValue' placeholder={allStrings[this.state.type]['locationCommentFieldPlaceholder']} onChange={this.handleInputChange} />
                          </Grid.Column>
                        </Grid>
                      </Segment>
                    }
                    <Segment>
                      <YMaps>
                        <Map state={{ center: this.mapCenter, zoom: 16}} options={{yandexMapDisablePoiInteractivity: true, suppressMapOpenBlock: true }} width='inherit' onClick={(e) => {
                          var coords = e.get('coords');
                          this.placemark.geometry.setCoordinates(coords);
                          this.locationCoordinatesFieldValue = coords;
                        }}
                          instanceRef={(yandexMap) => {
                            if (yandexMap) {
                              this.yandexMap = yandexMap;
                              this.yandexMapSearch = yandexMap.controls.get('searchControl');
                              this.yandexMapSearch.options.set('noPlacemark', 'true');
                              this.yandexMapSearch.events.add('resultselect', (e) => {
                                var results = this.yandexMapSearch.getResultsArray();
                                this.placemark.geometry.setCoordinates(results[e.get('index')]['geometry'].getCoordinates());
                                this.yandexMap.setCenter(results[e.get('index')]['geometry'].getCoordinates());
                                this.locationCoordinatesFieldValue = results[e.get('index')]['geometry'].getCoordinates();
                              });
                            }
                          }} >

                          <Placemark
                            geometry={{
                              type: 'Point',
                              coordinates: this.locationCoordinatesFieldValue ? this.locationCoordinatesFieldValue : this.mapCenter,
                            }}
                            options={{
                              draggable: true
                            }}
                            instanceRef={(placemark) => { this.placemark = placemark }}
                            onGeometryChange={() => {
                              this.placemark.properties.set('iconCaption', 'поиск...');
                              window.ymaps.geocode(this.placemark.geometry.getCoordinates()).then((res) => {
                                var firstGeoObject = res.geoObjects.get(0);
                                this.placemark.properties.set({
                                  iconCaption: firstGeoObject.getAddressLine(),
                                });
                                this.mapCenter = this.yandexMap.getCenter();
                                this.setState({locationAddressFieldValue: firstGeoObject.getAddressLine()});
                              });
                            }}
                          />

                        </Map>
                      </YMaps>
                    </Segment>
                  </Segment.Group>
                </Form.Field>
              }
            </Form>
          </Segment>

          {!this.props.unmoderatedPost &&
            <Segment clearing secondary>
              <Button floated='right' type='button' onClick={this.openNextSection0} animated='vertical'>
                <Button.Content visible>
                  <Icon name='arrow right' />
                </Button.Content>
                <Button.Content hidden>
                  {allStrings[this.state.type]['nextSectionButtonName']}
                </Button.Content>
              </Button>
            </Segment>
          }
        </Segment.Group>
      </Accordion.Content>
    ])
  }

  openNextSection0 = () => {
    var error = false;

    if (this.state.nameFieldValue === '') {
      this.setState({nameFieldValueError: true});
      error = true;
      scrollToComponent(this.nameFieldInput, { offset: 0, align: 'top', duration: 500})
    }
    // check dates
    if (this.state.type === 'event' || this.state.type === 'promo') {
      if (!this.state.startDate) {
        this.setState({startDateFieldValueError: true});
        if (!error) {
          error = true;
          scrollToComponent(this.startDateFieldInput, { offset: 0, align: 'top', duration: 500});
        }
      }
      if (!this.state.endDate) {
        this.setState({endDateFieldValueError: true});
        if (!error) {
          error = true;
          scrollToComponent(this.endDateFieldInput, { offset: 0, align: 'top', duration: 500})
        }
      }
    }
    if (this.state.shortDescriptionFieldValue === '') {
      this.setState({shortDescriptionFieldValueError: true});
      if (!error) {
        error = true;
        scrollToComponent(this.shortDescriptionFieldInput, { offset: 0, align: 'top', duration: 500});
      }
    }
    if (!this.state.AlmatyFieldValue && !this.state.AstanaFieldValue) {
      this.setState({cityFieldValueError: true});
      if (!error) {
        error = true;
        scrollToComponent(this.cityFieldInput, { offset: 0, align: 'top', duration: 500});
      }
    }
    // check location
    if (this.state.type === 'place' && !this.locationCoordinatesFieldValue) {
      this.setState({locationCoordinatesFieldValueError: true});
      if (!error) {
        error = true;
        scrollToComponent(this.locationFieldInput, { offset: 0, align: 'top', duration: 500});
      }
    }

    // if not error -> open next section
    if (!error) {
      this.setState({ activeSectionIndexes: {0: false, 1: true, 2: false, 3: false} });
    }
  }

  // third section - additional info (tags, links, media, description)

  renderSection1() {
    return([
      <Accordion.Title key='11' active={this.state.activeSectionIndexes[1]} index={1} onClick={this.handleSectionTitleClick}>
        <Icon name='dropdown' />
        <span style={{fontSize:'1.2em'}}><b>{allStrings[this.state.type]['section1Title']}</b></span>
      </Accordion.Title>,
      <Accordion.Content key='12' active={this.state.activeSectionIndexes[1]}>
        <Segment.Group>
          <Segment>
            <Form error={this.state.formError} warning={this.state.formWarning}>
              {this.state.mode === 'new' &&
                <Message info list={allStrings[this.state.type]['infoMessage1']} />
              }

              {this.renderLinksField()}

              {this.renderTagsField()}

              {this.renderMediaField()}

              {this.renderDescriptionField()}

              {this.state.type === 'event' && this.renderEventAdditionalInfo()}

            </Form>
          </Segment>
          {this.state.mode === 'new' &&
            <Segment clearing secondary>
              <Button floated='left' type='button' onClick={this.openPreviousSection1} animated='vertical'>
                <Button.Content visible>
                  <Icon name='arrow left' />
                </Button.Content>
                <Button.Content hidden>
                  {allStrings[this.state.type]['previousSectionButtonName']}
                </Button.Content>
              </Button>
              <Button floated='right' type='button' onClick={this.openNextSection1} animated='vertical'>
                <Button.Content visible>
                  <Icon name='arrow right' />
                </Button.Content>
                <Button.Content hidden>
                  {allStrings[this.state.type]['nextSectionButtonName']}
                </Button.Content>
              </Button>
            </Segment>
          }
        </Segment.Group>
      </Accordion.Content>
    ])
  }

  openNextSection1 = () => {
    this.setState({ activeSectionIndexes: {0: false, 1: false, 2: true, 3: false} });
  }

  openPreviousSection1 = () => {
    this.setState({ activeSectionIndexes: {0: true, 1: false, 2: false, 3: false} });
  }

  // Text editor for description

  renderDescriptionField() {
    return(
      <Form.Field>
        <label>{allStrings[this.state.type]['descriptionFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
          <Interweave tagName="div" content={allStrings[this.state.type]['descriptionFieldPopup']}/>
        </Popup></label>
        <RichTextEditor
          value={this.state.descriptionFieldValue}
          onChange={this.onChange}
          placeholder={allStrings[this.state.type]['descriptionFieldPlaceholder']}
          onFocus={this.setParentFocused}
          onBlur={this.setParentBlured}
          toolbarConfig={this.toolbarConfig}
          rootStyle={this.state.descriptionFocusedStyle}
        />
      </Form.Field>
    )
  }

  onChange = (value) => {
    this.setState({ descriptionFieldValue: value });
    if (this.props.onChange) {
      // Send the changes up to the parent component as an HTML string.
      // This is here to demonstrate using `.toString()` but in a real app it
      // would be better to avoid generating a string on each change.
      this.props.onChange(
        value.toString('html')
      );
    }
  };

  setParentFocused = () => {
    this.setState({descriptionFocusedStyle: {
      color: 'rgba(0, 0, 0, 0.95)',
      background: '#FFFFFF',
      border: '1px solid #85B7D9',
    }});
  }

  setParentBlured = () => {
    this.setState({descriptionFocusedStyle: null});
  }

  toolbarConfig = {
    // Optionally specify the groups to display (displayed in the order listed).
    display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS', 'BLOCK_TYPE_DROPDOWN', 'HISTORY_BUTTONS'],
    INLINE_STYLE_BUTTONS: [
      {label: 'Bold', style: 'BOLD'},
      {label: 'Italic', style: 'ITALIC'},
      {label: 'Underline', style: 'UNDERLINE'},
      {label: 'Strikethrough', style: 'STRIKETHROUGH'},
    ],
    BLOCK_TYPE_DROPDOWN: [
      {label: 'Обычный текст', style: 'unstyled'},
      {label: 'Заголовок', style: 'header-three'}
    ],
    BLOCK_TYPE_BUTTONS: [
      {label: 'UL', style: 'unordered-list-item', iconName: 'unordered list'},
      {label: 'OL', style: 'ordered-list-item', iconName: 'ordered list'}
    ]
  };

  // tags field

  renderTagsField() {
    return([
      <Form.Group key='tag0'>
        <Form.Field width={15} error={this.state.tagSearchFieldValueError}>
          <label>{allStrings[this.state.type]['tagFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
            <Interweave tagName="div" content={allStrings[this.state.type]['tagFieldPopup']}/>
          </Popup></label>
          <Search
            placeholder={allStrings[this.state.type]['tagFieldPlaceholder']}
            noResultsMessage='Такой тэг еще не использовался'
            loading={this.state.tagSearchIsLoading}
            onResultSelect={this.handleTagSearchResultSelect}
            onSearchChange={this.handleTagSearchChange}
            results={this.state.tagSearchResults}
            value={this.state.tagSearchFieldValue}
            ref={(s) => {this.tagSearch = s}}
            icon='tag'
            onKeyPress={e => { if (e.key === 'Enter') { this.addTag(); this.tagSearch.close() } }}
          />
        </Form.Field>
        <Form.Field>
          <label><br /></label>
          <Button type='button' onClick={this.addTag}>Добавить</Button>
        </Form.Field>
      </Form.Group>,
      <Form.Field key='tag1'>
        {
          Object.keys(this.state.tags).map((item, idx) => {
            return <Label tag key={idx}>{item}<Icon name='delete' onClick={() => {
              var currentState = this.state;
              delete currentState['tags'][item];
              this.setState(currentState);
            }} /></Label>})
        }
      </Form.Field>
    ])
  }

  addTag = () => {
    if (this.state.tagSearchFieldValue !== '') {
      var currentState = this.state;
      var tag = this.state.tagSearchFieldValue.toLowerCase().split(' ').map(function(word) {
        return word[0].toUpperCase() + word.substr(1);
      }).join(' ');
      currentState['tags'][tag] = 0;
      currentState['tagSearchFieldValue'] = '';
      this.setState(currentState);
    } else {
      this.setState({tagSearchFieldValueError: true});
    }
  }

  handleTagSearchResultSelect = (e, { result }) => {
    var currentState = this.state;
    currentState['tags'][result.title] = true;
    currentState['tagSearchFieldValue'] = '';
    this.setState(currentState);
  }

  handleTagSearchChange = (e, { value }) => {
    this.setState({ tagSearchIsLoading: true, tagSearchFieldValue: value, tagSearchFieldValueError: false });
    var results = [];
    results.push({
      title: value,
    })
    // only query string
    this.searchIndex.search({ query: value }, (err, content) => {
      if (err) {
        console.error(err);
        return;
      }
      for (var h in content.hits) {
        results.push(
          {
            title: content.hits[h].name
          }
        );
      }
      this.setState({
        tagSearchIsLoading: false,
        tagSearchResults: results
      })
    });
  }

  // links field

  renderLinksField() {
    return([
      <Form.Group key='link0'>
        <Form.Field width={15} error={this.state.linkFieldValueError}>
          <label>{allStrings[this.state.type]['linkFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
            <Interweave tagName="div" content={allStrings[this.state.type]['linkFieldPopup']}/>
          </Popup></label>
          <Input placeholder={allStrings[this.state.type]['linkFieldPlaceholder']} type='text' icon='globe' name='linkFieldValue' onChange={this.handleInputChange} value={this.state.linkFieldValue} onKeyPress={e => {if (e.key === 'Enter') {this.addLink()}}}/>
        </Form.Field>
        <Form.Field>
          <label><br /></label>
          <Button type='button' onClick={this.addLink}>Добавить</Button>
        </Form.Field>
      </Form.Group>,
      <Form.Field key='link1'>
        {
          this.state.links.map((item, idx) => {
            return <Label key={idx}>{item}<Icon name='delete' onClick={() => {
              var currentState = this.state;
              currentState['links'].splice(idx, 1);
              this.setState(currentState);
            }} /></Label>
          })
        }
      </Form.Field>
    ])
  }

  addLink = () => {
    if (this.state.linkFieldValue !== '') {
      var currentState = this.state;
      currentState['links'].push(this.state.linkFieldValue);
      currentState['linkFieldValue'] = '';
      this.setState(currentState);
    } else {
      this.setState({linkFieldValueError: true});
    }
  }

  // add media field

  renderMediaField() {
    return(
      <Form.Field>
        <label>{allStrings[this.state.type]['mediaFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
          <Interweave tagName="div" content={allStrings[this.state.type]['mediaFieldPopup']}/>
        </Popup></label>
        <style>
          {`
          .imageHeight {
            width: auto;
            height: 200px;
          }
          `}
        </style>
        {this.state.mediaPreviews.map((item, idx) => {
          return <Image className='imageHeight' spaced='right' key={idx} size='large' inline bordered src={item} label={{ corner: 'right', icon: 'delete', onClick: () => this.deleteMediaPreview(idx) }}/>
        })}
        <Button.Group vertical>
          <Button type='button' icon labelPosition='left' size='massive' onClick={() => {
            var currentState = this.state;
            currentState['isVideo'] = false;
            currentState['mediaModalOpen'] = true;
            this.setState(currentState);
          }}>
            <Icon name='plus' />
            Изображение
          </Button>
          <Button type='button' icon labelPosition='left'size='massive' onClick={() => {
            var currentState = this.state;
            currentState['mediaModalOpen'] = true;
            currentState['isVideo'] = true;
            this.setState(currentState);
          }}>
            <Icon name='plus' />
            Youtube видео
          </Button>
        </Button.Group>
      </Form.Field>
    )
  }

  setDropzoneActive = () => {
    var currentState = this.state;
    currentState['dropzoned'] = false;
    this.setState(currentState);
  }

  setDropzoneInactive = () => {
    var currentState = this.state;
    currentState['dropzoned'] = true;
    this.setState(currentState);
  }

  onDrop = (acceptedFiles, rejectedFiles) => {
    acceptedFiles.forEach(file => {
      //req.attach(file.name, file);
      // add them to list of files to display
      var currentState = this.state;
      currentState['mediaPreviews'].push(URL.createObjectURL(file));
      currentState['mediaModalOpen'] = false;
      // compress image
      // const imageCompressor = new ImageCompressor();
      // imageCompressor.compress(file, {height: 250}).then((result) => {
      //   currentState['media'].push({
      //     type: 'image',
      //     file: file,
      //     thumbFile: result
      //   });
      //   this.setState(currentState);
      // });
      // without compressing
      currentState['media'].push({
        type: 'image',
        file: file,
        thumbFile: file
      });
      this.setState(currentState);
    });
    if (rejectedFiles.length) {
      alert('К сожалению формат некоторых файлов не поддерживается')
    }
  }

  b64toBlob = (b64Data, contentType='', sliceSize=512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }

  addMediaLink = (type) => {
    var currentState = this.state;
    if (type === 'image') {
      encode(this.state.mediaLink, {local: false, string: true}, (error, image) => {
        this.setState({ mediaModalLoading: false });
        if (!error) {
          // download image from remote server
          var contentType = 'image/jpg';
          var blob = this.b64toBlob(image, contentType);
          // compress image
          // const imageCompressor = new ImageCompressor();
          // imageCompressor.compress(blob, {height: 250}).then((result) => {
          //   this.setState({ mediaModalLoading: true });
          //   currentState['media'].push({
          //     type: 'image',
          //     file : blob,
          //     thumbFile: result
          //   });
          //   currentState['mediaPreviews'].push(this.state.mediaLink);
          //   currentState['mediaLink'] = '';
          //   currentState['mediaModalOpen'] = false;
          //   this.setState(currentState);
          // });
          // without compressing
          currentState['media'].push({
            type: 'image',
            file : blob,
            thumbFile: blob
          });
          currentState['mediaPreviews'].push(this.state.mediaLink);
          currentState['mediaLink'] = '';
          currentState['mediaModalOpen'] = false;
          this.setState(currentState);
        } else {
          this.setState(currentState);
          alert("Произошла ошибка при загрузке изображения по ссылке\n" + error.message);
        }
      });
    } else {
      // check if this is youtube link
      var isYoutube = false;
      var p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
      if (this.state.mediaLink.match(p)) {
        isYoutube = this.state.mediaLink.match(p)[1];
      }
      if (isYoutube) {
        // extract video id
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        var match = this.state.mediaLink.match(regExp);
        var youtubeID = (match&&match[7].length===11)? match[7] : false;
        var thumbnailLink = 'https://img.youtube.com/vi/' + youtubeID + '/hqdefault.jpg';
        currentState['media'].push({
          type: 'youtube',
          videoID: youtubeID,
          thumbnail: thumbnailLink
        });
        currentState['mediaPreviews'].push(thumbnailLink);
        currentState['mediaLink'] = '';
        currentState['mediaModalOpen'] = false;
        this.setState(currentState);
      } else {
        this.setState(currentState);
        alert("Произошла ошибка при обработке видео, проверьте правильность ссылки");
      }
    }
  }

  deleteMediaPreview(idx) {
    var currentState = this.state;
    currentState['mediaPreviews'].splice(idx, 1);
    currentState['media'].splice(idx, 1);
    this.setState(currentState);
  }

  renderAddMediaModal() {
    return(
      <Modal onClose={() => {
        var currentState = this.state;
        currentState['mediaModalOpen'] = false;
        this.setState(currentState);
      }} open={this.state.mediaModalOpen} closeIcon>
        <Modal.Content>
          <Dimmer.Dimmable dimmed={this.state.mediaModalLoading}>
            <Dimmer active={this.state.mediaModalLoading} inverted>
              <Loader />
            </Dimmer>
            {
              !this.state.isVideo
                ? <div>
                  <Divider horizontal>загрузите медиа с устройства</Divider>
                  <Segment as={Dropzone} accept="image/jpeg, image/png, image/gif" onDrop={this.onDrop} onDragEnter={this.setDropzoneActive} onDragLeave={this.setDropzoneInactive} multiple textAlign='center' tertiary={this.state.dropzoned} disabled={this.state.dropzoned} padded='very'>
                    Перетащите файлы для загрузки в эту область, либо нажмите для вызова стандартного загрузчика
                    <br />
                    (принимаются только изображения формата .jpg, .png, .gif)
                  </Segment>
                  <Divider horizontal>или загрузите медиа по ссылке</Divider>
                </div>
                : <Divider horizontal>Введите ссылку на youtube видео</Divider>
            }
            <Input action fluid placeholder={ this.state.isVideo ? 'https://www.youtube.com/watch?v=DsuafS9sH4A' : 'https://upload.wikimedia.org/wikipedia/en/a/af/Almaty_Collage.png'} type='text' iconPosition='left' labelPosition='right' name='mediaLink' onChange={this.handleInputChange} value={this.state.mediaLink}>
              <Icon name='globe' />
              <input />
              <Button type='button' onClick={() => { this.addMediaLink(this.state.isVideo ? 'video' : 'image') }}>Добавить</Button>
            </Input>
          </Dimmer.Dimmable>
        </Modal.Content>
      </Modal>
    )
  }

  // render additional info for events
  renderEventAdditionalInfo() {
    return([
      <Form.Group key='price'>
        <Form.Field>
          <label>{allStrings[this.state.type]['priceFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
            <Interweave tagName="div" content={allStrings[this.state.type]['priceFieldPopup']}/>
          </Popup></label>
        </Form.Field>
        <Form.Field control={Radio} label={allStrings[this.state.type]['priceUnknown']} value={-1} checked={this.state.eventIsPaid == -1} onChange={this.handleEventIsPaidRadioChange} />
        <Form.Field control={Radio} label={allStrings[this.state.type]['priceFree']} value={0} checked={this.state.eventIsPaid == 0} onChange={this.handleEventIsPaidRadioChange} />
        <Form.Field control={Radio} label={allStrings[this.state.type]['pricePaid']} value={1} checked={this.state.eventIsPaid == 1} onChange={this.handleEventIsPaidRadioChange} />
      </Form.Group>,
      this.state.eventIsPaid == 1 && (
        <Form.Field key='link1'>
          <Input placeholder={allStrings[this.state.type]['priceFieldPlaceholder']} type='text' icon='money' name='priceFieldValue' onChange={this.handleInputChange} value={this.state.priceFieldValue} />
        </Form.Field>
      )
    ])
  }

  handleEventIsPaidRadioChange = (e, { value }) => {
    this.setState({ eventIsPaid: value })
  }

  // section - Hunter/Maker comment

  renderSection2() {
    return([
      <Accordion.Title key='21' active={this.state.activeSectionIndexes[2]} index={2} onClick={this.handleSectionTitleClick}>
        <Icon name='dropdown' />
        <span style={{fontSize:'1.2em'}}><b>{allStrings[this.state.type]['section2Title']}</b></span>
      </Accordion.Title>,
      <Accordion.Content key='22' active={this.state.activeSectionIndexes[2]}>
        <Segment.Group>
          <Segment>
            <Form>
              {this.state.mode !== 'editing' && (
                <section>
                  {this.state.mode === 'new' && (
                    <Message info list={allStrings[this.state.type]['infoMessage2']} />
                  )}
                  <Form.Field>
                    <label>{allStrings[this.state.type]['hunterOrMakerQuestionFieldLabel']}</label>
                  </Form.Field>
                  <Form.Field control={Radio} label={allStrings[this.state.type]['makerAnswer']} value='maker' checked={this.state.hunterOrMakerValue === 'maker'} onChange={this.handleRadioChange} />
                  <Form.Field control={Radio} label={allStrings[this.state.type]['hunterAnswer']} value='hunter' checked={this.state.hunterOrMakerValue === 'hunter'} onChange={this.handleRadioChange} />
                  <Form.Field>
                    {this.state.hunterOrMakerValue === 'maker' ? (
                      <label>{allStrings[this.state.type]['makerCommentFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
                        <Interweave tagName="div" content={allStrings[this.state.type]['makerCommentFieldPopup']}/>
                      </Popup></label>
                    ) : (
                      <label>{allStrings[this.state.type]['hunterCommentFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
                        <Interweave tagName="div" content={allStrings[this.state.type]['hunterCommentFieldPopup']}/>
                      </Popup></label>
                    )}

                    <TextArea autoHeight style={{ minHeight: 80 }} name='commentFieldValue'  placeholder={allStrings[this.state.type]['commentFieldPlaceholder']} onChange={this.handleInputChange} defaultValue={this.state.commentFieldValue} />
                  </Form.Field>
                </section>
              )}
              <Form.Field>
                <label>{allStrings[this.state.type]['makerContactsFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
                  <Interweave tagName="div" content={allStrings[this.state.type]['makerContactsFieldPopup']}/>
                </Popup></label>
                <TextArea autoHeight style={{ minHeight: 80 }} name='makerContactsFieldValue'  placeholder={allStrings[this.state.type]['makerContactsFieldPlaceholder']} onChange={this.handleInputChange} defaultValue={this.state.makerContactsFieldValue} />
              </Form.Field>

              {this.state.mode === 'new' && (
                <Form.Group inline>
                  <Form.Field>
                    <label>{allStrings[this.state.type]['publishNextDayFieldLabel']}<Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
                      <Interweave tagName="div" content={allStrings[this.state.type]['publishNextDayFieldPopup']}/>
                    </Popup></label>
                  </Form.Field>
                  <Form.Field control={Radio} label='Сразу' checked={!this.state.publishNextDayField} onChange={() => { this.setState({ publishNextDayField: false }) }} />
                  <Form.Field control={Radio} label='На следующий день' checked={this.state.publishNextDayField} onChange={() => { this.setState({ publishNextDayField: true }) }} />
                </Form.Group>
              )}

              {this.state.mode === 'new' && (
                <Popup hoverable wide='very' position='right center' trigger={<Form.Checkbox required label='Согласен с условиями пользования btw.kz' error={this.state.termsFieldValueError} onChange={() => {this.setState({termsFieldValue: !this.state.termsFieldValue, termsFieldValueError: false})}}/>} value={this.state.termsFieldValue}>
                  <div>
                    Стандартные формальности. Ознакомиться можно <Link to='/terms ' target='_blank'>тут</Link>
                  </div>
                </Popup>
              )}
            </Form>
          </Segment>
          {this.state.mode === 'new' &&
            <Segment clearing secondary>
              <Button floated='left' type='button' onClick={this.openPreviousSection2} animated='vertical'>
                <Button.Content visible>
                  <Icon name='arrow left' />
                </Button.Content>
                <Button.Content hidden>
                  {allStrings[this.state.type]['previousSectionButtonName']}
                </Button.Content>
              </Button>
              <Button floated='right' type='button' onClick={this.submitForm} primary>
                {allStrings[this.state.type]['finalSubmitButtonName']}
              </Button>
            </Segment>
          }
        </Segment.Group>
      </Accordion.Content>
    ])
  }

  openPreviousSection2 = () => {
    this.setState({ activeSectionIndexes: {0: false, 1: true, 2: false, 3: false} });
  }

  handleRadioChange = (e, { value }) => {
    this.setState({ hunterOrMakerValue: value })
  }

  submitForm = () => {

    var error = false;

    if (this.state.nameFieldValue === '') {
      this.setState({nameFieldValueError: true});
      error = true;
      this.setState({ activeSectionIndexes: {0: true, 1: true, 2: true, 3: true} });
      scrollToComponent(this.nameFieldInput, { offset: 0, align: 'top', duration: 500})
    }
    // check dates
    if (this.state.type === 'event' || this.state.type === 'promo') {
      if (!this.state.startDate) {
        this.setState({startDateFieldValueError: true});
        if (!error) {
          error = true;
          this.setState({ activeSectionIndexes: {0: true, 1: true, 2: true, 3: true} });
          scrollToComponent(this.startDateFieldInput, { offset: 0, align: 'top', duration: 500});
        }
      }
      if (!this.state.endDate) {
        this.setState({endDateFieldValueError: true});
        if (!error) {
          error = true;
          this.setState({ activeSectionIndexes: {0: true, 1: true, 2: true, 3: true} });
          scrollToComponent(this.endDateFieldInput, { offset: 0, align: 'top', duration: 500})
        }
      }
    }
    if (this.state.shortDescriptionFieldValue === '') {
      this.setState({shortDescriptionFieldValueError: true});
      if (!error) {
        error = true;
        this.setState({ activeSectionIndexes: {0: true, 1: true, 2: true, 3: true} });
        scrollToComponent(this.shortDescriptionFieldInput, { offset: 0, align: 'top', duration: 500});
      }
    }
    if (!this.state.AlmatyFieldValue && !this.state.AstanaFieldValue) {
      this.setState({cityFieldValueError: true});
      if (!error) {
        error = true;
        this.setState({ activeSectionIndexes: {0: true, 1: true, 2: true, 3: true} });
        scrollToComponent(this.cityFieldInput, { offset: 0, align: 'top', duration: 500});
      }
    }
    // check location
    if (this.state.type === 'place' && !this.locationCoordinatesFieldValue) {
      this.setState({locationCoordinatesFieldValueError: true});
      if (!error) {
        error = true;
        this.setState({ activeSectionIndexes: {0: true, 1: true, 2: true, 3: true} });
        scrollToComponent(this.locationFieldInput, { offset: 0, align: 'top', duration: 500});
      }
    }
    if (!this.state.termsFieldValue) {
      this.setState({termsFieldValueError: true});
      error = true;
    }

    // if not error -> submit
    if (!error) {
      var date = moment().utcOffset('+0600').format('DD-MM-YYYY');
      if (this.state.publishNextDayField) {
        date = moment().add(1, 'days').utcOffset('+0600').format('DD-MM-YYYY');
      }
      if (this.state.mode !== 'new') {
        date = this.state.publicationDateFieldValue.utcOffset('+0600').format('DD-MM-YYYY');
      }
      var post = {};
      if (this.state.mode === 'moderation') {
        post = this.props.unmoderatedPost;
      } else if (this.state.mode === 'editing') {
        post = this.props.editedPost;
      }
      post.name = this.state.nameFieldValue;
      post.shortDescription = this.state.shortDescriptionFieldValue;
      post.city = {
        Almaty: this.state.AlmatyFieldValue,
        Astana: this.state.AstanaFieldValue
      };
      post.links = this.state.links;
      post.media = this.state.media;
      post.tags = this.state.tags;
      post.description = this.state.descriptionFieldValue.toString('html');
      post.publicationDate = date;
      post.hunterID = this.props.user.uid;
      if (this.state.mode !== 'editing') {
        post.comment = this.state.commentFieldValue;
      }
      if (this.state.makerContactsFieldValue) {
        post.makerContacts = this.state.makerContactsFieldValue;
      }
      post.type = this.state.type;
      if (this.state.mode === 'editing' && this.state.makerIDFieldValue !== '') {
        var dd = new Date();
        post['makers'] = {[this.state.makerIDFieldValue]: dd};
      } else {
        if (this.state.hunterOrMakerValue === 'maker') {
          var d = new Date();
          post['makers'] = {[this.props.user.uid]: d};
        }
      }
      if (this.state.type !== 'product') {
        post['locationCoordinates'] = this.locationCoordinatesFieldValue;
        post['locationAddress'] = this.state.locationAddressFieldValue;
        post['locationComment'] = this.state.locationCommentFieldValue;
      }
      if (this.state.type === 'event' || this.state.type === 'promo') {
        post['startDate'] = this.state.startDate.toDate();
        post['endDate'] = this.state.endDate.toDate();
      }
      if (this.state.type === 'event') {
        post.eventIsPaid = this.state.eventIsPaid;
        if (this.state.eventIsPaid == 1) {
          post.price = this.state.priceFieldValue;
        }
      }
      if (this.state.mode === 'new') {
        NewPostActions.sendPostToModeration(post);
        this.setState({ successModalIsOpen: true });
      } else {
        post['editors'] = this.state.editors;
        post['hunterID'] = this.state.hunterID;
        if (this.state.mode === 'moderation') {
          post['id'] = this.state.postIDFieldValue;
          post['upvoteCount'] = this.state.upvoteCount;
        }
        // iterate through tags and change 0 values to upvoteCount
        var newTags = {};
        Object.keys(this.state.tags).map((item, idx) => {
          return newTags[item] = this.state.upvoteCount;
        })
        post.tags = newTags;
        if (this.state.mode === 'moderation') {
          NewPostActions.saveModeratedPost(post, this.props.unmoderatedPost);
        } else if (this.state.mode === 'editing') {
          NewPostActions.saveEditedPost(post, this.props.editedPost);
        }
        // notify parent that finished
        this.setState({ successModalIsOpen: true });
      }
    }
  }

  // success modal

  renderSuccessModal() {
    return(
      <Modal
        open={this.state.successModalIsOpen}
        closeOnDimmerClick={false}
        closeOnEscape={false}
        size='small'
        dimmer='blurring'
      >
        {this.state.mode !== 'new' ? (
          <Header icon={ !this.props.postSubmitted ? 'cloud upload' : 'check circle outline' } content={ !this.props.postSubmitted ? allStrings[this.state.type]['uploadingMessageHeader'] : allStrings[this.state.type]['moderationSuccessMessageHeader'] } />
        ) : (
          <Header icon={ !this.props.postSubmitted ? 'cloud upload' : 'check circle outline' } content={ !this.props.postSubmitted ? allStrings[this.state.type]['uploadingMessageHeader'] : allStrings[this.state.type]['successMessageHeader'] } />
        )}
        <Modal.Content>
          <Progress percent={this.props.uploadProgress} progress autoSuccess>Загрузка медиафайлов</Progress>
          {
            this.props.postSubmitted && this.state.mode === 'new'
              ?
                <Interweave tagName="div" content={allStrings[this.state.type]['successMessageContent']}/>
              :
            null
          }
        </Modal.Content>
        <Modal.Actions>
          { this.state.mode === 'new' ? (
            <Button primary disabled={!this.props.postSubmitted} onClick={() => {this.props.history.push('/')}} inverted>
              На главную
            </Button>
          ) : (
            <Button primary disabled={!this.props.postSubmitted} onClick={this.props.finished} inverted>
              Назад
            </Button>
          ) }
        </Modal.Actions>
      </Modal>
    )
  }

  // admin section for date and id

  renderAdminFields() {
    return([
      <Accordion.Title key='21' active={this.state.activeSectionIndexes[3]} index={3} onClick={this.handleSectionTitleClick}>
        <Icon name='dropdown' />
      <span style={{fontSize:'1.2em'}}><b>{allStrings[this.state.type]['dateAndIDSectionTitle']}</b></span>
      </Accordion.Title>,
      <Accordion.Content key='22' active={this.state.activeSectionIndexes[3]}>
        <Segment>
          <Form>
            <Form.Field>
              <label ref={(c) => {this.postIDFieldInput = c}}>Post ID/URL</label>
              <Input name='postIDFieldValue' onChange={this.handleInputChange} defaultValue={this.state.postIDFieldValue} />
            </Form.Field>
            <Form.Field>
              <label ref={(input) => { this.publicationDateFieldInput = input; }}>Дата публикации</label>
              <DatePicker
                selected={this.state.publicationDateFieldValue}
                highlightDates={[moment()]}
                placeholderText='20 января 2018 г., 12:30'
                onChange={(date) => { this.setState({publicationDateFieldValue: date});}}
                locale='ru'
                dateFormat='LLL'
                className='dateInput'
              />
            </Form.Field>
            <Form.Field>
              <label ref={(c) => {this.authorFieldInput = c}}>Сменить автора поста</label>
              <Dropdown
                placeholder='Выберите ID автора'
                selection
                options={[
                  { value: this.props.unmoderatedPost ? this.props.unmoderatedPost.hunterID : this.props.editedPost.hunterID, text: 'Оставить как есть' },
                  { value: '83kYwJwX1HTlTFXhdYGkxm18Rtk2', text: 'Azamat Koptleuov' },
                  { value: 'FjhVkknrtlQO9KXJpnczsQInZEw1', text: 'Kanat Zhaksybekov' },
                  { value: 'HCxKfES35Qb07MOOELUgPA0KbIj1', text: 'Zhenya Ismailova' },
                  { value: 'PkZMIB10cAaYltZXQUJsvW9hKYs1', text: 'Kuanysh Bekbolatov' },
                  { value: 'PpKB8jmgfmOfGaBtr8SN9X5i1ma2', text: 'Karim Yussupov' },
                  { value: 'Qcd6NX3F9JUEHHkbfChtxL1fDjT2', text: 'Zhanel Meirambek' },
                  { value: 'iBEhE0ZoCbgALQTYjReNyVggfPz2', text: 'Samal Zhunussova' },
                  { value: 'kMroZQFmD7U9EQEwy19COLuYml42', text: 'Anton Kalkin' },
                  { value: 'vYizwWaraVO1qoazWUwsqMkleX43', text: 'Ira Afonyeva' },
                  { value: 'zbUs2ZW3CMcSGKsObcFZFzD0frA2', text: 'Aleksandr Bakhmutov' }
                ]}
                value={this.state.hunterID} onChange={(event, data) => {
                  this.setState({ hunterID: data.value })
                }}
              />
            </Form.Field>
            <Form.Field>
              <label ref={(c) => {this.makerFieldInput = c}}>Сменить мейкера поста</label>
              <Input name='makerIDFieldValue' onChange={this.handleInputChange} defaultValue={this.state.makerIDFieldValue} />
            </Form.Field>
            <Form.Field>
              <label ref={(c) => {this.moderatorFieldInput = c}}>Добавить редактора в пост</label>
              <Dropdown placeholder='Выберите ID модератора'
                selection
                options={[
                  { value: null, text: '...' },
                  { value: '83kYwJwX1HTlTFXhdYGkxm18Rtk2', text: 'Azamat Koptleuov' },
                  { value: 'FjhVkknrtlQO9KXJpnczsQInZEw1', text: 'Kanat Zhaksybekov' },
                  { value: 'HCxKfES35Qb07MOOELUgPA0KbIj1', text: 'Zhenya Ismailova' },
                  { value: 'PkZMIB10cAaYltZXQUJsvW9hKYs1', text: 'Kuanysh Bekbolatov' },
                  { value: 'PpKB8jmgfmOfGaBtr8SN9X5i1ma2', text: 'Karim Yussupov' },
                  { value: 'Qcd6NX3F9JUEHHkbfChtxL1fDjT2', text: 'Zhanel Meirambek' },
                  { value: 'iBEhE0ZoCbgALQTYjReNyVggfPz2', text: 'Samal Zhunussova' },
                  { value: 'kMroZQFmD7U9EQEwy19COLuYml42', text: 'Anton Kalkin' },
                  { value: 'vYizwWaraVO1qoazWUwsqMkleX43', text: 'Ira Afonyeva' },
                  { value: 'zbUs2ZW3CMcSGKsObcFZFzD0frA2', text: 'Aleksandr Bakhmutov' }
                ]}
                value={Object.keys(this.state.editors)[0]}
                onChange={(event, data) => {
                  this.setState({editors: {[data.value]: true}})
                }}/>
            </Form.Field>
            { this.state.mode === 'moderation' && (
              <Form.Field>
                <label ref={(c) => { this.randomLikes = c; }}>Рандомные лайки от модераторов</label>
                <Rating icon='heart' defaultRating={this.state.upvoteCount} maxRating={10} clearable onRate={(e, { rating, maxRating }) => {
                  this.setState({ upvoteCount: rating })
                }} />
              </Form.Field>
            )}
          </Form>
        </Segment>
      </Accordion.Content>
    ])
  }

  // component's main render function

  render() {
    return (
      <Container>
        <Helmet>
          <title>Добавление нового поста | btw.kz</title>
          <meta name='description' content='Краудсорсинговый информационный портал' />
          <meta property='og:image' content='https://firebasestorage.googleapis.com/v0/b/btw-kz.appspot.com/o/logo-square-1024.png?alt=media&token=7c0b442b-ac8f-4779-9da7-2fb1228a2e89' />
        </Helmet>
        {this.renderAddMediaModal()}
        <style>
          {`.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list {
            padding-left: 0;
            padding-right: 0;
          }
          .dateInput {
            min-width:110%!important;
          }`}
        </style>
        <Header as='h2'>
          <Icon name='plus' />
          {this.state.mode !== 'new' ? (
            <Header.Content>
              Тип поста -
              {' '}
              <Dropdown inline header='тип поста' options={[{ value: 'product', icon: iconForType('product'), text: nameForType('product'), content: nameForType('product', true) }, { value: 'event', icon: iconForType('event'), text: nameForType('event'), content: nameForType('event', true) }, { value: 'place', icon: iconForType('place'), text: nameForType('place'), content: nameForType('place', true) }, { value: 'promo', icon: iconForType('promo'), text: nameForType('promo'), content: nameForType('promo', true) }, { value: 'content', icon: iconForType('content'), text: nameForType('content'), content: nameForType('content', true) }]} value={ this.state.type } onChange={(event, data) => {
                this.setState({type: data.value});
                }}/>
              </Header.Content>
              ) : (
                <Header.Content>
                  Добавить
                  {' '}
                  <Dropdown inline header='тип поста' options={[{ value: 'product', icon: iconForType('product'), text: allStrings['product']['mainHeader'], content: nameForType('product', true) }, { value: 'event', icon: iconForType('event'), text: allStrings['event']['mainHeader'], content: nameForType('event', true) }, { value: 'place', icon: iconForType('place'), text: allStrings['place']['mainHeader'], content: nameForType('place', true) }, { value: 'promo', icon: iconForType('promo'), text: allStrings['promo']['mainHeader'], content: nameForType('promo') }, { value: 'content', icon: iconForType('content'), text: allStrings['content']['mainHeader'], content: nameForType('content') }]} value={ this.state.type } onChange={(event, data) => {
                    this.setState({type: data.value});
                    if (this.state.AlmatyFieldValue === this.state.AstanaFieldValue) {
                      this.setState({AstanaFieldValue: !this.state.AlmatyFieldValue})
                    }
                    if (data.value === 'content') {
                      this.setState({AstanaFieldValue: true, AlmatyFieldValue: true})
                    }
                    this.props.history.push('/new/' + data.value);
                    }} />
                  </Header.Content>
                  )}
                </Header>
                {this.state.mode === 'new' &&
                  <Message info list={allStrings[this.state.type]['infoMessage']} />
                }
                <Accordion fluid exclusive={false}>
                  {this.renderSection0()}
                  {this.renderSection1()}
                  {this.renderSection2()}
                  {this.state.mode !== 'new' &&
                    this.renderAdminFields()
                  }
                </Accordion>
                <br />
                {this.state.mode === 'moderation' &&
                  <Button.Group>
                    <Button negative onClick={() => {
                      NewPostActions.deleteUnmoderatedPost(this.props.unmoderatedPost);
                      this.props.finished();
                    }} >Удалить</Button>
                    <Button.Or />
                    <Button positive onClick={() => {this.submitForm()}}>
                      Опубликовать
                    </Button>
                  </Button.Group>
                }
                {this.state.mode === 'editing' &&
                  <Button.Group>
                    <Button onClick={() => {this.props.finished();}}>
                      Отменить изменения
                    </Button>
                    <Button.Or />
                    <Button negative onClick={() => {
                      NewPostActions.deletePost(this.props.editedPost);
                      this.props.finished();
                    }}>Удалить полностью пост</Button>
                    <Button.Or />
                    <Button positive onClick={() => {this.submitForm()}}>
                      Опубликовать изменения
                    </Button>
                  </Button.Group>
                }
                {this.renderSuccessModal()}
              </Container>
    );
  }
}

export default NewPostPage;
