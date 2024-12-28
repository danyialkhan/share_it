import {Alert} from 'react-native';
import {useChunkStore} from '../database/ChunkStore';
import {produce} from 'immer';

export const receiveFileAck = async (
  data: any,
  socket: any,
  setReceivedFiles: any,
) => {
  const {setChunkStore, chunkStore} = useChunkStore.getState();

  if (chunkStore) {
    Alert.alert('There are files to be received wait');
    return;
  }

  setReceivedFiles((prevData: any) =>
    produce(prevData, (draft: any) => {
      draft.push(data);
    }),
  );

  setChunkStore({
    id: data?.id,
    totalChunks: data?.totalChunks,
    name: data?.name,
    size: data?.size,
    mimeType: data?.mimeType,
    chunkArray: [],
  });

  if (!socket) {
    console.log('socket not available');
    return;
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 10));
    console.log('File received');
    socket.write(JSON.stringify({event: 'send_chunk_ack', chunkNo: 0}));
    console.log('Requested for first chunk');
  } catch (error) {
    console.error('Error receiving file:', error);
  }
};

export const sendChunkAck = async (
  chunkIndex: number,
  socket: any,
  setTotalSentBytes: any,
  setSentFiles: any,
) => {
  const {currentChunkSet, resetCurrentChunkStore} = useChunkStore.getState();

  if (!currentChunkSet) {
    console.log('There are no chunks to be sent.');
    return;
  }
  if (!socket) {
    console.log('socket not available');
    return;
  }

  const totalChunks = currentChunkSet.totalChunks;

  try {
    await new Promise(resolve => setTimeout(resolve, 10));
    console.log('sending files');
    socket.write(
      JSON.stringify({
        event: 'receive_chunk_ack',
        chunk: currentChunkSet?.chunkArray[chunkIndex].toString('base64'),
        chunkNo: chunkIndex,
      }),
    );
    setTotalSentBytes(
      (prev: number) => prev + currentChunkSet?.chunkArray[chunkIndex]?.length,
    );

    if (chunkIndex + 2 > totalChunks) {
      console.log('all chunks sent successfully');
      setSentFiles((prev: any) =>
        produce(prev, (draftFiles: any) => {
          const fileIndex = draftFiles?.findIndex(
            (f: any) => f?.id === currentChunkSet.id,
          );
          if (fileIndex != -1) {
            draftFiles[fileIndex].available = true;
          }
        }),
      );
      resetCurrentChunkStore();
    }
  } catch (error) {
    console.error('Error sending file:', error);
  }
};

export const receiveChunkAck = async (
  chunk: any,
  chunkNumber: any,
  socket: any,
  setTotalReceivedBytes: any,
  generateFile: any,
) => {
  const {chunkStore, resetChunkStore, setChunkStore} = useChunkStore.getState();

  if (!chunkStore) {
    console.log('chunk store is null');
    return;
  }

  try {
    const bufferChunk = Buffer.from(chunk, 'base64');
    const updatedChunkArray = [...(chunkStore.chunkArray || [])];
    updatedChunkArray[chunkNumber] = bufferChunk;
    setChunkStore({
      ...chunkStore,
      chunkArray: updatedChunkArray,
    });
    setTotalReceivedBytes((prev: number) => (prev += bufferChunk.length));
  } catch (error) {
    console.error('Error :', error);
  }

  if (!socket) {
    console.log('socket not available');
    return;
  }

  if (chunkNumber + 1 === chunkStore?.chunkArray.length) {
    console.log('All chunks are received');
    generateFile();
    resetChunkStore();
    return;
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 10));
    console.log('Requested for next chunk');
    socket.write(
      JSON.stringify({event: 'send_chunk_ack', chunkNo: chunkNumber + 1}),
    );
  } catch (error) {
    console.error('Error :', error);
  }
};
