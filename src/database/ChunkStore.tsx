import {create} from 'zustand';
import {Buffer} from 'buffer';

interface ChunkState {
  chunkStore: {
    id: string | null;
    name: string;
    totalChunks: number;
    chunkArray: Buffer[];
  } | null;
  currentChunkSet: {
    id: string | null;
    totalChunks: number;
    chunkArray: Buffer[];
  } | null;

  setChunkStore: (chunkStore: any) => void;
  resetChunkStore: () => void;
  setCurrentChunkSet: (chunkStore: any) => void;
  resetCurrentChunkStore: () => void;
}

export const useChunkStore = create<ChunkState>(set => ({
  chunkStore: null,
  currentChunkSet: null,
  setChunkStore: chunkStore => set({chunkStore}),
  resetChunkStore: () => set({chunkStore: null}),
  setCurrentChunkSet: currentChunkSet => set({currentChunkSet}),
  resetCurrentChunkStore: () => set({currentChunkSet: null}),
}));
