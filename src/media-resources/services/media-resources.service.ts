import { Injectable } from '@nestjs/common';
import { MediaResourceRepository } from 'src/domain/repositories/media-resource.repository';
import { MediaResourceManager } from '../managers/media-resource.manager';

@Injectable()
export class MediaResourcesService {
  constructor(
    private readonly resourceManager: MediaResourceManager,
    private readonly mediaRepo: MediaResourceRepository,
  ) {}
}
