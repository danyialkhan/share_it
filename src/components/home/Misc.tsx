import {View, Text, StyleSheet, Image} from 'react-native';
import React from 'react';
import CustomText from '../global/CustomText';
import {share_logo, wild_robot} from '../../AssetsConstants';
import {commonStyles} from '../../styles/commonStyles';

const Misc = () => {
  return (
    <View style={styles.container}>
      <CustomText fontSize={13} fontFamily="Okra-Bold">
        Explore
      </CustomText>
      <Image source={wild_robot} style={styles.adBanner} />
      <View style={commonStyles.flexRowBetween}>
        <CustomText fontFamily="Okra-Bold" style={styles.text} fontSize={22}>
          #1 worlds best file sharing app
        </CustomText>
        <Image source={share_logo} style={styles.image} />
      </View>
      <CustomText fontFamily="Okra-Bold" style={styles.text2}>
        Made with ♥ - Muhammad Danyial
      </CustomText>
    </View>
  );
};

export default Misc;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  adBanner: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    borderRadius: 10,
    marginVertical: 25,
  },
  text: {
    opacity: 0.5,
    width: '60%',
  },
  image: {
    resizeMode: 'contain',
    height: 120,
    width: '35%',
  },
  text2: {
    opacity: 0.5,
    width: '60%',
    marginTop: 10,
  },
});
