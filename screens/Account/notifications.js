/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, FlatList, RefreshControl, Dimensions, TouchableOpacity, ToastAndroid, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { API, IMAGE_SIZE, PADDING, WEB } from '../../tools/constants';
import { AuthContext } from '../../contexts/AuthContext';
import { getTranslationKeyFromAlias, groupNotificationsGlobally } from '../../utils/notificationMapper';
import NotificationItemComponent from '../../components/notification_item';
import EmptyListComponent from '../../components/empty_list';
import HeaderComponent from '../header';
import homeStyles from '../style';
import useColors from '../../hooks/useColors';

const NotificationsScreen = () => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Get contexts ===============
  const { userInfo } = useContext(AuthContext);
  // =============== Get data ===============
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const [combinedNotifications, setCombinedNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef(null);

  const mHeaders = {
    'X-localization': 'fr',
    'X-user-id': userInfo.id,
    'Authorization': `Bearer ${userInfo.api_token}`
  };

  // =============== Handle "scroll top" button ===============
  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    const isAtTop = contentOffset.y === 0;

    setShowBackToTop(!isAtTop);
  };

  const scrollToTop = () => {
    flatListRef.current.scrollToOffset({ offset: 0, animated: true });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchRecentNotifications();
    await fetchOldNotifications(1);
    setRefreshing(false);
  };

  const onEndReached = () => {
    if (!isLoading && page < lastPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchOldNotifications(nextPage);
    }
  };

  // =============== Load real-time notifications ===============
  const fetchRecentNotifications = async () => {
    setIsLoading(true);

    try {
      const response = await axios.get(`${API.boongo_url}/notification/select_by_status_user/23/${userInfo.id}`, { headers: mHeaders });
      const grouped = groupNotificationsGlobally(response.data.data);

      setNotifications(grouped);
    } catch (error) {
      console.error('Erreur lors du fetch des notifications récentes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // =============== Load old paginated notifications (optional if you want infinite scroll) ===============
  const fetchOldNotifications = async (pageToFetch = 1) => {
    try {
      const response = await axios.get(`${API.boongo_url}/read_notification/select_by_user/${userInfo.id}?page=${pageToFetch}`, { headers: mHeaders });

      if (pageToFetch === 1) {
        setReadNotifications(response.data.data);

      } else {
        setReadNotifications(prev => [...prev, ...response.data.data]);
      }

      setLastPage(response.data.lastPage);
      setCount(response.data.count);
    } catch (error) {
      console.error('Erreur lors du fetch des notifications lues:', error);
    }
  };

  // =============== Handle on notification press ===============
  const handleNotificationPress = async (item) => {
    const isUnread = !item.text_content; // ⬅️ Unread notifications do not have "text_content"

    let redirectScreen = '';
    let redirectURL = '';
    let redirectParams = {};
    let translationKey = '';

    // === If the notification is NOT read ===
    if (isUnread) {
      // Determines the entity (useful for generating the translation key)
      let entity = null;

      if (['subscription_notif', 'work_consultation_notif', 'liked_work_notif', 'liked_message_notif'].includes(item.type.alias)) {
        entity = item.group_entity || 'one';

      } else if (item.circle_id) {
        entity = 'circle';

      } else if (item.event_id) {
        entity = 'event';
      }

      // Translate key
      translationKey = getTranslationKeyFromAlias(item.type.alias, entity);

      // Determine redirection
      if (item.work_id || item.like_id) {
        redirectScreen = 'WorkData';
        redirectParams = { itemId: item.work_id || item.id };
        redirectURL = `${WEB.boongo_url}/works/${item.work_id}`;

      } else if (item.event_id) {
        redirectScreen = 'Event';
        redirectParams = { event_id: item.event_id };
        redirectURL = `${WEB.boongo_url}/events/${item.event_id}`;

      } else if (item.circle_id) {
        redirectScreen = 'ChatEntity';
        redirectURL = `${WEB.boongo_url}/messages/${item.circle_id}`;

      } else {
        redirectScreen = 'Account';
        redirectURL = `${WEB.boongo_url}/account`;
      }

      // ✅ Adds a safety feature in case redirectScreen is always empty
      if (!redirectScreen) {
        redirectScreen = 'Account';
        redirectURL = `${WEB.boongo_url}/account`;
      }

      // 🔁 Mark as read and send `text_content`, `screen`, `redirect_url`
      try {
        await axios.put(`${API.boongo_url}/notification/switch_status/${item.id}/23`, { text_content: translationKey, screen: redirectScreen, redirect_url: redirectURL, }, { headers: mHeaders });

        // After marking as successfully read
        setNotifications((prev) => prev.filter((n) => n.id !== item.id));

        // Reloads page 1 of read notifications (option 1: cleaner but a bit slower)
        fetchOldNotifications(1);
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la notification:', error);
      }
    }

    // === Redirection ===
    if (isUnread) {
      // We use what we determined above
      try {
        navigation.navigate(redirectScreen, redirectParams);
      } catch (error) {
        ToastAndroid.show(`Erreur navigation vers « ${redirectScreen} » ${error}`);
        console.warn('Erreur navigation vers', redirectScreen, error);
        navigation.navigate('Account'); // fallback
      }

    } else {
      // 🔁 Notification already read → use screen directly
      if (item.screen === 'WorkData') {
        navigation.navigate('WorkData', { itemId: item.entity_id });

      } else if (item.screen === 'Event') {
        navigation.navigate('Event', { event_id: item.entity_id });

      } else if (item.screen === 'ChatEntity') {
        navigation.navigate('ChatEntity');

      } else {
        navigation.navigate(item.screen || 'Account');
      }
    }
  };

  useEffect(() => {
    fetchRecentNotifications();
  }, []);

  useEffect(() => {
    const merged = [...notifications, ...readNotifications];

    setCombinedNotifications(merged);
  }, [notifications, readNotifications]);

  return (
    <>
      {/* Header */}
      <View style={{ paddingVertical: PADDING.p01, backgroundColor: COLORS.white }}>
        <HeaderComponent title={t('navigation.notification')} />
      </View>

      {/* Content */}
      <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
        {showBackToTop && (
          <TouchableOpacity style={[homeStyles.floatingButton, { backgroundColor: COLORS.warning }]} onPress={scrollToTop}>
            <Icon name='chevron-double-up' size={IMAGE_SIZE.s07} style={{ color: 'black' }} />
          </TouchableOpacity>
        )}

        <SafeAreaView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={[homeStyles.cardEmpty, { height: Dimensions.get('window').height - 40, marginLeft: 0, paddingHorizontal: 2 }]}>
            <FlatList
              ref={flatListRef}
              data={combinedNotifications}
              keyExtractor={(item, index) => `${item.id || 'no-id'}-${index}`}
              renderItem={({ item }) => (<NotificationItemComponent item={item} onPress={handleNotificationPress} />)}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              onEndReached={onEndReached}
              onEndReachedThreshold={0.1}
              scrollEventThrottle={16}
              contentContainerStyle={{ paddingTop: 40 }}
              windowSize={10}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} progressViewOffset={0} />}
              ListEmptyComponent={<EmptyListComponent iconName='bell-outline' title={t('empty_list.title')} description={t('empty_list.title')} />}
              ListFooterComponent={() =>
                isLoading ? (
                  <Text style={{ color: COLORS.black, textAlign: 'center', padding: PADDING.p01 }}>{t('loading')}</Text>
                ) : null
              }
            />
          </View>
        </SafeAreaView>
      </View>
    </>
  )
}

export default NotificationsScreen