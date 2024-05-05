export class UrlEntity {
  createdAt: Date;
  url: string;
  callbackUrl: string;
  path: string;
  numCallbackAttempts: number;
  callbackLastAttemptedAt?: Date;
  callbackNextAttemptAt?: Date;
  acknowledged: boolean;
}
