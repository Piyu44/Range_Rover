export interface FrameSequence {
  folder: string;
  frameCount: number;
  prefix: string;
  padLength: number;
  extension: string;
}

export const frameSequences: FrameSequence[] = [
  { folder: '1_frames', frameCount: 960, prefix: 'frame_', padLength: 6, extension: '.png' },
];

export const getTotalFrames = () => {
  return frameSequences.reduce((acc, seq) => acc + seq.frameCount, 0);
};
