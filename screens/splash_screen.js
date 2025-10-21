/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React from 'react';
import { Image, View } from 'react-native';
import { WebView } from 'react-native-webview';

const SplashScreen = () => {
  const gifBase64 = Image.resolveAssetSource(require('../assets/img/splash.gif')).uri;

  return (
    <View style={{ flex: 1, backgroundColor: '#171614' }}>
      <WebView
        originWhitelist={['*']}
        source={{
          html: `
            <html>
              <body style="margin:0;padding:0;background-color:#171614;overflow:hidden;display:flex;justify-content:center;align-items:center;height:140vh;width:140vw;">
                <img src="${gifBase64}"
                     style="width:160%;height:340%;object-fit:contain;"/>
              </body>
            </html>`
        }}
        style={{ flex: 1 }}
        scrollEnabled={false}
        bounces={false}
      />
    </View>
  );
};

export default SplashScreen;