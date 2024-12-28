import {View, Text, SafeAreaView, TouchableOpacity} from 'react-native';
import React, {FC, useEffect, useState} from 'react';
import {useTCP} from '../service/TCPProvider';
import Icon from '../components/global/Icon';
import {sendStyles} from '../styles/sendStyles';
import LinearGradient from 'react-native-linear-gradient';
import {connectionStyles} from '../styles/connectionStyles';
import CustomText from '../components/global/CustomText';
import Options from '../components/home/Options';
import {goBack, resetAndNavigate} from '../utils/NavigationUtil';
import {formatFileSize} from '../utils/libraryHelpers';

const ConnectionScreen: FC = () => {
  const {
    connectedDevice,
    sendFileAck,
    disconnect,
    sentFiles,
    receivedFiles,
    totalReceivedBytes,
    totalSentBytes,
    isConnected,
  } = useTCP();

  const [activeTab, setActiveTab] = useState<'SENT' | 'RECEIVED'>('SENT');

  const renderThumbnail = (mimeType: string) => {
    switch (mimeType) {
      case '.mp3':
        return (
          <Icon
            name="musical-notes"
            iconFamily="Ionicons"
            color="blue"
            size={16}
          />
        );
      case '.mp4':
        return (
          <Icon name="videocam" iconFamily="Ionicons" color="blue" size={16} />
        );
      case '.jpg':
      case '.png':
      case '.jpeg':
      case '.webp':
        return (
          <Icon name="image" iconFamily="Ionicons" color="blue" size={16} />
        );
      case '.pdf':
        return (
          <Icon name="document" iconFamily="Ionicons" color="blue" size={16} />
        );
      default:
        return (
          <Icon name="folder" iconFamily="Ionicons" color="blue" size={16} />
        );
    }
  };

  const onMediaPickedUp = (image: any) => {
    console.log('Picked image: ', image);
    sendFileAck(image, 'image');
  };

  const onFilePickedUp = (file: any) => {
    console.log('Picked file: ', file);
    sendFileAck(file, 'file');
  };

  useEffect(() => {
    if (isConnected) {
      resetAndNavigate('HomeScreen');
    }
  }, [isConnected]);

  const handleGoBack = () => {
    goBack();
  };

  const handleTabChange = (tab: 'SENT' | 'RECEIVED') => {
    setActiveTab(tab);
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#CDDAEE', '#8DBAFF']}
      style={sendStyles.container}
      start={{x: 0, y: 1}}
      end={{x: 0, y: 0}}>
      <SafeAreaView />
      <View style={sendStyles.mainContainer}>
        <View style={connectionStyles.container}>
          <View style={connectionStyles.connectionContainer}>
            <View style={{width: '55%'}}>
              <CustomText numberOfLines={1} fontFamily="Okra-Medium">
                Connected With
              </CustomText>
              <CustomText numberOfLines={1} fontFamily="Okra-Bold">
                {connectedDevice || 'Unknown'}
              </CustomText>
            </View>
            <TouchableOpacity
              onPress={() => disconnect()}
              style={connectionStyles.disconnectButton}>
              <Icon
                name="remove-circle"
                size={12}
                color="red"
                iconFamily="Ionicons"
              />
              <CustomText
                numberOfLines={1}
                fontFamily="Okra-Bold"
                fontSize={10}>
                Disconnect
              </CustomText>
            </TouchableOpacity>
          </View>
          <Options
            onMediaPickedUp={onMediaPickedUp}
            onFilePicked={onFilePickedUp}
          />
          <View style={connectionStyles.fileContainer}>
            <View style={connectionStyles.sendReceiveContainer}>
              <View style={connectionStyles.sendReceiveButtonContainer}>
                <TouchableOpacity
                  onPress={() => handleTabChange('SENT')}
                  style={[
                    connectionStyles.sendReceiveButton,
                    activeTab === 'SENT'
                      ? connectionStyles.activeButton
                      : connectionStyles.inactiveButton,
                  ]}>
                  <Icon
                    name="cloud-upload"
                    iconFamily="Ionicons"
                    size={12}
                    color={activeTab === 'SENT' ? '#fff' : 'blue'}
                  />
                  <CustomText
                    numberOfLines={1}
                    fontFamily="Okra-Bold"
                    fontSize={9}
                    color={activeTab === 'SENT' ? '#fff' : 'blue'}>
                    SENT
                  </CustomText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleTabChange('RECEIVED')}
                  style={[
                    connectionStyles.sendReceiveButton,
                    activeTab === 'RECEIVED'
                      ? connectionStyles.activeButton
                      : connectionStyles.inactiveButton,
                  ]}>
                  <Icon
                    name="cloud-upload"
                    iconFamily="Ionicons"
                    size={12}
                    color={activeTab === 'RECEIVED' ? '#fff' : 'blue'}
                  />
                  <CustomText
                    numberOfLines={1}
                    fontFamily="Okra-Bold"
                    fontSize={9}
                    color={activeTab === 'RECEIVED' ? '#fff' : 'blue'}>
                    RECEIVED
                  </CustomText>
                </TouchableOpacity>
              </View>
              <View style={connectionStyles.sendReceiveDataContainer}>
                <CustomText fontFamily="Okra-Bold" fontSize={9}>
                  {formatFileSize(
                    activeTab === 'SENT' ? totalSentBytes : totalReceivedBytes,
                  ) || 0}
                </CustomText>
                <CustomText fontFamily="Okra-Bold" fontSize={12}>
                  /
                </CustomText>
                <CustomText fontFamily="Okra-Bold" fontSize={10}>
                  {activeTab === 'SENT'
                    ? formatFileSize(
                        sentFiles.reduce(
                          (total: number, file: any) => total + file.size,
                          0,
                        ),
                      )
                    : formatFileSize(
                        receivedFiles.reduce(
                          (total: number, file: any) => total + file.size,
                          0,
                        ),
                      )}
                </CustomText>
              </View>
            </View>
          </View>
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
    </LinearGradient>
  );
};

export default ConnectionScreen;
