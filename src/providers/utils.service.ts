import { createHash, pbkdf2, randomBytes } from 'crypto';
import { IResponseHashPassword } from './interfaces/IResponseHashPassword';

export class UtilsService {
  /**
   * convert entity to dto class instance
   * @param {{new(entity: E, options: any): T}} model
   * @param {E[] | E} entity
   * @param options
   * @returns {T[] | T}
   */
  public static toDto<T, E>(model: new (entity: E, options?: any) => T, entity: E, options?: any): T;
  public static toDto<T, E>(model: new (entity: E, options?: any) => T, entity: E[], options?: any): T[];
  public static toDto<T, E>(model: new (entity: E, options?: any) => T, entity: E | E[], options?: any): T | T[] {
    if (Array.isArray(entity)) {
      return entity.map((u) => new model(u, options));
    }

    return new model(entity, options);
  }

  static async hashPassword(password: string): Promise<IResponseHashPassword> {
    const salt = randomBytes(16).toString('hex');

    return new Promise((rs, rj) => {
      pbkdf2(password, salt, 1000, 64, 'sha512', (error, derivedKey) => {
        if (error) {
          return rj(error);
        }

        return rs({ hash: derivedKey.toString('hex'), salt });
      });
    });
  }

  static async comparePassword(password: string, salt: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      pbkdf2(password, salt, 1000, 64, 'sha512', (error, derivedKey) => {
        if (error) {
          return reject(error);
        }
        return resolve(hash === derivedKey.toString('hex'));
      });
    });
  }

  static md5hash(text: string): string {
    return createHash('md5').update(text).digest('hex');
  }
}

export const groupBy = <T, R>(
  array: T[],
  keyStrategy: (v: T) => string | number,
  elementsGrouped?: (v: T) => R | string | number,
): Record<string | number, R[] | undefined> => {
  return array.reduce((ac, x) => {
    if (elementsGrouped) {
      (ac[keyStrategy(x)] = ac[keyStrategy(x)] || []).push(elementsGrouped(x));
    } else {
      (ac[keyStrategy(x)] = ac[keyStrategy(x)] || []).push(x);
    }

    return ac;
  }, {});
};
