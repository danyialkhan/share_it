import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {RFValue} from 'react-native-responsive-fontsize';
import React, {FC} from 'react';

interface IconProps {
  color?: string;
  size: number;
  name: string;
  iconFamily: 'Ionicons' | 'MaterialCommunityIcons' | 'MaterialIcons';
}

const Icon: FC<IconProps> = ({color, size, name, iconFamily}) => {
  return (
    <>
      {iconFamily === 'Ionicons' && (
        <Ionicons color={color} name={name} size={RFValue(size)} />
      )}
      {iconFamily === 'MaterialIcons' && (
        <MaterialIcons color={color} name={name} size={RFValue(size)} />
      )}
      {iconFamily === 'MaterialCommunityIcons' && (
        <MaterialCommunityIcons
          color={color}
          name={name}
          size={RFValue(size)}
        />
      )}
    </>
  );
};

export default Icon;
