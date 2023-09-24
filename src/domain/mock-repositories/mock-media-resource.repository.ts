import { MediaResource } from '../schemas/media-resource.schema';

export const mockMediaResource = (): MediaResource => {
  const mediaResource = new MediaResource();
  mediaResource.id = 'mock-id';
  return mediaResource;
};
