import {View, Text, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {bottomTabStyles} from '../../styles/bottomTabStyle';
import Icon from '../global/Icon';
import {navigate} from '../../utils/NavigationUtil';
import QRScannerModel from '../modals/QRScannerModal';

const AbsoluteQRBottom = () => {
  const [isVisible, setVisible] = useState(false);

  return (
    <>
      <View style={bottomTabStyles.container}>
        <TouchableOpacity onPress={() => navigate('ReceiveFileScreen')}>
          <Icon
            name="apps-sharp"
            iconFamily="Ionicons"
            size={24}
            color="#333"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={bottomTabStyles.qrCode}
          onPress={() => setVisible(true)}>
          <Icon
            name="qrcode-scan"
            iconFamily="MaterialCommunityIcons"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon
            name="beer-sharp"
            iconFamily="Ionicons"
            size={24}
            color="#333"
          />
        </TouchableOpacity>
      </View>
      {isVisible && (
        <QRScannerModel visible={isVisible} onClose={() => setVisible(false)} />
      )}
    </>
  );
};

export default AbsoluteQRBottom;
