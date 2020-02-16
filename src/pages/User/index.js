import React, { Component } from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import PropsTypes from 'prop-types';

import api from '../../services/api';
import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
  Loading,
} from './styles';

export default class User extends Component {
  state = {
    stars: [],
    page: 1,
    loading: true,
    refreshing: false,
  };

  static propTypes = {
    navigation: PropsTypes.shape({
      getParam: PropsTypes.func,
      navigate: PropsTypes.func,
    }).isRequired,
  };

  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  async componentDidMount() {
    this.loadMoreStars();
  }

  loadMoreStars = async (page = 1, refreshing = false) => {
    const { navigation } = this.props;
    const { stars } = this.state;
    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred`, {
      params: {
        page,
      },
    });

    this.setState({
      stars: refreshing ? response.data : [...stars, ...response.data],
      loading: false,
      page,
    });
  };

  render() {
    const { navigation } = this.props;
    const { stars, page, loading, refreshing } = this.state;
    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading ? (
          <Loading>
            <ActivityIndicator size={36} color="#7159c1" />
          </Loading>
        ) : (
          <Stars
            data={stars}
            keyExtractor={s => String(s.id)}
            onEndReachedThreshold={0.2}
            onEndReached={() => this.loadMoreStars(page + 1)}
            onRefresh={() => this.loadMoreStars(1, true)}
            refreshing={refreshing}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Repository', { repository: item })
                }
              >
                <Starred>
                  <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                  <Info>
                    <Title>{item.name}</Title>
                    <Author>{item.owner.login}</Author>
                  </Info>
                </Starred>
              </TouchableOpacity>
            )}
          />
        )}
      </Container>
    );
  }
}
