/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { View, TouchableOpacity, Animated, SafeAreaView, Dimensions, RefreshControl, TouchableHighlight, FlatList, Text, Image, StatusBar, TextInput, Linking, ScrollView, Modal, Button } from 'react-native'
import { TabBar, TabView } from 'react-native-tab-view';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import Pdf from 'react-native-pdf';
import FaIcon from 'react-native-vector-icons/FontAwesome6';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { API, IMAGE_SIZE, PADDING, WEB } from '../../tools/constants';
import { AuthContext } from '../../contexts/AuthContext';
import EmptyListComponent from '../../components/empty_list';
import WorkItemComponent from '../../components/work_item';
import EntityItemComponent from '../../components/entity_item';
import FloatingActionsButton from '../../components/floating_actions_button';
import homeStyles from '../style';
import useColors from '../../hooks/useColors';

const TAB_BAR_HEIGHT = 48;

// Schedule frame
const Schedule = ({ handleScroll, showBackToTop, listRef, headerHeight = 0 }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Get contexts ===============
  const { userInfo } = useContext(AuthContext);
  // =============== Get parameters ===============
  const route = useRoute();
  const { organization_id, type } = route.params;
  // =============== Get data ===============
  const [selectedOrganization, setSelectedOrganization] = useState({});
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newClass, setNewClass] = useState('');
  const [pdfUri, setPdfUri] = useState(null); // URI du fichier PDF pour l'ajout d'un programme
  const flatListRef = listRef || useRef(null);

  // ================= Get current organization =================
  useEffect(() => {
    getOrganization();
  }, [selectedOrganization]);

  const getOrganization = () => {
    const config = {
      method: 'GET',
      url: `${API.boongo_url}/organization/${organization_id}`,
      headers: {
        'X-localization': 'fr',
        'Authorization': `Bearer ${userInfo.api_token}`,
      }
    };

    axios(config)
      .then(res => {
        const organizationData = res.data.data;

        setSelectedOrganization(organizationData);

        return organizationData;
      })
      .catch(error => {
        console.log(error);
      });
  };

  // ================= Get programs =================
  useEffect(() => {
    if (selectedOrganization.id) {
      fetchPrograms(); // Appelez fetchPrograms une fois l'organisation disponible
    }
  }, [selectedOrganization]); // Dépendance sur selectedOrganization

  const fetchPrograms = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonthNumber = new Date().getMonth() + 1;
      const course_year = (currentMonthNumber >= 8 ? `${currentYear}-${currentYear + 1}` : `${currentYear - 1}-${currentYear}`);
      const response = await axios.get(`${API.boongo_url}/program/find_all_by_year_and_organization/${course_year}/${organization_id}`, { headers: { 'Content-Type': 'multipart/form-data', 'X-localization': 'fr', 'Authorization': `Bearer ${userInfo.api_token}` } });

      setPrograms(response.data.data); // Mettre à jour la liste des programmes
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  // Ajouter un nouveau programme via API
  const addNewProgram = async () => {
    const formData = new FormData();
    formData.append('course_year', year);
    formData.append('class', newClass);
    formData.append('document_url', {
      uri: pdfUri, // URI du fichier PDF
      type: 'application/pdf',
      name: 'new_program.pdf',
    });

    try {
      const response = await axios.post(`${API.boongo_url}/program/add_organization_program/${organization_id}`, formData, { headers: { 'Content-Type': 'multipart/form-data', 'X-localization': 'fr', 'Authorization': `Bearer ${userInfo.api_token}` } });

      fetchPrograms(); // Recharger les programmes après ajout
      setModalVisible(false); // Fermer le modal
    } catch (error) {
      console.error('Error adding program:', error);
    }
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleBadgeClick = async (programId) => {
    try {
      const response = await axios.get(`${API.boongo_url}/program/${programId}`, { headers: { 'Content-Type': 'multipart/form-data', 'X-localization': 'fr', 'Authorization': `Bearer ${userInfo.api_token}` } });

      setSelectedProgram(response.data.data);
    } catch (error) {
      console.error('Error fetching program details:', error);
    }
  };

  const ProgramItem = ({ item }) => {
    const isSelected = selectedProgram?.id === item.id;
    const Container = isSelected ? TouchableHighlight : TouchableOpacity;

    return (
      <Container
        key={item.id}
        onPress={() => handleBadgeClick(item.id)}
        style={
          isSelected
            ? [homeStyles.categoryBadgeSelected, { backgroundColor: COLORS.white }]
            : [homeStyles.categoryBadge, { backgroundColor: COLORS.warning }]
        }
        underlayColor={COLORS.light_secondary}
      >
        <Text
          style={
            isSelected
              ? [homeStyles.categoryBadgeTextSelected, { color: COLORS.black }]
              : [homeStyles.categoryBadgeText, { color: 'black' }]
          }
        >
          {item.class}
        </Text>
      </Container>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
      {showBackToTop && (
        <TouchableOpacity style={[homeStyles.floatingButton, { bottom: 30, backgroundColor: COLORS.success }]} onPress={scrollToTop}>
          <Icon name="chevron-double-up" size={IMAGE_SIZE.s13} style={{ color: 'black' }} />
        </TouchableOpacity>
      )}

      <Animated.ScrollView contentContainerStyle={{ flexGrow: 1 }} onScroll={handleScroll}>
        <View style={{ flex: 1, paddingTop: headerHeight + 48 }}>
          {/* FlatList des programmes/classes */}
          <FlatList
            data={programs}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ height: 40, flexGrow: 0 }}
            contentContainerStyle={{
              alignItems: 'center',
              paddingHorizontal: PADDING.p00,
            }}
            renderItem={({ item }) => <ProgramItem item={item} />}
            ListFooterComponent={
              <TouchableOpacity style={[homeStyles.categoryBadge, { backgroundColor: COLORS.warning }]} onPress={() => setModalVisible(true)}>
                <Text style={[homeStyles.categoryBadgeText, { color: 'black' }]}>+ {t('add')}</Text>
              </TouchableOpacity>
            }
          />

          {/* Détails du programme */}
          {selectedProgram ? (
            <View style={{ marginTop: 20, padding: 20 }}>
              <Text>Classe: {selectedProgram.class}</Text>
              <Text>Année: {selectedProgram.course_year.year}</Text>
              <Pdf source={{ uri: selectedProgram.files[0].file_url, cache: true }} />
            </View>
          ) : (
            <EmptyListComponent iconName="file-document-outline" title={t('empty_list.title')} description={t('empty_list.description_establishment_programs')} />
          )}

          {/* Modal pour ajouter un programme */}
          <Modal visible={modalVisible} animationType="slide">
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 20, padding: 20 }}>
              <TextInput
                style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
                label="Classe"
                value={newClass}
                placeholder={t('navigation.establishment.data.p_o_box')}
                placeholderTextColor={COLORS.dark_secondary}
                onChangeText={setNewClass}
              />
              {/* Ajouter un fichier PDF (par exemple via react-native-document-picker) */}
              <Button title="Choisir un fichier" onPress={() => {/* Logic to choose file */ }} />
              <Button title="Ajouter" onPress={addNewProgram} />
              <Button title="Fermer" onPress={() => setModalVisible(false)} />
            </View>
          </Modal>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

// Events frame
const Events = ({ handleScroll, showBackToTop, listRef, headerHeight = 0 }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Get contexts ===============
  const { userInfo } = useContext(AuthContext);
  // =============== Get parameters ===============
  const route = useRoute();
  const { organization_id, type } = route.params;
  // =============== Get data ===============
  const [selectedOrganization, setSelectedOrganization] = useState({});
  const flatListRef = listRef || useRef(null);

  // ================= Get current organization =================
  useEffect(() => {
    getOrganization();
  }, [selectedOrganization]);

  const getOrganization = () => {
    const config = {
      method: 'GET',
      url: `${API.boongo_url}/organization/${organization_id}`,
      headers: {
        'X-localization': 'fr',
        'Authorization': `Bearer ${userInfo.api_token}`,
      }
    };

    axios(config)
      .then(res => {
        const organizationData = res.data.data;

        setSelectedOrganization(organizationData);

        return organizationData;
      })
      .catch(error => {
        console.log(error);
      });
  };

  const scrollToTop = () => {
    flatListRef.current.scrollToOffset({ offset: 0, animated: true });
  };

  // const onRefresh = async () => {
  //   setRefreshing(true);
  //   setPage(1);
  //   await fetchCircles(1);
  //   setRefreshing(false);
  // };

  // const onEndReached = () => {
  //   if (!isLoading && page < lastPage) {
  //     const nextPage = page + 1;

  //     setPage(nextPage); // Update the page
  //   }
  // };

  // const combinedData = [...circles];

  // if (ad) {
  //   combinedData.push({ ...ad, realId: ad.id, id: 'ad' });
  // }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
      {showBackToTop && (
        <TouchableOpacity style={[homeStyles.floatingButton, { backgroundColor: COLORS.warning }]} onPress={scrollToTop}>
          <Icon name='chevron-double-up' size={IMAGE_SIZE.s07} style={{ color: 'black' }} />
        </TouchableOpacity>
      )}

      <SafeAreaView contentContainerStyle={{ flexGrow: 1 }}>

      </SafeAreaView>
    </View>
  );
};

// Books frame
const Books = ({ handleScroll, showBackToTop, listRef, headerHeight = 0 }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Get contexts ===============
  const { userInfo } = useContext(AuthContext);
  // =============== Get parameters ===============
  const route = useRoute();
  const { organization_id, type } = route.params;
  // =============== Get data ===============
  const [selectedOrganization, setSelectedOrganization] = useState({});
  const flatListRef = listRef || useRef(null);

  // ================= Get current organization =================
  useEffect(() => {
    getOrganization();
  }, [selectedOrganization]);

  const getOrganization = () => {
    const config = {
      method: 'GET',
      url: `${API.boongo_url}/organization/${organization_id}`,
      headers: {
        'X-localization': 'fr',
        'Authorization': `Bearer ${userInfo.api_token}`,
      }
    };

    axios(config)
      .then(res => {
        const organizationData = res.data.data;

        setSelectedOrganization(organizationData);

        return organizationData;
      })
      .catch(error => {
        console.log(error);
      });
  };

  // ================= Handlers =================
  // const onRefresh = async () => {
  //   setRefreshing(true);
  //   await getUser();
  //   setRefreshing(false);
  // };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
      {showBackToTop && (
        <TouchableOpacity
          style={[homeStyles.floatingButton, { backgroundColor: COLORS.warning }]}
          onPress={scrollToTop}
        >
          <Icon name="chevron-double-up" size={IMAGE_SIZE.s13} style={{ color: 'black' }} />
        </TouchableOpacity>
      )}

      <SafeAreaView contentContainerStyle={{ flexGrow: 1 }}>

      </SafeAreaView>
    </View>
  );
};

// Teach frame
const Teach = ({ handleScroll, showBackToTop, listRef, headerHeight = 0 }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Get contexts ===============
  const { userInfo } = useContext(AuthContext);
  // =============== Get parameters ===============
  const route = useRoute();
  const { organization_id, type } = route.params;
  // =============== Get data ===============
  const [selectedOrganization, setSelectedOrganization] = useState({});
  const flatListRef = listRef || useRef(null);

  // ================= Get current organization =================
  useEffect(() => {
    getOrganization();
  }, [selectedOrganization]);

  const getOrganization = () => {
    const config = {
      method: 'GET',
      url: `${API.boongo_url}/organization/${organization_id}`,
      headers: {
        'X-localization': 'fr',
        'Authorization': `Bearer ${userInfo.api_token}`,
      }
    };

    axios(config)
      .then(res => {
        const organizationData = res.data.data;

        setSelectedOrganization(organizationData);

        return organizationData;
      })
      .catch(error => {
        console.log(error);
      });
  };

  // ================= Handlers =================
  // const onRefresh = async () => {
  //   setRefreshing(true);
  //   await getUser();
  //   setRefreshing(false);
  // };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
      {showBackToTop && (
        <TouchableOpacity
          style={[homeStyles.floatingButton, { backgroundColor: COLORS.warning }]}
          onPress={scrollToTop}
        >
          <Icon name="chevron-double-up" size={IMAGE_SIZE.s13} style={{ color: 'black' }} />
        </TouchableOpacity>
      )}

      <SafeAreaView contentContainerStyle={{ flexGrow: 1 }}>

      </SafeAreaView>
    </View>
  );
};

const OrganizationDataScreen = () => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Get contexts ===============
  const { userInfo } = useContext(AuthContext);
  // =============== Get parameters ===============
  const route = useRoute();
  const { organization_id, type } = route.params;
  // =============== Get data ===============
  const [selectedOrganization, setSelectedOrganization] = useState({});

  const scheduleListRef = useRef(null);
  const eventListRef = useRef(null);
  const booksListRef = useRef(null);
  const teachListRef = useRef(null);

  const [index, setIndex] = useState(0); // State for managing active tab index
  const [headerHeight, setHeaderHeight] = useState(0);
  const [showBackToTopByTab, setShowBackToTopByTab] = (type === 'government' ? useState({ event: false }) : useState({ schedule: false, event: false, books: false, teach: false }));

  const scrollY = useRef(new Animated.Value(0)).current;
  const savedScrollOffsets = (type === 'government' ? useRef({ event: 0 }) : useRef({ schedule: 0, event: 0, books: 0, teach: 0 }));
  const clampedScrollY = Animated.diffClamp(scrollY, 0, headerHeight);

  const headerTranslateY = clampedScrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolate: 'clamp',
  });

  const [routes] = type === 'government' ?
    useState([{ key: 'event', title: t('navigation.government.event') }]) :
    useState([
      { key: 'schedule', title: t('navigation.establishment.course_schedule') },
      { key: 'event', title: t('navigation.establishment.event') },
      { key: 'books', title: t('navigation.establishment.authors.books') },
      { key: 'teach', title: 'Boongo Teach' },
    ]);

  const renderScene = ({ route }) => {
    const sceneProps = {
      handleScroll,
      headerHeight,
    };

    if (type === 'government') {
      return <Events {...sceneProps} handleScroll={handleScroll} showBackToTop={showBackToTopByTab.event} listRef={eventListRef} />;

    } else {
      switch (route.key) {
        case 'schedule':
          return <Schedule {...sceneProps} handleScroll={handleScroll} showBackToTop={showBackToTopByTab.schedule} listRef={scheduleListRef} />;
        case 'event':
          return <Events {...sceneProps} handleScroll={handleScroll} showBackToTop={showBackToTopByTab.event} listRef={eventListRef} />;
        case 'books':
          return <Books {...sceneProps} handleScroll={handleScroll} showBackToTop={showBackToTopByTab.books} listRef={booksListRef} />;
        case 'teach':
          return <Teach {...sceneProps} handleScroll={handleScroll} showBackToTop={showBackToTopByTab.teach} listRef={teachListRef} />;
        default:
          return null;
      }
    }
  };

  // Handle scrolling and show/hide the header
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const currentTab = (type === 'government' ? 'event' : (index === 0 ? 'schedule' : (index === 1 ? 'event' : (index === 2 ? 'books' : 'teach'))));

        savedScrollOffsets.current[currentTab] = offsetY;

        const isAtTop = (offsetY <= 0);
        setShowBackToTopByTab(prev => ({
          ...prev,
          [currentTab]: !isAtTop,
        }));
      },
    }
  );

  // On "TabBar" index change
  const handleIndexChange = (newIndex) => {
    const newTabKey = (type === 'government' ? 'event' : (newIndex === 0 ? 'schedule' : (newIndex === 1 ? 'event' : (newIndex === 2 ? 'books' : 'teach'))));
    const offset = savedScrollOffsets.current[newTabKey] || 0;

    // Animate scrollY back to 0 smoothly (for header + tabbar)
    Animated.timing(scrollY, {
      toValue: offset,
      duration: 300, // 300ms for smooth effect
      useNativeDriver: true,
    }).start();

    // Back to top according to selected tab
    if (type === 'government') {
      eventListRef.current.scrollToOffset({ offset, animated: true });

    } else {
      if (newIndex === 0 && scheduleListRef.current) {
        scheduleListRef.current.scrollToOffset({ offset, animated: true });

      } else if (newIndex === 1 && eventListRef.current) {
        eventListRef.current.scrollToOffset({ offset, animated: true });

      } else if (newIndex === 2 && booksListRef.current) {
        booksListRef.current.scrollToOffset({ offset, animated: true });

      } else if (newIndex === 3 && teachListRef.current) {
        teachListRef.current.scrollToOffset({ offset, animated: true });
      }
    }

    setIndex(newIndex);
  };

  // ================= Get current organization =================
  useEffect(() => {
    getOrganization();
  }, [selectedOrganization]);

  const getOrganization = () => {
    const config = {
      method: 'GET',
      url: `${API.boongo_url}/organization/${organization_id}`,
      headers: {
        'X-localization': 'fr',
        'Authorization': `Bearer ${userInfo.api_token}`,
      }
    };

    axios(config)
      .then(res => {
        const organizationData = res.data.data;

        setSelectedOrganization(organizationData);

        return organizationData;
      })
      .catch(error => {
        console.log(error);
      });
  };

  // Custom "TabBar"
  const renderTabBar = (props) => (
    <>
      <Animated.View onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)} style={{ transform: [{ translateY: headerTranslateY }], zIndex: 1000, position: 'absolute', top: 0, width: '100%', backgroundColor: COLORS.white, paddingTop: 20 }}>
        {/* Status bar */}
        <StatusBar barStyle='dark-content' backgroundColor={COLORS.warning} />

        {/* Content */}
        <View style={{ backgroundColor: COLORS.white }}>
          {/* Top */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', left: 7, top: -10, zIndex: 10, width: Dimensions.get('window').width - 20 }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name='chevron-left' size={37} color={COLORS.black} />
            </TouchableOpacity>
            {selectedOrganization.user_id === userInfo.id && (
              <TouchableOpacity onPress={() => navigation.navigate('OrganizationSettings', { organization_id: organization_id })}>
                <Icon name='cog-outline' size={28} color={COLORS.black} />
              </TouchableOpacity>
            )}
          </View>

          {/* Profile */}
          <View style={{ flexDirection: 'column', width: Dimensions.get('window').width, justifyContent: 'flex-start', alignItems: 'flex-start', paddingTop: PADDING.p02, paddingHorizontal: PADDING.p02 }}>
            <Image style={{ width: 160, height: 160, borderRadius: PADDING.p04, borderWidth: 3, borderColor: COLORS.light_secondary, alignSelf: 'center' }} source={{ uri: selectedOrganization.cover_url || `${WEB.boongo_url}/assets/img/banner-organization.png` }} />
            <View style={{ flexDirection: 'column', width: '100%', justifyContent: 'center', paddingTop: PADDING.p01 }}>
              <Text style={{ fontSize: 25, fontWeight: '500', color: COLORS.black, textAlign: 'center' }}>{`${selectedOrganization.org_name || '...'}`}</Text>
              {selectedOrganization.org_acronym &&
                <Text style={{ fontSize: 13, fontWeight: '400', color: COLORS.black, textAlign: 'center', marginTop: 8 }}>
                  {selectedOrganization.org_acronym}
                </Text>
              }
              {selectedOrganization.org_description &&
                <Text style={{ fontSize: 14, fontWeight: '400', color: COLORS.dark_secondary, textAlign: 'center', marginTop: 8 }}>
                  {selectedOrganization.org_description}
                </Text>
              }
              {selectedOrganization.website_url &&
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', marginTop: 8 }}>
                  <Icon name='web' size={16} color={COLORS.black} style={{ marginTop: 1, marginRight: PADDING.p00 }} />
                  <Text style={{ fontSize: 13, fontWeight: '400', color: COLORS.link_color, textAlign: 'center' }} onPress={() => Linking.openURL(selectedOrganization.website_url)}>
                    {selectedOrganization.website_url}
                  </Text>
                </View>
              }
              {selectedOrganization.email &&
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', marginTop: 8 }}>
                  <Icon name='email' size={16} color={COLORS.black} style={{ marginTop: 1, marginRight: PADDING.p00 }} />
                  <Text style={{ fontSize: 13, fontWeight: '400', color: COLORS.black, textAlign: 'center' }}>
                    {selectedOrganization.email}
                  </Text>
                </View>
              }
              {selectedOrganization.phone &&
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', marginTop: 8 }}>
                  <Icon name='phone' size={16} color={COLORS.black} style={{ marginTop: 1, marginRight: PADDING.p00 }} />
                  <Text style={{ fontSize: 13, fontWeight: '400', color: COLORS.black, textAlign: 'center' }}>
                    {selectedOrganization.phone}
                  </Text>
                </View>
              }
              {selectedOrganization.address &&
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', marginTop: 8 }}>
                  <Icon name='map-marker' size={16} color={COLORS.black} style={{ marginTop: 1, marginRight: PADDING.p00 }} />
                  <Text style={{ fontSize: 13, fontWeight: '400', color: COLORS.black, textAlign: 'center' }}>
                    {selectedOrganization.address}
                  </Text>
                </View>
              }
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: PADDING.p03 }}>
                {selectedOrganization.p_o_box &&
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.black }}>
                      {t('navigation.establishment.data.p_o_box')}
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '400', color: COLORS.black }}>
                      {` : `}
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '400', color: COLORS.black }}>
                      {selectedOrganization.p_o_box}
                    </Text>
                  </View>
                }
                {selectedOrganization.year_of_creation &&
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.black }}>
                      {t('navigation.establishment.data.year_of_creation')}
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '400', color: COLORS.black }}>
                      {` : `}
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '400', color: COLORS.black }}>
                      {selectedOrganization.year_of_creation}
                    </Text>
                  </View>
                }
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
      <Animated.View
        style={{
          transform: [{ translateY: headerTranslateY }],
          position: 'absolute',
          top: headerHeight, // Positionnée juste en dessous du header
          zIndex: 999,
          width: '100%',
          height: TAB_BAR_HEIGHT,
          backgroundColor: COLORS.white,
        }}>
        <TabBar
          {...props}
          scrollEnabled
          style={{ backgroundColor: COLORS.white, borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 }}
          indicatorStyle={{ backgroundColor: COLORS.black }}
          tabStyle={{ width: 140 }}
          labelStyle={{ flexShrink: 1 }}
          activeColor={COLORS.black}
          inactiveColor={COLORS.dark_secondary}
        />
      </Animated.View>
    </>
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={handleIndexChange}
      initialLayout={{ width: Dimensions.get('window').width }}
      renderTabBar={renderTabBar} // Using the Custom TabBar
    />
  );
};

export default OrganizationDataScreen;