import React, {
  createContext,
  FC,
  useCallback,
  useContext,
  useState,
} from 'react';
import {useChunkStore} from '../database/ChunkStore';
import TcpSocket from 'react-native-tcp-socket';
import DeviceInfo from 'react-native-device-info';
import {Buffer} from 'buffer';
import {Alert, Platform} from 'react-native';
import RNFS from 'react-native-fs';
import {v4 as uuidv4} from 'uuid';
import 'react-native-get-random-values';
import {produce} from 'immer';
import {receiveChunkAck, receiveFileAck, sendChunkAck} from './TCPUtils';

interface TCPContextType {
  server: any;
  client: any;
  isConnected: boolean;
  connectedDevice: any;
  sentFiles: any;
  receivedFiles: any;
  totalSentBytes: number;
  totalReceivedBytes: number;
  startServer: (port: number) => void;
  connectToServer: (host: string, port: number, deviceName: string) => void;
  sendMessage: (message: string | Buffer) => void;
  sendFileAck: (file: any, type: 'image' | 'file') => void;
  disconnect: () => void;
}

const TCPContext = createContext<TCPContextType | undefined>(undefined);

export const useTCP = (): TCPContextType => {
  const context = useContext(TCPContext);
  if (!context) {
    throw new Error('useTCP must be used within a TCP Provider');
  }
  return context;
};

const options = {
  keystore: require('../../tls_certs/server-keystore.p12'),
};

export const TCPProvider: FC<{children: React.ReactNode}> = ({children}) => {
  const [server, setServer] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [isConnected, setConnected] = useState<boolean>(false);
  const [connectedDevice, setConnectedDevice] = useState<any>(null);
  const [serverSocket, setServerSocket] = useState<any>(null);
  const [sentFiles, setSentFiles] = useState<any>(null);
  const [receivedFiles, setReceivedFiles] = useState<any>(null);
  const [totalSentBytes, setTotalSentBytes] = useState<number>(0);
  const [totalReceivedBytes, setTotalReceivedBytes] = useState<number>(0);

  const {
    currentChunkSet,
    setCurrentChunkSet: setCurrentChunkSet,
    setChunkStore,
  } = useChunkStore();

  // Start Server
  const startServer = useCallback(
    async (port: number) => {
      if (server) {
        console.log('server is already running.');
        return;
      }

      const newServer = TcpSocket.createTLSServer(options, socket => {
        setServerSocket(socket);
        socket.setNoDelay(true);
        socket.readableHighWaterMark = 1024 * 1024 * 1;
        socket.on('data', data => {
          const parsedData = JSON.parse(data?.toString());
          if (parsedData?.event === 'connect') {
            setConnectedDevice(parsedData?.deviceName);
          }
          if (parsedData.event === 'file_ack') {
            receiveFileAck(parsedData?.file, socket, setReceivedFiles);
          }
          if (parsedData.event === 'send_chunk_ack') {
            sendChunkAck(
              parsedData?.chunkNo,
              socket,
              setTotalSentBytes,
              setSentFiles,
            );
          }
          if (parsedData.event === 'receive_chunk_ack') {
            receiveChunkAck(
              parsedData?.chunk,
              parsedData?.chunkNo,
              socket,
              setTotalReceivedBytes,
              generateFile,
            );
          }
        });
        socket.on('close', () => {
          console.log('Client disconnected');
          setReceivedFiles([]);
          setSentFiles([]);
          setCurrentChunkSet(null);
          setTotalReceivedBytes(0);
          setChunkStore(null);
          setConnected(false);
          disconnect();
        });
        socket.on('error', error => {
          console.error(`Socket error: ${error}`);
        });
      });

      newServer.listen({port, host: '0.0.0.0'}, () => {
        const address = newServer.address;
        console.log(`Server is running on address: ${address}`);
      });

      newServer.on('error', error => {
        console.error('Server error:', error);
      });

      setServer(newServer);
    },
    [server],
  );

  // Start Client
  const connectToServer = useCallback(
    (host: string, port: number, device: string) => {
      const newClient = TcpSocket.connectTLS(
        {
          host,
          port,
          cert: true,
          ca: require('../../tls_certs/server-cert.pem'),
        },
        () => {
          setConnected(true);
          setConnectedDevice(device);
          const myDeviceName = DeviceInfo.getDeviceNameSync();
          newClient.write(
            JSON.stringify({
              event: 'connect',
              deviceName: myDeviceName,
            }),
          );
        },
      );
      newClient.setNoDelay(true);
      newClient.readableHighWaterMark = 1024 * 1024 * 1;
      newClient.writableHighWaterMark = 1024 * 1024 * 1;

      newClient.on('data', data => {
        const parsedData = JSON.parse(data?.toString());
        if (parsedData.event === 'file_ack') {
          receiveFileAck(parsedData?.file, newClient, setReceivedFiles);
        }

        if (parsedData.event === 'send_chunk_ack') {
          sendChunkAck(
            parsedData?.chunkNo,
            newClient,
            setTotalSentBytes,
            setSentFiles,
          );
        }
        if (parsedData.event === 'receive_chunk_ack') {
          receiveChunkAck(
            parsedData?.chunk,
            parsedData?.chunkNo,
            newClient,
            setTotalReceivedBytes,
            generateFile,
          );
        }
      });
      newClient.on('close', () => {
        console.log('Client disconnected');
        setReceivedFiles([]);
        setSentFiles([]);
        setCurrentChunkSet(null);
        setTotalReceivedBytes(0);
        setChunkStore(null);
        setConnected(false);
        disconnect();
      });

      newClient.on('error', error => {
        console.error('Client error:', error);
      });
      setClient(newClient);
    },
    [client],
  );

  // Disconnect
  const disconnect = useCallback(() => {
    if (client) {
      client.destroy();
    } else if (server) {
      server.close();
    }
    setReceivedFiles([]);
    setSentFiles([]);
    setCurrentChunkSet(null);
    setTotalReceivedBytes(0);
    setChunkStore(null);
    setConnected(false);
  }, [client, server]);

  // send message
  const sendMessage = useCallback(
    (message: string | Buffer) => {
      if (client) {
        client.write(JSON.stringify(message));
        console.log('Sent from client: ', message);
      } else if (server) {
        serverSocket.write(JSON.stringify(message));
        console.log('Sent from server: ', message);
      } else {
        throw new Error('No client or server socket available');
      }
    },
    [client, server],
  );

  // send file ack
  const sendFileAck = async (file: any, type: 'image' | 'file') => {
    if (currentChunkSet !== null) {
      Alert.alert('wait for current file to be sent');
      return;
    }
    const normalizedPath =
      Platform.OS === 'ios' ? file?.uri?.replace('file://', '') : file?.uri;
    const fileData = await RNFS.readFile(normalizedPath, 'base64');
    const buffer = Buffer.from(fileData, 'base64');
    const CHUNK_SIZE = 1024 * 8;
    let totalChunks = 0;
    let offset = 0;
    let chunkArray = [];
    while (offset < buffer.length) {
      const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
      totalChunks += 1;
      chunkArray.push(chunk);
      offset += chunk.length;
    }
    const rawData = {
      id: uuidv4(),
      name: type === 'file' ? file?.name : file?.fileName,
      size: type === 'file' ? file?.size : file?.fileSize,
      mimeType: type === 'file' ? 'file' : '.jpg',
      totalChunks,
    };
    setCurrentChunkSet({
      id: rawData?.id,
      chunkArray,
      totalChunks,
    });
    setSentFiles((prevData: any) =>
      produce(prevData, (draft: any) => {
        draft.push({
          ...rawData,
          uri: file?.uri,
        });
      }),
    );

    const socket = client || serverSocket;
    if (!socket) return;

    try {
      console.log('File ack done.');
      socket.write(
        JSON.stringify({
          event: 'file_ack',
          file: rawData,
        }),
      );
    } catch (err) {
      console.error('Error Sending file.', err);
    }
  };

  const generateFile = async () => {
    const {chunkStore, resetChunkStore} = useChunkStore.getState();

    if (!chunkStore) {
      console.log('No chunks or files are available to process.');
      return;
    }

    if (chunkStore?.totalChunks !== chunkStore?.chunkArray.length) {
      console.log('not all chunks are received');
      return;
    }

    try {
      const combinedChunks = Buffer.concat(chunkStore.chunkArray);
      const platformPath =
        Platform.OS == 'ios'
          ? `${RNFS.DownloadDirectoryPath}`
          : `${RNFS.DocumentDirectoryPath}`;

      const filePath = `${platformPath}/${chunkStore.name}`;
      await RNFS.writeFile(
        filePath,
        combinedChunks.toString('base64'),
        'base64',
      );
      setReceivedFiles((prevFiles: any) => {
        produce(prevFiles, (draftFiles: any) => {
          const fileIndex = draftFiles?.findIndex(
            (f: any) => f.id === chunkStore.id,
          );
          if (fileIndex !== -1) {
            draftFiles[fileIndex] = {
              ...draftFiles[fileIndex],
              uri: filePath,
              available: true,
            };
          }
        });
      });
      console.log('file saved successfully.', filePath);
    } catch (error) {
      console.error('error generating files', error);
    }
  };

  return (
    <TCPContext.Provider
      value={{
        server,
        client,
        isConnected,
        connectedDevice,
        sentFiles,
        receivedFiles,
        totalSentBytes,
        totalReceivedBytes,
        startServer,
        connectToServer,
        disconnect,
        sendMessage,
        sendFileAck,
      }}>
      {children}
    </TCPContext.Provider>
  );
};
