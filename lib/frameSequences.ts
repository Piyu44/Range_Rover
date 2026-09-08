export interface FrameSequence {
  folder: string;
  frameCount: number;
  prefix: string;
  padLength: number;
  extension: string;
}

export const frameSequences: FrameSequence[] = [
  { folder: '1', frameCount: 960, prefix: 'frame_', padLength: 6, extension: '.png' },
  { folder: '2', frameCount: 960, prefix: 'frame_', padLength: 6, extension: '.png' },
  { folder: '3', frameCount: 960, prefix: 'frame_', padLength: 6, extension: '.png' },
  { folder: '4', frameCount: 960, prefix: 'frame_', padLength: 6, extension: '.png' },
  { folder: '5', frameCount: 960, prefix: 'frame_', padLength: 6, extension: '.png' },
];

export const getTotalFrames = () => {
  return frameSequences.reduce((acc, seq) => acc + seq.frameCount, 0);
};
