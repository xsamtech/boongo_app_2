/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Dimensions, Alert, Text, TextInput, FlatList, SafeAreaView, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Octicons from 'react-native-vector-icons/Octicons';
import Pdf from 'react-native-pdf';
import Spinner from 'react-native-loading-spinner-overlay';
import SQLite from 'react-native-sqlite-storage';
import { IMAGE_SIZE } from '../../tools/constants';
import TextBrand from '../../assets/img/text.svg';
import homeStyles from '../style';
import useColors from '../../hooks/useColors';

const Tab = createBottomTabNavigator();

const SummaryScreenContent = ({ route, navigation }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Get parameters ===============
  const { docTitle, docUri } = route.params;

  // =============== Language ===============
  const { t } = useTranslation();

  // =============== Get data ===============
  const [notes, setNotes] = useState([]);
  const [noteItem, setNoteItem] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // =============== Database handling ===============
  const db = SQLite.openDatabase({ name: 'notes.db', location: 'default' });

  useEffect(() => {
    // Create table if it does not exist
    db.transaction(tx => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS BlocNotes (id INTEGER PRIMARY KEY AUTOINCREMENT, page INTEGER, noteText TEXT, doc_title TEXT, doc_uri TEXT)',
        [], () => console.log('Table BlocNotes created successfully'),
        (tx, error) => console.log('Error creating table', error)
      );
    });

    // Load existing notes
    loadNotes();
  }, []);

  const addNote = () => {
    if (noteText.trim()) {
      // setNotes([...notes, { id: Date.now().toString(), page: page, text: noteText }]);

      db.transaction(tx => {
        tx.executeSql('INSERT INTO BlocNotes (page, noteText, doc_title, doc_uri) VALUES (?, ?, ?, ?)',
          [page, noteText, docTitle, docUri],
          () => {
            console.log('Note saved successfully');
            setPage('');
            setNoteText('');

            loadNotes();
          },
          (tx, error) => console.log('Error saving note', tx)
        );
      });

    } else {
      Alert.alert(t('error'), t('error_message.cannot_be_empty'));
    }
  };

  const editNote = (id) => {
    if (noteItem.noteText.trim()) {
      db.transaction(tx => {
        tx.executeSql('UPDATE BlocNotes SET page = ?, noteText = ? WHERE id = ? ',
          [noteItem.page, noteItem.noteText, id],
          () => {
            console.log('Note edited successfully');
            setPage('');
            setNoteText('');

            loadNotes();
            setModalVisible(false);
          },
          (tx, error) => console.log('Error saving note', error)
        );
      });

    } else {
      Alert.alert(t('error'), t('error_message.cannot_be_empty'));
    }
  };

  const loadNotes = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM BlocNotes', [],
        (tx, results) => {
          let notesList = [];

          for (let i = 0; i < results.rows.length; i++) {
            notesList.push(results.rows.item(i));
          }

          setNotes(notesList);
        },
        (tx, error) => {
          Alert.alert(t('error'), 'Error loading notes', error);
          console.log('Error loading notes', error)
        }
      );
    });
  };

  const deleteNote = (id) => {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM BlocNotes WHERE id = ?', [id],
        (tx, results) => {
          // setNotes(notes.filter(note => note.id !== id));
          // Load existing notes
          loadNotes();
        },
        (tx, error) => {
          Alert.alert(t('error'), 'Error while deleting note', error);
          console.log('Error while deleting note', error)
        }
      );
    });
  };

  // =============== Open modal ===============
  const openModal = (id) => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM BlocNotes WHERE id = ?', [id],
        (tx, results) => {
          if (results.rows.length > 0) {
            const data = results.rows.item(0);

            setNoteItem(data);
            setModalVisible(true);
          }
        },
        (tx, error) => {
          Alert.alert(t('error'), 'Error loading note', error);
          console.log('Error loading note', error)
        }
      );
    });
  };

  // =============== When the "Edit" button is pressed ===============
  const editButtonPress = (id) => {
    openModal(id);
  };

  // =============== Go to page ===============
  const goToPage = (pageNumber, doc_uri) => {
    setIsLoading(true);
    navigation.navigate('PDFViewerContent', { isLoading: isLoading, docUri: doc_uri, curPage: parseInt(pageNumber) });
    console.log('goToPage => ' + pageNumber);
    setIsLoading(false);
  };

  // =============== Go to page ===============
  const renderNoteItem = ({ item }) => {
    const isExpanded = item.id === expandedId;
    const maxLength = 37; // Max length before cutting

    // Cut the text if necessary
    const displayTitle = isExpanded ? item.doc_title : (((item.doc_title).length > maxLength) ? `${item.doc_title.substring(0, maxLength)}...` : item.doc_title);
    const displayText = isExpanded ? item.noteText : (((item.noteText).length > maxLength) ? `${item.noteText.substring(0, maxLength)}...` : item.noteText);

    return (
      <View style={homeStyles.noteContainer}>
        <TouchableOpacity onPress={() => goToPage(item.page, item.doc_uri)} style={homeStyles.noteTextContainer}>
          <Text style={homeStyles.noteWorkTitle}>{displayTitle}</Text>
          <Text style={homeStyles.noteText}>{displayText}</Text>
          {item.noteText.length > maxLength ?
            <>
              <TouchableOpacity onPress={() => setExpandedId(isExpanded ? null : item.id)} style={[homeStyles.noteSeeTextButton]}>
                <Text style={homeStyles.noteSeeText}>{isExpanded ? t('see_less') : t('see_more')}</Text>
              </TouchableOpacity>
            </>
            : ''
          }
        </TouchableOpacity>
        <TouchableOpacity onPress={() => editButtonPress(item.id)} style={[homeStyles.noteEditButton]}>
          <Octicons style={homeStyles.noteButtonIcon} name='pencil' />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteNote(item.id)} style={homeStyles.noteDeleteButton}>
          <Octicons style={homeStyles.noteButtonIcon} name='x' />
        </TouchableOpacity>
      </View>

    );
  };

  return (
    <SafeAreaView contentContainerStyle={{ flex: 1, paddingBottom: 50 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        <TouchableOpacity style={{ width: 40, height: 40, backgroundColor: 'rgba(219, 51, 55, 0.5)', margin: 10, paddingVertical: 7, paddingHorizontal: 11, borderRadius: 40 / 2 }} onPress={() => navigation.goBack()}>
          <FontAwesome6 style={{ fontSize: 25, color: COLORS.black }} name='angle-left' />
        </TouchableOpacity>
      </View>
      <View style={{ position: 'absolute', top: 0, left: 0, width: Dimensions.get('window').width, paddingVertical: 7 }}>
        <TextBrand width={140} height={55} style={{ alignSelf: 'center' }} />
      </View>

      {/* Content */}
      <View style={{ marginTop: 5 }}>
        <Text style={homeStyles.noteTitle}>{t('notepad.title')}</Text>
        <View style={homeStyles.noteForm}>
          <TextInput keyboardType="numeric" style={homeStyles.noteInput} placeholder={t('notepad.page_number')} value={page} onChangeText={text => setPage(text)} />
          <TextInput multiline={true} numberOfLines={5} style={[homeStyles.noteInput, { height: 80, textAlignVertical: 'top' }]} placeholder={t('notepad.enter_note')} value={noteText} onChangeText={setNoteText} />
          <TouchableOpacity style={homeStyles.noteSubmit} onPress={addNote}>
            <Text style={{ textAlign: 'center', fontSize: 15, color: COLORS.white }}>{t('save')}</Text>
          </TouchableOpacity>
        </View>

        {noteItem.id ? (
          <>
            <Modal animationType='slide' transparent={true} visible={modalVisible} onRequestClose={() => { setModalVisible(!modalVisible); }}>
              <View style={homeStyles.modalBackground}>
                <View style={homeStyles.modalContainer}>
                  <TouchableOpacity style={homeStyles.modalCloseButton} onPress={() => setModalVisible(false)}>
                    <Octicons style={homeStyles.noteButtonIcon} name='x' />
                  </TouchableOpacity>
                  <Text style={homeStyles.noteTitle}>{t('notepad.title_edit')}</Text>
                  <View style={homeStyles.noteForm}>
                    <TextInput keyboardType="numeric" style={[homeStyles.noteInput, { width: Dimensions.get('window').width - 100 }]} placeholder={t('notepad.page_number')} value={noteItem.page.toString()} onChangeText={(text) => setNoteItem({ ...noteItem, page: text })} />
                    <TextInput multiline={true} numberOfLines={5} style={[homeStyles.noteInput, { width: Dimensions.get('window').width - 100, height: 80, textAlignVertical: 'top' }]} placeholder={t('notepad.enter_note')} value={noteItem.noteText} onChangeText={(text) => setNoteItem({ ...noteItem, noteText: text })} />
                    <TouchableOpacity style={[homeStyles.noteSubmit, { width: Dimensions.get('window').width - 100, backgroundColor: COLORS.warning }]} onPress={() => editNote(noteItem.id)}>
                      <Text style={{ textAlign: 'center', fontSize: 15, color: COLORS.black }}>{t('update')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </>
        ) : ''}

        <FlatList
          data={notes}
          keyExtractor={item => item.id}
          style={{ marginTop: 16 }}
          renderItem={renderNoteItem}
        />
      </View>
    </SafeAreaView>
  );
};

const PDFViewerScreenContent = ({ route, navigation }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Get parameters ===============
  const { isLoading, docUri, curPage } = route.params;

  // =============== Get data ===============
  const source = { uri: docUri, cache: true };

  return (
    <ScrollView contentContainerStyle={{ flex: 1, paddingBottom: 1 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        <TouchableOpacity style={{ width: 40, height: 40, backgroundColor: 'rgba(219, 51, 55, 0.5)', margin: 10, paddingVertical: 7, paddingHorizontal: 11, borderRadius: 40 / 2 }} onPress={() => navigation.goBack()}>
          <FontAwesome6 style={{ fontSize: 25, color: COLORS.black }} name='angle-left' />
        </TouchableOpacity>
      </View>
      <View style={{ position: 'absolute', top: 0, left: 0, width: Dimensions.get('window').width, paddingVertical: 7 }}>
        <TextBrand width={140} height={55} style={{ alignSelf: 'center' }} />
      </View>

      {/* Content */}
      <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 5, }}>
        <Spinner visible={isLoading} />

        <Pdf
          trustAllCerts={false}
          source={source}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`Number of pages: ${numberOfPages}`);
          }}
          onPageChanged={(page, numberOfPages) => {
            console.log(`Current page: ${page}`);
          }}
          onError={(error) => {
            console.log(error);
          }}
          onPressLink={(uri) => {
            console.log(`Link pressed: ${uri}`);
          }}
          page={curPage}
          style={{ flex: 1, width: Dimensions.get('window').width, height: Dimensions.get('window').height, }} />
      </View>
    </ScrollView>
  );
};

const PDFViewerScreen = ({ route }) => {
  // =============== Get parameters ===============
  const { docTitle, docUri } = route.params;

  // =============== Language ===============
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      initialRouteName='PDFViewerContent'
      screenOptions={{
        tabBarActiveTintColor: '#e91e63',
      }}
      barStyle={{ backgroundColor: '#ccccee' }}
    >
      <Tab.Screen
        name='PDFViewerContent' component={PDFViewerScreenContent}
        initialParams={{ docTitle: docTitle, docUri: docUri }}
        options={{
          title: t('navigation.reading'),
          tabBarLabel: t('navigation.reading'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name='book-open-page-variant-outline' color={color} size={IMAGE_SIZE.s06} />
          )
        }}
      />
      <Tab.Screen
        name='Summary' component={SummaryScreenContent}
        initialParams={{ docTitle: docTitle, docUri: docUri }}
        options={{
          title: t('navigation.summary'),
          tabBarLabel: t('navigation.summary'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name='lead-pencil' color={color} size={IMAGE_SIZE.s06} />
          )
        }}
      />
    </Tab.Navigator>
  );
};

export default PDFViewerScreen;