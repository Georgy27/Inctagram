import { Metadata } from 'sharp';

export type ImageMetadataType = {
  [key in keyof Pick<Metadata, 'size' | 'width' | 'height'>]-?: Exclude<
    Metadata[key],
    undefined
  > | null;
};
