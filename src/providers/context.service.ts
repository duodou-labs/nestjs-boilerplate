import { UserDto } from '@users/dto/user.dto';
import * as requestContext from 'request-context';

export interface IRequestInfo {
  ipAddress: string;
  location: string;
  userAgent: string;
}

export class ContextService {
  private static readonly _nameSpace = 'request';
  private static _authUserKey = 'user_key';
  private static _authUserToken = 'user_access_token';
  private static _authUserEmail = 'user_email';
  private static _entity = 'entity';
  private static _authUserId = 'auth_user_id';

  static get<T>(key: string): T {
    return requestContext.get(ContextService._getKeyWithNamespace(key));
  }

  static set(key: string, value: any): void {
    requestContext.set(ContextService._getKeyWithNamespace(key), value);
  }

  private static _getKeyWithNamespace(key: string): string {
    return `${ContextService._nameSpace}.${key}`;
  }

  static setRolesContext(roles: { id: number; name: string }[]): void {
    ContextService.set('roleContext', roles);
  }

  static getRolesContext(): { id: number; name: string }[] {
    return ContextService.get('roleContext');
  }

  static setRequestInfo(info: IRequestInfo): void {
    ContextService.set('requestInfo', info);
  }

  static getRequestInfo(): IRequestInfo {
    return ContextService.get('requestInfo');
  }

  static setAuthUserId(id: string): void {
    return ContextService.set(this._authUserId, id);
  }

  static getAuthUserId(): string {
    return ContextService.get(this._authUserId);
  }

  static setAuthUser(user: UserDto): void {
    this.setAuthUserId(user.id);
    ContextService.set(this._authUserKey, user);
  }

  static getAuthUser(): UserDto {
    return ContextService.get(this._authUserKey);
  }

  static setAuthAccessToken(id: string): void {
    ContextService.set(this._authUserToken, id);
  }

  static getAuthAccessToken(): string {
    return ContextService.get(this._authUserToken);
  }

  static setAuthUserEmail(email: string): void {
    ContextService.set(this._authUserEmail, email);
  }

  static getAuthUserEmail(): string {
    return ContextService.get(this._authUserEmail);
  }

  static setEntity(entity: string): void {
    ContextService.set(this._entity, entity);
  }

  static getEntity(): string {
    return ContextService.get(this._entity);
  }
}
