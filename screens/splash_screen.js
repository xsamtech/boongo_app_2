/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React from 'react';
import { Image, View } from 'react-native';

const SplashScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#171614' }}>
      <Image source={require('../assets/img/splash.gif')} style={{ width: '100%', height: '100%' }} />
    </View>
  );
};

export default SplashScreen;