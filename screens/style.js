/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import { Dimensions, StyleSheet } from 'react-native';
import { PADDING, TEXT_SIZE } from '../tools/constants';

const homeStyles = StyleSheet.create({
    // Miscellaneous
    view: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    },

    headingArea: {
        marginTop: 7,
        marginBottom: 12,
        paddingHorizontal: 10
    },

    heading: {
        fontSize: 25,
        textAlign: 'center',
        marginBottom: 7
    },

    headingText: {
        fontSize: PADDING.p07,
        textAlign: 'center',
        marginBottom: 7
    },

    headingImageWrapper: {
        width: 41,
        height: 41,
        marginRight: 10,
        borderRadius: 41 / 2,
        overflow: 'hidden'
    },

    headingImage: {
        width: 41,
        height: 41
    },

    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    // Boongo slogan
    slogan: {
        fontSize: TEXT_SIZE.label,
        fontWeight: '200',
        textAlign: 'center'
    },

    // Message
    messageContainer: {
        backgroundColor: 'rgba(255, 238, 170, 0.7)',
        marginVertical: PADDING.p12,
        paddingVertical: PADDING.p01,
        paddingHorizontal: PADDING.p07
    },

    messageText: {
        fontWeight: '400',
        color: 'black'
    },

    // Maps
    mapContainer: {
        position: 'relative',
        overflow: 'hidden',
        marginTop: PADDING.p02,
        borderWidth: 1,
        borderColor: '#d3d3d3',
        borderRadius: 10
    },

    map: {
        flex: 1,
        height: 230,
    },

    mapButtonsContainer: {
        position: 'absolute',
        top: PADDING.p01,
        right: PADDING.p01,
        flexDirection: 'column',
        alignItems: 'center',
    },

    mapButton: {
        backgroundColor: '#777',
        padding: PADDING.p00,
        marginBottom: 10,
        borderRadius: 5,
        elevation: 1
    },

    mapButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },

    // Modal
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },

    modalContent: {
        width: '75%',
        maxHeight: '80%',
    },

    modalHeader: {
        paddingVertical: 15,
    },

    modalTitle: {
        textAlign: 'center',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    modalBodyListItem: {
        marginHorizontal: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
    },

    modalButton: {
        alignItems: 'center',
        padding: 10,
    },

    modalClose: {
        position: 'absolute',
        top: 1,
        right: 0,
        padding: 10,
    },

    // Card
    cardEmpty: {
        width: '100%',
        padding: PADDING.p01,
    },

    cardEmptyTitle: {
        marginBottom: 10,
        fontSize: 19,
        fontWeight: '700',
        color: '#3a7ced'
    },

    cardEmptyText: {
        fontSize: 14,
    },

    cardEmptySettings: {
        flexShrink: 1,
        width: '100%',
        borderRadius: 16,
        marginTop: 7,
        marginBottom: 20,
        elevation: 3
    },

    cardTitleSettings: {
        marginLeft: 20,
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },

    cardLabelSettings: {
        fontSize: 16
    },

    cardLabelValueSettings: {
        fontSize: 14
    },

    cardLabelDescriptionSettings: {
        fontSize: 12
    },

    cardButton: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 19,
    },

    paragraph: {
        fontSize: 14,
        fontWeight: '800'
    },

    // Onboard screen
    onboardTop: {
        height: Dimensions.get('window').height - 170,
        paddingTop: PADDING.p10,
        paddingHorizontal: PADDING.p01,
        elevation: 3
    },

    onboardBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#888',
        paddingVertical: PADDING.p07,
        paddingHorizontal: PADDING.p01,
    },

    onboardButton: {
        flexDirection: 'row',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: PADDING.p03,
        borderRadius: PADDING.p12
    },

    onboardButtonText: {
        fontSize: TEXT_SIZE.paragraph,
        textTransform: 'uppercase',
    },

    onboardSlide: {
        marginTop: PADDING.p03,
        flexDirection: 'row',
    },

    onboardSlideItem: {
        paddingHorizontal: PADDING.p03
    },

    onboardSlideText: {
        fontSize: 13,
        letterSpacing: 0.3,
        textAlign: 'center',
        marginTop: PADDING.p05
    },

    // Floating button
    floatingButton: {
        alignItems: 'center',
        position: 'absolute',
        right: PADDING.p01,
        bottom: 40,
        zIndex: 999,
        width: 60,
        height: 60,
        paddingTop: 9,
        borderRadius: 60 / 2
    },

    // Custom header
    headerBanner: {
        flexShrink: 1,
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingVertical: 11.5,
        paddingLeft: 7,
        paddingRight: 10,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        // Shadow for Android
        elevation: 5,
        zIndex: 999
    },

    headerAvatar: {
        width: 41,
        height: 41,
        borderRadius: 41 / 2,
        overflow: 'hidden'
    },

    // Authentication
    authlogo: {
        flexDirection: 'column',
        alignItems: 'center',
    },

    authTitle: {
        fontSize: 28,
        fontWeight: '400',
        textAlign: 'center',
        marginVertical: PADDING.p12
    },

    authTextWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 16
    },

    authText: {
        fontSize: 16,
    },

    authInput: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0)',
        marginBottom: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderRadius: 5,
        fontSize: 16,
    },

    authTextarea: {
        height: 70,
        backgroundColor: 'rgba(255, 255, 255, 0)',
        marginBottom: PADDING.p01,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderRadius: 5
    },

    authButton: {
        width: '100%',
        marginVertical: PADDING.p03,
        paddingHorizontal: 0,
        paddingVertical: PADDING.p00,
        borderRadius: PADDING.p10
    },

    authCancel: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0)',
        paddingHorizontal: 0,
        paddingVertical: PADDING.p01,
        borderRadius: PADDING.p10,
        borderWidth: 1
    },

    authButtonText: {
        fontSize: 15,
        textTransform: 'uppercase',
        textAlign: 'center'
    },

    authDivider: {
        marginVertical: PADDING.p07
    },

    authTermsText: {
        fontSize: TEXT_SIZE.paragraph,
        textAlign: 'center',
        marginTop: PADDING.p03
    },

    // Drawer
    drawerTitle: {
        fontWeight: '800'
    },

    drawerTitleSettings: {
        fontWeight: '500'
    },

    drawerSection: {
        width: 'auto',
        height: Dimensions.get('screen').height - 172,
        overflow: 'hidden',
        borderBottomRightRadius: 15
    },

    drawerCurrentUser: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: PADDING.p00,
        marginBottom: PADDING.p01,
        marginLeft: PADDING.p07
    },

    drawerFooter: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '100%',
        height: 140,
        backgroundColor: '#e3e3e3',
        paddingVertical: PADDING.p00
    },

    drawerButton: {
        width: 140,
        margin: 'auto'
    },

    // Toggle language
    langView: {
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: PADDING.p01
    },

    langButton: {
        width: Dimensions.get('screen').width - PADDING.p10,
        paddingVertical: PADDING.p01,
        paddingHorizontal: PADDING.p03,
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 89, 255, 0.3)'
    },

    button: {
        marginBottom: 10,
        paddingVertical: 10,
        paddingHorizontal: 10
    },

    buttonReverse: {
        marginBottom: 10,
        paddingVertical: 7,
        paddingHorizontal: 10
    },

    buttonText: {
        fontSize: 14,
        textAlign: 'center'
    },

    buttonTextReverse: {
        fontSize: 14,
        textAlign: 'center'
    },

    buttonTextReverse: {
        fontSize: 14,
        textAlign: 'center'
    },

    // Work details
    workBody: {
        paddingVertical: 30,
        paddingHorizontal: 10,
    },

    workCard: {
        marginBottom: 14,
        padding: 15,
    },

    workTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: PADDING.p01
    },

    workDescTop: {
        flexShrink: 1,
    },

    workImage: {
        width: Dimensions.get('window').width / 2.5,
        height: (Dimensions.get('window').width / 2.5) * 1.5,
        marginRight: 10,
        borderWidth: 3,
        borderRadius: 20
    },

    workImageMap: {
        width: '100%',
        height: '100%',
    },

    workTitle: {
        fontSize: 19,
        fontWeight: '700',
        color: '#3a7ced',
        marginTop: 10,
    },

    workContent: {
        fontSize: 14,
    },

    workBottom: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },

    workDescBottom: {
        flexShrink: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },

    workDescText: {
        fontSize: 16,
        marginBottom: 10
    },

    workDescBadgesList: {
        flexDirection: 'column',
        marginBottom: 10,
        paddingHorizontal: PADDING.horizontal
    },

    workDescBadgesListContents: {
        flexShrink: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },

    workDescBadge: {
        fontSize: 16,
        color: 'black',
        backgroundColor: '#d3d3d3',
        marginBottom: 10,
        marginRight: 7,
        paddingTop: 3,
        paddingBottom: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
    },

    workIconBtns: {
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: 154,
        marginTop: 10,
    },

    workIconBtn: {
        fontSize: 25,
    },

    workCmds: {
        padding: 10,
    },

    workCmd: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 5
    },

    workCmdIcon: {
        fontSize: 16,
        marginRight: 10
    },

    // Horizontal scrolling badges
    scrollableBadges: {
        marginTop: 3,
        paddingHorizontal: 10,
        paddingVertical: 10,
        whiteSpace: 'nowrap',
    },

    scrollableListItem: {
        flexDirection: 'column',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 7,
        marginRight: 15,
        borderRadius: 20
    },

    listTitleArea: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingTop: 10,
    },

    listTitle: {
        fontWeight: '700',
        textTransform: 'uppercase'
    },

    // Home styles
    homeScrollableListItem: {
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 170,
        paddingHorizontal: 15,
        paddingVertical: 15,
        marginRight: 15,
        elevation: 1
    },

    homeTitleOne: {
        fontSize: 16,
        fontWeight: '800',
    },

    homeParagraph: {
        marginTop: 4,
        fontSize: 14
    },

    homeThumbnail: {
        width: 110,
        height: 150,
        borderRadius: 5,
        marginBottom: 4
    },

    // Category filter badge
    categoryBadge: {
        marginRight: 7,
        paddingTop: 3,
        paddingBottom: 4,
        paddingHorizontal: 10,
        borderRadius: 10
    },

    categoryBadgeText: {
        fontSize: 14,
        fontWeight: '800',
    },

    categoryBadgeSelected: {
        alignSelf: 'center',
        backgroundColor: '#e3e3e3',
        marginHorizontal: PADDING.p05,
        paddingVertical: PADDING.p00 + 1,
        paddingHorizontal: PADDING.p03,
        borderRadius: PADDING.p07
    },

    categoryBadgeTextSelected: {
        letterSpacing: 0.7,
    },

    // Search
    searchContainer: {
        flexDirection: 'column',
        alignItems: 'center'
    },

    searchInput: {
        flexDirection: 'row'
    },

    searchInputText: {
        width: Dimensions.get('window').width - 100,
        backgroundColor: 'rgba(255, 255, 255, 0)',
        marginVertical: 15,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderEndWidth: 0,
        borderTopLeftRadius: 7,
        borderBottomLeftRadius: 7,
        fontSize: 16
    },

    searchInputSubmit: {
        marginVertical: 15,
        paddingTop: PADDING.p01,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderStartWidth: 0,
        borderTopRightRadius: 7,
        borderBottomRightRadius: 7,
    },

    searchResult: {
        flexShrink: 1,
        flexDirection: 'row',
        alignItems: 'center',
        width: Dimensions.get('window').width - 30,
        backgroundColor: 'rgba(255, 255, 255, 0)',
        marginBottom: 0,
        paddingVertical: 10,
        paddingHorizontal: 20
    },

    searchResultImage: {
        width: 80,
        height: 100
    },

    searchResultTitle: {
        marginBottom: 5,
        fontSize: 16,
        fontWeight: '700',
    },

    searchResultText: {
        marginBottom: 10,
        fontSize: 14
    },

    searchResultLink: {
        marginBottom: 10,
        fontSize: 14
    },

    // Notepad
    noteTitle: {
        marginVertical: PADDING.p00,
        fontSize: TEXT_SIZE.paragraph,
        textAlign: 'center',
    },

    noteForm: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },

    noteInput: {
        width: Dimensions.get('window').width - 20,
        borderColor: '#ddd',
        borderWidth: 1,
        borderBottomWidth: 0,
        paddingHorizontal: 14,
        fontSize: 15
    },

    noteSubmit: {
        width: Dimensions.get('window').width - 20,
        paddingVertical: 12,
        paddingHorizontal: 16
    },

    noteContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: Dimensions.get('window').width - 33,
        marginHorizontal: 20,
        paddingVertical: 10,
        // paddingRight: 20,
        borderBottomColor: '#ddd',
        borderBottomWidth: 1
    },

    noteWorkTitle: {
        width: Dimensions.get('window').width - 70,
        marginBottom: 10,
        fontSize: 14,
        fontWeight: '700'
    },

    noteTextContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0)',
        padding: 8,
        borderRadius: 4
    },

    noteText: {
        fontSize: 19
    },

    noteSeeTextButton: {
        width: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        marginTop: 10,
        paddingTop: 3,
        paddingBottom: 4,
        paddingHorizontal: 8,
        borderRadius: 4
    },

    noteSeeText: {
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center'
    },

    noteEditButton: {
        position: 'absolute',
        right: 0,
        top: 40,
        backgroundColor: 'rgba(255, 255, 255, 0)',
        padding: 8,
        borderRadius: 4
    },

    noteDeleteButton: {
        position: 'absolute',
        right: 3,
        top: 15,
        backgroundColor: 'rgba(255, 255, 255, 0)',
        padding: 8,
        borderRadius: 4
    },

    noteButtonIcon: {
        fontSize: 21,
    },
});

export default homeStyles;