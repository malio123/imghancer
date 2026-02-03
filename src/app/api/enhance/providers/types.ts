export type EnhanceScale = 2 | 4;

export type CreateJobInput = {
  id: string;
  dataUrl: string;
  scale: EnhanceScale;
};

export type CreateJobResult = {
  inputPath: string;
  outputPath: string;
  mime: string;
};
