import {View, Image} from 'react-native';
import React, {FC, useEffect} from 'react';
import {navigate} from '../utils/NavigationUtil';
import {commonStyles} from '../styles/commonStyles';
import {logo_text} from '../AssetsConstants';

const SplashScreen: FC = () => {
  const navigateToHome = () => {
    navigate('ConnectionScreen');
  };

  useEffect(() => {
    const timeOutId = setTimeout(navigateToHome, 1200);
    () => clearTimeout(timeOutId);
  });
  return (
    <View style={commonStyles.container}>
      <Image source={logo_text} style={commonStyles.img} />
    </View>
  );
};

export default SplashScreen;
