/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React from 'react';
import { View } from 'react-native';
import GifImage from '@lowkey/react-native-gif';

const SplashScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#171614' }}>
      <GifImage source={require('../assets/img/splash.gif')} style={{ width: '100%', height: '100%' }} resizeMode={'cover'} />;
    </View>
  );
};

export default SplashScreen;