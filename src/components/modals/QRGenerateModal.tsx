import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import React, {FC, useEffect, useMemo, useState} from 'react';
import {modalStyles} from '../../styles/modalStyles';
import Icon from '../global/Icon';
import CustomText from '../global/CustomText';
import {LinearGradient} from 'react-native-linear-gradient';
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import QRCode from 'react-native-qrcode-svg';
import {profile2} from '../../AssetsConstants';
import {multiColor} from '../../utils/Constants';
import DeviceInfo from 'react-native-device-info';
import {useTCP} from '../../service/TCPProvider';
import {navigate} from '../../utils/NavigationUtil';
import {getLocalIPAddress} from '../../utils/networkUtils';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
}
const QRGenerateModal: FC<ModalProps> = ({visible, onClose}) => {
  const {isConnected, startServer, server} = useTCP();
  const [loading, setLoading] = useState(false);
  const [qrValue, setQRValue] = useState('');
  const shimmerTranslateX = useSharedValue(-300);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{translateX: shimmerTranslateX.value}],
  }));

  const setupServer = async () => {
    const deviceName = await DeviceInfo.getDeviceName();
    const ip = await getLocalIPAddress();
    const port = 4000;
    if (server) {
      setQRValue(`tcp://${ip}:${port}|${deviceName}`);
      setLoading(false);
      return;
    }

    startServer(port);
    setQRValue(`tcp://${ip}:${port}|${deviceName}`);
    setLoading(false);
  };

  useEffect(() => {
    shimmerTranslateX.value = withRepeat(
      withTiming(300, {duration: 1500, easing: Easing.linear}),
      -1,
      false,
    );

    if (visible) {
      setLoading(true);
      setupServer();
      const timer = setTimeout(() => setLoading(false), 400);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  useEffect(() => {
    if (isConnected) {
      onClose();
      navigate('ConnectionScreen');
    }
  }, [isConnected]);

  return (
    <Modal
      animationType="slide"
      visible={visible}
      presentationStyle="formSheet"
      onRequestClose={onClose}
      onDismiss={onClose}>
      <View style={modalStyles.modalContainer}>
        <View style={modalStyles.qrContainer}>
          {loading || qrValue == null || qrValue == '' ? (
            <View style={modalStyles.skeleton}>
              <Animated.View style={[modalStyles.shimmerOverlay, shimmerStyle]}>
                <LinearGradient
                  colors={['#f3f3f3', '#ffffff', '#f3f3f3']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={modalStyles.shimmerGradient}
                />
              </Animated.View>
            </View>
          ) : (
            <QRCode
              value={qrValue}
              size={250}
              logoSize={60}
              logoBackgroundColor="#fff"
              logoMargin={2}
              logoBorderRadius={10}
              logo={profile2}
              linearGradient={multiColor}
              enableLinearGradient
            />
          )}
        </View>
        <View style={modalStyles.info}>
          <CustomText style={modalStyles.infoText1}>
            Ensure you are on a same wifi network
          </CustomText>
          <CustomText style={modalStyles.infoText1}>
            Ask the sender to scan this QRCode to connect and transfer files.
          </CustomText>
          <ActivityIndicator
            size="small"
            color="#000"
            style={{alignSelf: 'center'}}
          />
        </View>
        <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
          <Icon name="close" iconFamily="Ionicons" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default QRGenerateModal;
