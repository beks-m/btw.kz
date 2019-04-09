import React, { Component } from 'react';
import { Container, Segment, Header, Icon, Divider, Image, List } from 'semantic-ui-react';
import ReactGA from 'react-ga';
import { iconForType, nameForType } from '../utils/contentFunctions';
import { Helmet } from 'react-helmet';

class AboutPage extends Component {

  constructor(props) {
    super(props);
    ReactGA.pageview(window.location.pathname, 'About page');
  }


  render() {
    return (
      <Container>
        <Helmet>
          <title>О проекте | btw.kz</title>
          <meta name='description' content='Краудсорсинговый информационный портал' />
          <meta property='og:image' content='https://firebasestorage.googleapis.com/v0/b/btw-kz.appspot.com/o/logo-square-1024.png?alt=media&token=7c0b442b-ac8f-4779-9da7-2fb1228a2e89' />
        </Helmet>
        <br />
        <Image fluid rounded src='img/banner.jpg' alt='btw.kz'/>
        <Segment>
          <Container text textAlign='justified'>

            <Divider hidden />

            <Header size='medium' dividing>
              Что такое btw.kz?
            </Header>
            <p>Во первых мы за унификацию используемых слов и произношения, так что начнем с того как это произносится. Произносится "бэтэвэ-кейзэд", также можно называть "By the way".</p>

            <p>Так что же это? Наверное Вы уже поняли и сформулировали у себя в голове, что btw.kz - это краудсорсинговый информационный портал (возможно, еще не сформулировалось), и это на самом деле так. Концепция сайта проста, она похожа на реддит, продактхант и хабрахабру - одни пользователи добавляют посты, а другие их лайкают. Пост с самым большим количеством лайков появляется наверху, посты с меньшими количествами - внизу. Концепция удобна тем, что пользователи заходя на сайт видят сперва лучший контент за последний день, и только если у них много времени, могут доскролить до постов, кому никто еще не захотел поставить лайк. Посты представляют собой запуски новых продуктов, открытых мест, проходящих событий актуального для одного из городов (Алматы/Астана), действующих акции и интересного контента. Посты группируются на главной по датам и могут относиться к 5 категориям:</p>
            <List>
              <List.Item>
                <List.Icon name={iconForType('product')} />
                <List.Content>
                  <List.Header>{nameForType('product')}</List.Header>
                  <List.Description>Продукты любого рода - веб платформы, мобильные приложения, банковские депозиты, телеком тарифы, деревянные столы, книги, рэп альбом, социальные ролики, тренинги, фильмы... </List.Description>
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Icon name={iconForType('event')} />
                <List.Content>
                  <List.Header>{nameForType('event')}</List.Header>
                  <List.Description>Мероприятия с конкретной датой проведения - премьера фильма, digital конференция, мастеркласс по готовке стейков, соревнование по боулингу, ярмарка, митап, концерт, вылазка на природу... </List.Description>
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Icon name={iconForType('place')} />
                <List.Content>
                  <List.Header>{nameForType('place')}</List.Header>
                  <List.Description>Новые места - кафе, рестораны, магазины, общественные пространства, кросфит залы, библиотеки, салоны красоты, бизнес центры, химчистки... </List.Description>
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Icon name={iconForType('promo')} />
                <List.Content>
                  <List.Header>{nameForType('promo')}</List.Header>
                  <List.Description>Акции, скидки - ночь скидок, второе кофе в подарок при оплате мастер кард, кибер понедельник, распродажа в честь открытия, приведи друга...   </List.Description>
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Icon name={iconForType('content')} />
                <List.Content>
                  <List.Header>{nameForType('content')}</List.Header>
                  <List.Description>Контент любого рода, произведенный в Казахстане. Начиная от больших и значимых, как фильмы, музыкальные альбомы до юмористических короткометражек и резонансных блог постов... </List.Description>
                </List.Content>
              </List.Item>
            </List>

            <Divider hidden />

            <Header size='medium' dividing>
              Для чего он?
            </Header>
            <p>Для создания специфично-универсального информационного портал городов Алматы и Астана (для начала) и построения вокруг этого комьюнити из неравнодушных предприимчивых людей.
            Вещи тут публикуются в основном позитивные, например как открытие каких-то новых мест, объявлении о проведении мероприятии, запуск каких-то продуктов. Как бы в городе постоянно происходит много чего интересного, есть какая-то инфа об этом на разных новостных сайтах, в соц сетях, но хотелось бы эту всю инфу структурировать и систематизировать. Чтобы была площадка, где можно посмотреть, какие новые интересные места открылись за последние дни, какие ивенты планируются, какие новые инновационные продукты запустили банки, какие акции и скидки проводятся в городе.</p>

            <p>В будущем надеемся, что наличие такого ресурса создаст созидательную атмосферу и чувство наличия в городе огромного количества предприимчивых/креативных/творческих людей и подстегнет других на развитие себя и запуск своих проектов. Например, человек зайдет на btw.kz, увидит, что за сегодня только открылось три шашлычных в городе,  как бэ люди не сидят на месте, двигаются, что-то делают, и этот человек вдохновится открыть свой центр для проведения юзабилити исследовании диджитал продуктов <span role="img" aria-label="sorry">🤷‍</span>. Ему хорошо, город развивается и на нашем сайте будет новый пост - всем одни плюсы.</p>

            <Divider hidden section/>
            <Divider hidden section/>

            <Container text textAlign='right'>
              <Segment padded='very' compact inverted floated='right' textAlign='center'>
                <Header size='huge'>
                  <Icon name='coffee' fitted />
                  <Header.Content>
                    btw.kz
                  </Header.Content>
                </Header>
              </Segment>
              <Divider hidden />
              <b>Искренне с надеждами,
                <Divider fitted hidden />
                Команда btw.kz
              </b>
              <Divider fitted hidden />
            </Container>

            <Divider hidden section/>

          </Container>
        </Segment>



        <Divider hidden />
        <Divider hidden />
        <Divider hidden />
        <Divider hidden />
      </Container>
    );
  }
}

export default AboutPage;
