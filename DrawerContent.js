/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React from 'react';
import { View, Text, Image } from 'react-native';
import { Divider, Title } from 'react-native-paper';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import FaIcon from 'react-native-vector-icons/FontAwesome6';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, PADDING, TEXT_SIZE } from './tools/constants';
import homeStyles from './screens/style';

const DrawerList = [
    { icon: 'home-outline', label: 'Accueil', navigateTo: 'Home' },
    { icon: 'book', label: 'Mon compte', navigateTo: 'Book' },
    { icon: 'newspaper', label: 'Etablissements', navigateTo: 'Journal' },
    { icon: 'map-marker-outline', label: 'Institutions', navigateTo: 'Mapping' },
    { icon: 'video-outline', label: 'Paramètres', navigateTo: 'Media' },
    { icon: 'help-circle-outline', label: 'A propos', navigateTo: 'About' }
];

const DrawerLayout = ({ icon, label, navigateTo }) => {
    const navigation = useNavigation();
    // const { t } = useTranslation();

    return (
        <DrawerItem
            icon={({ color, size }) => <Icon name={icon} color={color} size={size} />}
            // label={t(label)}
            label={label}
            onPress={() => {
                navigation.navigate(navigateTo);
            }}
        />
    );
};

const DrawerItems = props => {
    return DrawerList.map((el, i) => {
        return (
            <DrawerLayout key={i}
                icon={el.icon}
                label={el.label}
                navigateTo={el.navigateTo} />
        );
    });
};

const DrawerContent = (props) => {
    // =============== Navigation ===============
    const navigation = useNavigation();
    // =============== Language ===============
    // const { t } = useTranslation();
    // =============== Get data ===============
    const { logout } = useContext(AuthContext);

    return (
        <View style={{ flex: 1, paddingHorizontal: -12, marginHorizontal: -12 }}>
            <DrawerContentScrollView {...props}>
                <View style={homeStyles.drawerCurrentUser}>
                    <View style={{ marginTop: 5 }}>
                        <Image style={{ width: 60, height: 60, borderRadius: 30 }} source={require('./assets/img/avatar.png')} />
                    </View>
                    <View style={{ marginLeft: PADDING.p01, flexDirection: 'column' }}>
                        <Title style={homeStyles.drawerTitle}>Zachée Kabongo</Title>
                        <Text style={{ color: COLORS.yellow }}>{t('passenger')}</Text>
                    </View>
                </View>
                <View style={homeStyles.drawerSection}>
                    <DrawerItems />
                    <View style={homeStyles.drawerFooter}>
                        <DrawerItem
                            icon={() => <FaIcon name='power-off' color={COLORS.black} size={18} />}
                            label="Se déconnecter" labelStyle={{ marginLeft: PADDING.p00, color: COLORS.black }}
                            style={{ marginLeft: PADDING.p01 }}
                            onPress={{ marginLeft: PADDING.p01 }} />
                    </View>
                </View>
            </DrawerContentScrollView>
        </View>
    );
};

export default DrawerContent;