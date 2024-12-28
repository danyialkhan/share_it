import {
  View,
  Text,
  Animated,
  Easing,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {FC, useEffect, useState} from 'react';
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

const deviceNames = ['oppo', 'reno'];

const SendScreen: FC = () => {
  const {connectToServer, isConnected} = useTCP();

  const [isSCannerVisible, setIsScannerVisible] = useState<boolean>(false);
  const [nearByDevices, setNearByDevices] = useState<any[]>([]);

  const handleScan = (data: string) => {
    if (data) {
      const [connectionData, deviceName] = data
        .replace('tcp://', '')
        .split('|');
      const [host, port] = connectionData.split(':');
      // connect to server
      connectToServer(host, parseInt(port, 10), deviceName);
    }
  };

  const listenForDevices = async () => {
    const server = dgram.createSocket({
      type: 'udp4',
      reusePort: true,
    });

    const port = 57143;

    server.bind(port, () => {
      console.log('Listening to nearby devices.');
    });
    server.on('message', (msg, rinfo) => {
      const [connectionData, otherDevice] = msg
        ?.toString()
        .replace('tcp://', '')
        .split('|');

      setNearByDevices(prevDevices => {
        const deviceExists = prevDevices?.some(
          device => device?.name === otherDevice,
        );

        if (!deviceExists) {
          const newDevice = {
            id: `${Date.now()}_${Math.random()}`,
            name: otherDevice,
            image: device,
            fullAddress: msg?.toString(),
            position: getRandomPosition(
              150,
              prevDevices?.map(d => d.position),
              50,
            ),
            scale: new Animated.Value(0),
          };

          Animated.timing(newDevice.scale, {
            toValue: 1,
            duration: 1500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }).start();

          return [...prevDevices, newDevice];
        }

        return [...prevDevices];
      });
    });
  };

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     if (nearByDevices.length < deviceNames.length) {
  //       console.log('Near by devices', nearByDevices);
  //       console.log('Near by devices', nearByDevices);

  //       const newDevice = {
  //         id: `${Date.now()}_${Math.random()}`,
  //         name: deviceNames[nearByDevices.length],
  //         image: device,
  //         position: getRandomPosition(
  //           150,
  //           nearByDevices?.map(d => d.position),
  //           50,
  //         ),
  //         scale: new Animated.Value(0),
  //       };

  //       console.log('New device: ', newDevice);

  //       setNearByDevices(prevDevices => [...prevDevices, newDevice]);

  //       Animated.timing(newDevice.scale, {
  //         toValue: 1,
  //         duration: 1500,
  //         easing: Easing.out(Easing.ease),
  //         useNativeDriver: true,
  //       }).start();
  //     } else {
  //       clearInterval(timer);
  //     }
  //   }, 2000);

  //   return () => clearInterval(timer);
  // }, [nearByDevices]);

  const getRandomPosition = (
    radius: number,
    existingPositions: {x: number; y: number}[],
    minDistance: number,
  ) => {
    let position: any;
    let isOverlapping: boolean;

    do {
      const angle = Math.random() * 360;
      const distance = Math.random() * (radius - 50) + 50;
      const x = distance * Math.cos((angle + Math.PI) / 180);
      const y = distance * Math.sin((angle + Math.PI) / 180);

      console.log('Existing positions:', existingPositions);

      position = {x, y};
      isOverlapping = existingPositions.some(pos => {
        const dx = pos.x - position.x;
        const dy = pos.y - position.y;

        return Math.sqrt(dx * dx + dy * dy) < minDistance;
      });
    } while (isOverlapping);
    return position;
  };

  useEffect(() => {
    let udpServer: any;
    const setUpServer = async () => {
      udpServer = await listenForDevices();
    };

    setUpServer();

    return () => {
      if (udpServer) {
        udpServer.close(() => {
          console.log('UDP server closed.');
        });
      }
      setNearByDevices([]);
    };
  }, []);

  const handleGoBack = () => {
    goBack();
  };

  useEffect(() => {
    if (isConnected) {
      navigate('ConnectionScreen');
    }
  }, [isConnected]);

  return (
    <LinearGradient
      colors={['#FFFFFF', '#B689ED', '#A066E5']}
      style={sendStyles?.container}
      start={{x: 0, y: 1}}
      end={{x: 0, y: 0}}>
      <SafeAreaView />
      <View style={sendStyles.mainContainer}>
        <View style={sendStyles.infoContainer}>
          <Icon name="search" iconFamily="Ionicons" color="white" size={40} />
          <CustomText
            fontFamily="Okra-Bold"
            color="#fff"
            fontSize={16}
            style={{marginTop: 20}}>
            Looking for devices
          </CustomText>

          <CustomText
            fontFamily="Okra-Medium"
            color="#fff"
            fontSize={12}
            style={{textAlign: 'center'}}>
            Ensure your device hot-spot is active and the receiver device is
            connected to it.
          </CustomText>
          <BreakerText text="Or" />
          <TouchableOpacity
            style={sendStyles.qrButton}
            onPress={() => setIsScannerVisible(true)}>
            <Icon
              name="qrcode-scan"
              iconFamily="MaterialCommunityIcons"
              color={Colors.primary}
              size={16}
            />
            <CustomText fontFamily="Okra-Bold" color={Colors.primary}>
              Scan QR
            </CustomText>
          </TouchableOpacity>
        </View>

        <View style={sendStyles.animationContainer}>
          <View style={sendStyles.lottieContainer}>
            <LottieView
              style={sendStyles.lottie}
              source={require('../assets/animations/scanner.json')}
              autoPlay
              loop={true}
              hardwareAccelerationAndroid
            />
            {nearByDevices?.map(device => (
              <Animated.View
                key={device?.id}
                style={[
                  sendStyles.deviceDot,
                  {
                    transform: [{scale: device?.scale}],
                    left: screenWidth / 2.33 + device?.position.x,
                    top: screenWidth / 2.33 + device?.position.y,
                  },
                ]}>
                <TouchableOpacity
                  style={sendStyles.popup}
                  onPress={() => handleScan(device?.fullAddress)}>
                  <Image source={device.image} style={sendStyles.deviceImage} />
                  <CustomText
                    numberOfLines={1}
                    color="#333"
                    fontFamily="Okra-Bold"
                    fontSize={8}
                    style={sendStyles.deviceText}>
                    {device.name}
                  </CustomText>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
          <Image source={profile2} style={sendStyles.profileImage} />
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
        <QRScannerModel
          visible={isSCannerVisible}
          onClose={() => setIsScannerVisible(false)}
        />
      )}
    </LinearGradient>
  );
};

export default SendScreen;
