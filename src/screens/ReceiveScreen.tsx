import {
  View,
  Text,
  Animated,
  Easing,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import React, {FC, useEffect, useRef, useState} from 'react';
import {useTCP} from '../service/TCPProvider';
import {goBack, navigate} from '../utils/NavigationUtil';
import dgram from 'react-native-udp';
import {device, profile, profile2} from '../AssetsConstants';
import LinearGradient from 'react-native-linear-gradient';
import {sendStyles} from '../styles/sendStyles';
import Icon from '../components/global/Icon';
import CustomText from '../components/global/CustomText';
import BreakerText from '../components/UI/BreakerText';
import {Colors, screenWidth} from '../utils/Constants';
import LottieView from 'lottie-react-native';
import QRScannerModel from '../components/modals/QRScannerModal';
import QRGenerateModal from '../components/modals/QRGenerateModal';
import DeviceInfo from 'react-native-device-info';
import {getBroadcastIPAddress, getLocalIPAddress} from '../utils/networkUtils';

const ReceiveScreen: FC = () => {
  const {startServer, server, isConnected} = useTCP();
  const [qrValue, setQRValue] = useState('');

  const [isSCannerVisible, setIsScannerVisible] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const setupServer = async () => {
    const deviceName = await DeviceInfo.getDeviceName();
    const ip = await getLocalIPAddress();
    const port = 4000;
    if (server) {
      startServer(port);
      return;
    }

    setQRValue(`tcp://${ip}:${port}|${deviceName}`);
    console.log(`Server Info: ${ip} | ${port}`);
  };

  useEffect(() => {
    if (!qrValue) return;

    sendDiscoverySIgnal();

    intervalRef.current = setInterval(sendDiscoverySIgnal, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [qrValue]);

  const sendDiscoverySIgnal = async () => {
    const deviceName = await DeviceInfo.getDeviceName();

    const broadCastIPAddress = await getBroadcastIPAddress();
    const targetAddress = broadCastIPAddress || '255.255.255.255';
    const port = 57143;
    const client = dgram.createSocket({
      type: 'udp4',
      reusePort: true,
    });

    client.bind(() => {
      try {
        if (Platform.OS === 'ios') {
          client.setBroadcast(true);
        }

        client.send(
          `${qrValue}`,
          0,
          `${qrValue}`.length,
          port,
          targetAddress,
          err => {
            if (err) {
              console.error('error sending broadcast signal', err);
            } else {
              console.log(
                `${deviceName} discovery signal sent to ${targetAddress}`,
              );
            }
            client.close();
          },
        );
      } catch (error) {
        console.error('failed to send broadcast signal', error);
      }
    });
  };

  useEffect(() => {
    setupServer();
  }, []);

  const handleGoBack = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    goBack();
  };

  useEffect(() => {
    if (isConnected) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      navigate('ConnectionScreen');
    }
  }, [isConnected]);

  return (
    <LinearGradient
      colors={['#FFFFFF', '#4DA0DE', '#3387C5']}
      style={sendStyles?.container}
      start={{x: 0, y: 1}}
      end={{x: 0, y: 0}}>
      <SafeAreaView />
      <View style={sendStyles.mainContainer}>
        <View style={sendStyles.infoContainer}>
          <Icon
            name="blur-on"
            iconFamily="MaterialIcons"
            color="white"
            size={40}
          />
          <CustomText
            fontFamily="Okra-Bold"
            color="#fff"
            fontSize={16}
            style={{marginTop: 20}}>
            REceiving from nearby devices
          </CustomText>

          <CustomText
            fontFamily="Okra-Medium"
            color="#fff"
            fontSize={12}
            style={{textAlign: 'center'}}>
            Ensure your device is connected to the sender's hot-spot network.
          </CustomText>
          <BreakerText text="Or" />
          <TouchableOpacity
            style={sendStyles.qrButton}
            onPress={() => setIsScannerVisible(true)}>
            <Icon
              name="qrcode"
              iconFamily="MaterialCommunityIcons"
              color={Colors.primary}
              size={16}
            />
            <CustomText fontFamily="Okra-Bold" color={Colors.primary}>
              Show QR
            </CustomText>
          </TouchableOpacity>
        </View>

        <View style={sendStyles.animationContainer}>
          <View style={sendStyles.lottieContainer}>
            <LottieView
              style={sendStyles.lottie}
              source={require('../assets/animations/scan2.json')}
              autoPlay
              loop={true}
              hardwareAccelerationAndroid
            />
          </View>
          <Image source={profile} style={sendStyles.profileImage} />
        </View>
        <TouchableOpacity onPress={handleGoBack} style={sendStyles.backButton}>
          <Icon
            name="arrow-back"
            iconFamily="Ionicons"
            size={16}
            color="#000"
          />
        </TouchableOpacity>
      </View>
      {isSCannerVisible && (
        <QRGenerateModal
          visible={isSCannerVisible}
          onClose={() => setIsScannerVisible(false)}
        />
      )}
    </LinearGradient>
  );
};

export default ReceiveScreen;
