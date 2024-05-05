import { UrlEntity } from '../entity/url.entity';

export interface IUrlRepository {
  findOneByPath(url: string): Promise<UrlEntity | undefined>;

  findAll(): Promise<UrlEntity[]>;

  findReadyForCallback(
    maxNumCallbackAttempts: number,
    thresholdDate: Date,
  ): Promise<UrlEntity[]>;

  save(urlEntity: UrlEntity): Promise<UrlEntity>;
}

export class UrlRepository implements IUrlRepository {
  private dicPathAndUrl: { [p: string]: UrlEntity } = {};

  findOneByPath = (path: string): Promise<UrlEntity | undefined> => {
    const url = this.dicPathAndUrl[path];

    return Promise.resolve(url ? { ...url } : url);
  };

  findAll = (): Promise<UrlEntity[]> => {
    return Promise.resolve([...Object.values(this.dicPathAndUrl)]);
  };

  findReadyForCallback = (
    maxNumCallbackAttempts: number,
    thresholdDate: Date,
  ): Promise<UrlEntity[]> => {
    const urlEntities = Object.values(this.dicPathAndUrl).filter(
      (urlEntity) =>
        urlEntity.acknowledged === false &&
        urlEntity.numCallbackAttempts < maxNumCallbackAttempts &&
        (!urlEntity.callbackNextAttemptAt ||
          urlEntity.callbackNextAttemptAt < thresholdDate),
    );

    return Promise.resolve([...urlEntities]);
  };

  save = (urlEntity: UrlEntity): Promise<UrlEntity> => {
    this.dicPathAndUrl[urlEntity.path] = { ...urlEntity };

    return Promise.resolve(urlEntity);
  };
}

export const IUrlRepository = Symbol('IUrlRepository');
