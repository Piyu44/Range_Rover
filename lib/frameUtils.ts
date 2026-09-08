import { FrameSequence, frameSequences } from './frameSequences';

export const padNumber = (num: number, size: number) => {
  let s = num.toString();
  while (s.length < size) s = "0" + s;
  return s;
};

export const getFrameUrl = (globalIndex: number): string => {
  let remaining = globalIndex;
  
  for (let i = 0; i < frameSequences.length; i++) {
    const seq = frameSequences[i];
    if (remaining < seq.frameCount) {
      const localFrame = remaining + 1; // 1-indexed filenames
      return `/frames/${seq.folder}/${seq.prefix}${padNumber(localFrame, seq.padLength)}${seq.extension}`;
    }
    remaining -= seq.frameCount;
  }
  
  // Fallback to last frame if out of bounds
  const lastSeq = frameSequences[frameSequences.length - 1];
  return `/frames/${lastSeq.folder}/${lastSeq.prefix}${padNumber(lastSeq.frameCount, lastSeq.padLength)}${lastSeq.extension}`;
};
