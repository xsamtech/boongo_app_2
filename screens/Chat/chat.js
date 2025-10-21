/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, RefreshControl, Animated, Dimensions, SafeAreaView, TextInput } from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import { useNavigation, useRoute } from '@react-navigation/native';
import useColors from '../../hooks/useColors';
import { useTranslation } from 'react-i18next';
import HeaderComponent from '../header';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { AuthContext } from '../../contexts/AuthContext';
import axios from 'axios';
import homeStyles from '../style';
import { API, IMAGE_SIZE, PADDING } from '../../tools/constants';
import EntityItemComponent from '../../components/entity_item';
import EmptyListComponent from '../../components/empty_list';

const MembersTab = ({ handleScroll, showBackToTop, listRef, doc_title, doc_page, doc_note }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Get contexts ===============
  const { userInfo } = useContext(AuthContext);
  // =============== Get data ===============
  const [addressees, setAddressees] = useState([]);
  const [ad, setAd] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [count, setCount] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = listRef || useRef(null);

  // Fetch data from API
  const fetchSearchData = async (searchTerm) => {
    if (isLoading) return;
    setIsLoading(true);

    const qs = require('qs');

    const params = {
      data: searchTerm,
      'categories_ids[0]': 2,
      'categories_ids[1]': 4,
      'categories_ids[2]': 5,
    };

    try {
      const response = await axios.post(
        `${API.boongo_url}/user/search`,
        qs.stringify(params, { arrayFormat: 'brackets' }), // 👈 key here
        {
          headers: {
            'X-localization': 'fr',
            'Authorization': `Bearer ${userInfo.api_token}`,
            'X-user-id': userInfo.id,
            'Content-Type': 'application/x-www-form-urlencoded', // consistent
          },
        }
      );

      setAddressees(response.data.data);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search event
  const handleSearch = (text) => {
    setInputValue(text);
    fetchSearchData(text);
  };

  const fetchAddressees = async (pageToFetch = 1) => {
    if (isLoading || pageToFetch > lastPage) return;

    setIsLoading(true);

    const url = `${API.boongo_url}/user/find_by_role/Membre?page=${pageToFetch}`;
    const mHeaders = {
      'X-localization': 'fr',
      'Authorization': `Bearer ${userInfo.api_token}`,
      'X-user-id': `${userInfo.id}`
    };

    try {
      const response = await axios.get(url, { headers: mHeaders });

      if (pageToFetch === 1) {
        setAddressees(response.data.data);

      } else {
        setAddressees(prev => [...prev, ...response.data.data]);
      }

      setAd(response.data.ad);
      setLastPage(response.data.lastPage);
      setCount(response.data.count);
    } catch (error) {
      if (error.response?.status === 429) {
        console.warn("Trop de requêtes envoyées. Attendez avant de réessayer.");
      } else {
        console.warn(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToTop = () => {
    flatListRef.current.scrollToOffset({ offset: 0, animated: true });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchAddressees(1);
    setRefreshing(false);
  };

  const onEndReached = () => {
    if (!isLoading && page < lastPage) {
      const nextPage = page + 1;

      setPage(nextPage); // Update the page
    }
  };

  const combinedData = [...addressees];

  if (ad) {
    combinedData.push({ ...ad, realId: ad.id, id: 'ad' });
  }

  useEffect(() => {
    fetchAddressees(1); // Initial loading
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchAddressees(page);
    }
  }, [page]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
      {showBackToTop && (
        <TouchableOpacity style={[homeStyles.floatingButton, { bottom: 30, backgroundColor: COLORS.warning }]} onPress={scrollToTop}>
          <Icon name='chevron-double-up' size={IMAGE_SIZE.s09} style={{ color: 'black' }} />
        </TouchableOpacity>
      )}
      <SafeAreaView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[homeStyles.cardEmpty, { height: Dimensions.get('window').height, marginLeft: 0, paddingHorizontal: 2 }]}>
          {/* Search bar */}
          <View style={[homeStyles.searchContainer, { marginTop: 48, backgroundColor: COLORS.white }]}>
            <View style={homeStyles.searchInput}>
              <TextInput placeholder={t('search')} placeholderTextColor={COLORS.black} onChangeText={handleSearch} style={[homeStyles.searchInputText, { color: COLORS.black, borderColor: COLORS.dark_secondary, marginHorizontal: 0 }]} />
              <TouchableOpacity style={[homeStyles.searchInputSubmit, { borderColor: COLORS.dark_secondary }]} onPress={() => fetchSearchData(inputValue)}>
                <FontAwesome6 name='magnifying-glass' size={IMAGE_SIZE.s04} color={COLORS.black} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Users List */}
          <Animated.FlatList
            ref={flatListRef}
            data={combinedData}
            keyExtractor={(item, index) => `${item.id || 'no-id'}-${index}`}
            renderItem={({ item }) => (
              <EntityItemComponent
                item={item}
                entity='user'
                entity_id={item.id}
                entity_name={`${item.firstname} ${item.lastname}`}
                entity_profile={item.avatar_url}
                doc_title={doc_title}
                doc_page={doc_page}
                doc_note={doc_note}
              />
            )}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.1}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingTop: 0 }}
            windowSize={10}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                progressViewOffset={-30}
              />
            }
            contentInset={{ top: 0 }}
            contentOffset={{ y: 0 }}
            ListEmptyComponent={
              <EmptyListComponent
                iconName='account-outline'
                title={t('empty_list.title')}
                description={t('empty_list.description_chat_user')}
              />
            }
            ListFooterComponent={() =>
              isLoading ? (
                <Text style={{ color: COLORS.black, textAlign: 'center', padding: PADDING.p01 }}>{t('loading')}</Text>
              ) : null
            }
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const CirclesTab = ({ handleScroll, showBackToTop, listRef, doc_title, doc_page, doc_note }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Get contexts ===============
  const { userInfo } = useContext(AuthContext);
  // =============== Get data ===============
  const [circles, setCircles] = useState([]);
  const [ad, setAd] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [count, setCount] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = listRef || useRef(null);

  // Fetch data from API
  const fetchSearchData = async (searchTerm) => {
    if (isLoading) return;

    setIsLoading(true);

    const qs = require('qs');
    const params = {
      data: searchTerm
    };

    try {
      const response = await axios.post(
        `${API.boongo_url}/circle/search`,
        qs.stringify(params, { arrayFormat: 'brackets' }), // 👈 key here
        {
          headers: {
            'X-localization': 'fr',
            'Authorization': `Bearer ${userInfo.api_token}`,
            'X-user-id': userInfo.id,
            'Content-Type': 'application/x-www-form-urlencoded', // consistent
          },
        }
      );

      setAddressees(response.data.data);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search event
  const handleSearch = (text) => {
    setInputValue(text);
    fetchSearchData(text);
  };

  const fetchCircles = async (pageToFetch = 1) => {
    if (isLoading || pageToFetch > lastPage) return;

    setIsLoading(true);

    const qs = require('qs');
    const url = `${API.boongo_url}/user/member_groups/circle/${userInfo.id}/15?page=${pageToFetch}`;
    const mHeaders = {
      'X-localization': 'fr',
      'Authorization': `Bearer ${userInfo.api_token}`
    };

    try {
      const response = await axios.get(url, { headers: mHeaders });

      if (pageToFetch === 1) {
        setCircles(response.data.data);

      } else {
        setCircles(prev => [...prev, ...response.data.data]);
      }

      setAd(response.data.ad);
      setLastPage(response.data.lastPage);
      setCount(response.data.count);
    } catch (error) {
      if (error.response?.status === 429) {
        console.warn("Trop de requêtes envoyées. Attendez avant de réessayer.");
      } else {
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToTop = () => {
    flatListRef.current.scrollToOffset({ offset: 0, animated: true });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchCircles(1);
    setRefreshing(false);
  };

  const onEndReached = () => {
    if (!isLoading && page < lastPage) {
      const nextPage = page + 1;

      setPage(nextPage); // Update the page
    }
  };

  const combinedData = [...circles];

  if (ad) {
    combinedData.push({ ...ad, realId: ad.id, id: 'ad' });
  }

  useEffect(() => {
    fetchCircles(1); // Initial loading
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchCircles(page);
    }
  }, [page]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
      {showBackToTop && (
        <TouchableOpacity style={[homeStyles.floatingButton, { backgroundColor: COLORS.warning }]} onPress={scrollToTop}>
          <Icon name='chevron-double-up' size={IMAGE_SIZE.s09} style={{ color: 'black' }} />
        </TouchableOpacity>
      )}
      <TouchableOpacity style={[homeStyles.floatingButton, { bottom: 30, backgroundColor: COLORS.success }]}>
        <Icon name='plus' size={IMAGE_SIZE.s07} style={{ color: 'white' }} />
      </TouchableOpacity>

      <SafeAreaView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[homeStyles.cardEmpty, { height: Dimensions.get('window').height, marginLeft: 0, paddingHorizontal: 2 }]}>
          {/* Search bar */}
          <View style={[homeStyles.searchContainer, { marginTop: 48, backgroundColor: COLORS.white }]}>
            <View style={homeStyles.searchInput}>
              <TextInput placeholder={t('search')} placeholderTextColor={COLORS.black} onChangeText={handleSearch} style={[homeStyles.searchInputText, { color: COLORS.black, borderColor: COLORS.dark_secondary, marginHorizontal: 0 }]} />
              <TouchableOpacity style={[homeStyles.searchInputSubmit, { borderColor: COLORS.dark_secondary }]} onPress={() => fetchSearchData(inputValue)}>
                <FontAwesome6 name='magnifying-glass' size={IMAGE_SIZE.s04} color={COLORS.black} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Circles List */}
          <Animated.FlatList
            ref={flatListRef}
            data={combinedData}
            keyExtractor={(item, index) => `${item.id || 'no-id'}-${index}`}
            renderItem={({ item }) => (
              <EntityItemComponent
                item={item}
                entity='circle'
                entity_id={item.id}
                entity_name={item.circle_name}
                entity_profile={item.profile_url}
                doc_title={doc_title}
                doc_page={doc_page}
                doc_note={doc_note}
              />
            )}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.1}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingTop: 0 }}
            windowSize={10}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                progressViewOffset={-30}
              />
            }
            contentInset={{ top: 0 }}
            contentOffset={{ y: 0 }}
            ListEmptyComponent={
              <EmptyListComponent
                iconName='account-group-outline'
                title={t('empty_list.title')}
                description={t('empty_list.description_chat_circle')}
              />
            }
            ListFooterComponent={() =>
              isLoading ? (
                <Text style={{ color: COLORS.black, textAlign: 'center', padding: PADDING.p01 }}>{t('loading')}</Text>
              ) : null
            }
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

// const OrganizationsTab = ({ handleScroll, showBackToTop, listRef, doc_title, doc_page, doc_note }) => {
//   // =============== Colors ===============
//   const COLORS = useColors();
//   // =============== Language ===============
//   const { t } = useTranslation();
//   // =============== Navigation ===============
//   const navigation = useNavigation();
//   // =============== Get contexts ===============
//   const { userInfo } = useContext(AuthContext);
//   // =============== Get data ===============
//   const [organizations, setOrganizations] = useState([]);
//   const [ad, setAd] = useState(null);
//   const [page, setPage] = useState(1);
//   const [lastPage, setLastPage] = useState(1);
//   const [count, setCount] = useState(0);
//   const [inputValue, setInputValue] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const flatListRef = listRef || useRef(null);

//   // Fetch data from API
//   const fetchSearchData = async (searchTerm) => {
//     if (isLoading) return;
//     setIsLoading(true);

//     const qs = require('qs');

//     const params = {
//       data: searchTerm,
//       status_id: 7,
//     };

//     try {
//       const response = await axios.post(
//         `${API.boongo_url}/organization/search`,
//         qs.stringify(params, { arrayFormat: 'brackets' }), // 👈 key here
//         {
//           headers: {
//             'X-localization': 'fr',
//             'Authorization': `Bearer ${userInfo.api_token}`,
//             'X-user-id': userInfo.id,
//             'Content-Type': 'application/x-www-form-urlencoded', // consistent
//           },
//         }
//       );

//       setOrganizations(response.data.data);
//     } catch (error) {
//       console.error('Erreur lors de la recherche:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle search event
//   const handleSearch = (text) => {
//     setInputValue(text);
//     fetchSearchData(text);
//   };

//   const fetchOrganizations = async (pageToFetch = 1) => {
//     if (isLoading || pageToFetch > lastPage) return;

//     setIsLoading(true);

//     const qs = require('qs');
//     const url = `${API.boongo_url}/user/member_groups/organization/${userInfo.id}/15`;
//     const mHeaders = {
//       'X-localization': 'fr',
//       'Authorization': `Bearer ${userInfo.api_token}`
//     };

//     try {
//       const response = await axios.get(url, { headers: mHeaders });

//       if (pageToFetch === 1) {
//         setOrganizations(response.data.data);

//       } else {
//         setOrganizations(prev => [...prev, ...response.data.data]);
//       }

//       setAd(response.data.ad);
//       setLastPage(response.data.lastPage);
//       setCount(response.data.count);
//     } catch (error) {
//       if (error.response?.status === 429) {
//         console.warn("Trop de requêtes envoyées. Attendez avant de réessayer.");
//       } else {
//         console.error(error);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const scrollToTop = () => {
//     flatListRef.current.scrollToOffset({ offset: 0, animated: true });
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     setPage(1);
//     await fetchOrganizations(1);
//     setRefreshing(false);
//   };

//   const onEndReached = () => {
//     if (!isLoading && page < lastPage) {
//       const nextPage = page + 1;

//       setPage(nextPage); // Update the page
//     }
//   };

//   const combinedData = [...organizations];

//   if (ad) {
//     combinedData.push({ ...ad, realId: ad.id, id: 'ad' });
//   }

//   useEffect(() => {
//     fetchOrganizations(1); // Initial loading
//   }, []);

//   useEffect(() => {
//     if (page > 1) {
//       fetchOrganizations(page);
//     }
//   }, [page]);

//   return (
//     <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
//       {showBackToTop && (
//         <TouchableOpacity style={[homeStyles.floatingButton, { bottom: 30, backgroundColor: COLORS.warning }]} onPress={scrollToTop}>
//           <Icon name='chevron-double-up' size={IMAGE_SIZE.s09} style={{ color: 'black' }} />
//         </TouchableOpacity>
//       )}
//       <SafeAreaView contentContainerStyle={{ flexGrow: 1 }}>
//         <View style={[homeStyles.cardEmpty, { height: Dimensions.get('window').height, marginLeft: 0, paddingHorizontal: 2 }]}>
//           {/* Search bar */}
//           <View style={[homeStyles.searchContainer, { marginTop: 48, backgroundColor: COLORS.white }]}>
//             <View style={homeStyles.searchInput}>
//               <TextInput placeholder={t('search')} placeholderTextColor={COLORS.black} onChangeText={handleSearch} style={[homeStyles.searchInputText, { color: COLORS.black, borderColor: COLORS.dark_secondary, marginHorizontal: 0 }]} />
//               <TouchableOpacity style={[homeStyles.searchInputSubmit, { borderColor: COLORS.dark_secondary }]} onPress={() => fetchSearchData(inputValue)}>
//                 <FontAwesome6 name='magnifying-glass' size={IMAGE_SIZE.s04} color={COLORS.black} />
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* Organizations List */}
//           <Animated.FlatList
//             ref={flatListRef}
//             data={combinedData}
//             keyExtractor={(item, index) => `${item.id || 'no-id'}-${index}`}
//             renderItem={({ item }) => (
//               <EntityItemComponent
//                 item={item}
//                 entity='organization'
//                 entity_id={item.id}
//                 entity_name={item.org_name}
//                 entity_profile={item.cover_url}
//                 doc_title={doc_title}
//                 doc_page={doc_page}
//                 doc_note={doc_note}
//               />
//             )}
//             showsVerticalScrollIndicator={false}
//             onScroll={handleScroll}
//             onEndReached={onEndReached}
//             onEndReachedThreshold={0.1}
//             scrollEventThrottle={16}
//             contentContainerStyle={{ paddingTop: 0 }}
//             windowSize={10}
//             refreshControl={
//               <RefreshControl
//                 refreshing={refreshing}
//                 onRefresh={onRefresh}
//                 progressViewOffset={-30}
//               />
//             }
//             contentInset={{ top: 0 }}
//             contentOffset={{ y: 0 }}
//             ListEmptyComponent={
//               <EmptyListComponent
//                 iconName='bank-outline'
//                 title={t('empty_list.title')}
//                 description={t('empty_list.description_chat_organization')}
//               />
//             }
//             ListFooterComponent={() =>
//               isLoading ? (
//                 <Text style={{ color: COLORS.black, textAlign: 'center', padding: PADDING.p01 }}>{t('loading')}</Text>
//               ) : null
//             }
//           />
//         </View>
//       </SafeAreaView>
//     </View>
//   );
// };

// const EventsTab = ({ handleScroll, showBackToTop, listRef, doc_title, doc_page, doc_note }) => {
//   // =============== Colors ===============
//   const COLORS = useColors();
//   // =============== Language ===============
//   const { t } = useTranslation();
//   // =============== Navigation ===============
//   const navigation = useNavigation();
//   // =============== Get contexts ===============
//   const { userInfo } = useContext(AuthContext);
//   // =============== Get data ===============
//   const [events, setEvents] = useState([]);
//   const [ad, setAd] = useState(null);
//   const [page, setPage] = useState(1);
//   const [lastPage, setLastPage] = useState(1);
//   const [count, setCount] = useState(0);
//   const [isLoading, setIsLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const flatListRef = listRef || useRef(null);

//   const fetchEvents = async (pageToFetch = 1) => {
//     if (isLoading || pageToFetch > lastPage) return;

//     setIsLoading(true);

//     const qs = require('qs');
//     const url = `${API.boongo_url}/user/member_groups/event/${userInfo.id}/15?page=${pageToFetch}`;
//     const mHeaders = {
//       'X-localization': 'fr',
//       'Authorization': `Bearer ${userInfo.api_token}`
//     };

//     try {
//       const response = await axios.get(url, { headers: mHeaders });

//       if (pageToFetch === 1) {
//         setEvents(response.data.data);

//       } else {
//         setEvents(prev => [...prev, ...response.data.data]);
//       }

//       setAd(response.data.ad);
//       setLastPage(response.data.lastPage);
//       setCount(response.data.count);
//     } catch (error) {
//       if (error.response?.status === 429) {
//         console.warn("Trop de requêtes envoyées. Attendez avant de réessayer.");
//       } else {
//         console.error(error);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const scrollToTop = () => {
//     flatListRef.current.scrollToOffset({ offset: 0, animated: true });
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     setPage(1);
//     await fetchEvents(1);
//     setRefreshing(false);
//   };

//   const onEndReached = () => {
//     if (!isLoading && page < lastPage) {
//       const nextPage = page + 1;

//       setPage(nextPage); // Update the page
//     }
//   };

//   const combinedData = [...events];

//   if (ad) {
//     combinedData.push({ ...ad, realId: ad.id, id: 'ad' });
//   }

//   useEffect(() => {
//     fetchEvents(1); // Initial loading
//   }, []);

//   useEffect(() => {
//     if (page > 1) {
//       fetchEvents(page);
//     }
//   }, [page]);

//   return (
//     <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
//       {showBackToTop && (
//         <TouchableOpacity style={[homeStyles.floatingButton, { bottom: 30, backgroundColor: COLORS.warning }]} onPress={scrollToTop}>
//           <Icon name='chevron-double-up' size={IMAGE_SIZE.s09} style={{ color: 'black' }} />
//         </TouchableOpacity>
//       )}
//       <SafeAreaView contentContainerStyle={{ flexGrow: 1 }}>
//         <View style={[homeStyles.cardEmpty, { height: Dimensions.get('window').height, marginLeft: 0, paddingHorizontal: 2 }]}>
//           {/* Events List */}
//           <Animated.FlatList
//             ref={flatListRef}
//             data={combinedData}
//             keyExtractor={(item, index) => `${item.id || 'no-id'}-${index}`}
//             renderItem={({ item }) => (
//               <EntityItemComponent
//                 item={item}
//                 entity='event'
//                 entity_id={item.id}
//                 entity_name={item.event_title}
//                 entity_profile={item.cover_url}
//                 doc_title={doc_title}
//                 doc_page={doc_page}
//                 doc_note={doc_note}
//               />
//             )}
//             showsVerticalScrollIndicator={false}
//             onScroll={handleScroll}
//             onEndReached={onEndReached}
//             onEndReachedThreshold={0.1}
//             scrollEventThrottle={16}
//             contentContainerStyle={{ paddingTop: 0 }}
//             windowSize={10}
//             refreshControl={
//               <RefreshControl
//                 refreshing={refreshing}
//                 onRefresh={onRefresh}
//                 progressViewOffset={-30}
//               />
//             }
//             contentInset={{ top: 0 }}
//             contentOffset={{ y: 0 }}
//             ListEmptyComponent={
//               <EmptyListComponent
//                 iconName='calendar-outline'
//                 title={t('empty_list.title')}
//                 description={t('empty_list.description_chat_event')}
//               />
//             }
//             ListFooterComponent={() =>
//               isLoading ? (
//                 <Text style={{ color: COLORS.black, textAlign: 'center', padding: PADDING.p01 }}>{t('loading')}</Text>
//               ) : null
//             }
//           />
//         </View>
//       </SafeAreaView>
//     </View>
//   );
// };

const ChatEntityScreen = () => {
  // =============== Get parameters ===============
  const route = useRoute();
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Get data ===============
  const { doc_title, doc_page, doc_note } = route.params || {};
  const membersListRef = useRef(null);
  const circlesListRef = useRef(null);
  // const orgsListRef = useRef(null);
  // const eventsListRef = useRef(null);

  const [index, setIndex] = useState(0);
  const [showBackToTopByTab, setShowBackToTopByTab] = useState({
    members: false,
    circles: false,
    // organizations: false,
    // events: false,
  });

  const savedScrollOffsets = useRef({
    members: 0,
    circles: 0,
    // organizations: 0,
    // events: 0,
  });

  const [routes] = useState([
    { key: 'members', title: t('navigation.chat.members') },
    { key: 'circles', title: t('navigation.chat.circles') },
    // { key: 'organizations', title: t('navigation.chat.organizations') },
    // { key: 'events', title: t('navigation.chat.events') },
  ]);

  const renderScene = ({ route }) => {
    const commonProps = {
      handleScroll,
      showBackToTop: showBackToTopByTab[route.key],
      doc_title,
      doc_page,
      doc_note,
    };

    switch (route.key) {
      case 'members':
        return <MembersTab {...commonProps} listRef={membersListRef} />;
      case 'circles':
        return <CirclesTab {...commonProps} listRef={circlesListRef} />;
      // case 'organizations':
      //   return <OrganizationsTab {...commonProps} listRef={orgsListRef} />;
      // case 'events':
      //   return <EventsTab {...commonProps} listRef={eventsListRef} />;
      default:
        return null;
    }
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    // const currentTab = ['members', 'circles', 'organizations', 'events'][index];
    const currentTab = ['members', 'circles'][index];

    savedScrollOffsets.current[currentTab] = offsetY;
    const isAtTop = offsetY <= 0;

    setShowBackToTopByTab((prev) => ({
      ...prev,
      [currentTab]: !isAtTop,
    }));
  };

  const handleIndexChange = (newIndex) => {
    // const tabKeys = ['members', 'circles', 'organizations', 'events'];
    const tabKeys = ['members', 'circles'];
    const newTabKey = tabKeys[newIndex];
    const offset = savedScrollOffsets.current[newTabKey] || 0;

    const refMap = {
      members: membersListRef,
      circles: circlesListRef,
      // organizations: orgsListRef,
      // events: eventsListRef,
    };

    const listRef = refMap[newTabKey];
    listRef.current?.scrollToOffset({ offset, animated: true });

    setIndex(newIndex);
  };

  const renderTabBar = (props) => (
    <>
      <View style={{ zIndex: 1000, position: 'absolute', top: 0, width: '100%', backgroundColor: COLORS.white }}>
        <HeaderComponent />
        <TabBar
          {...props}
          scrollEnabled
          style={{ backgroundColor: COLORS.white }}
          indicatorStyle={{ backgroundColor: COLORS.black }}
          tabStyle={{ width: 200 }}
          labelStyle={{ flexShrink: 1 }}
          activeColor={COLORS.black}
          inactiveColor={COLORS.dark_secondary}
        />
      </View>
    </>
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={handleIndexChange}
      initialLayout={{ width: Dimensions.get('window').width }}
      renderTabBar={renderTabBar}
    />
  );
};

export default ChatEntityScreen;
