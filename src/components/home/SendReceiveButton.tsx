import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import React, {FC} from 'react';
import {screenHeight} from '../../utils/Constants';
import {receive1, send1} from '../../AssetsConstants';

const SendReceiveButton: FC = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => {}} style={styles.button}>
        <Image source={send1} style={styles.img} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {}} style={styles.button}>
        <Image source={receive1} style={styles.img} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: screenHeight * 0.04,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  button: {
    width: 140,
    height: 140,
    borderRadius: 10,
    overflow: 'hidden',
  },
});

export default SendReceiveButton;
