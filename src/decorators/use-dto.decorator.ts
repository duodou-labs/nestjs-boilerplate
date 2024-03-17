import { type Constructor } from '@common/types/constructor.type';

export function UseDto(dtoClass: Constructor): ClassDecorator {
  return (ctor) => {
    if (!(<unknown>dtoClass)) {
      throw new Error('UseDto decorator requires dtoClass');
    }

    ctor.prototype.dtoClass = dtoClass;
  };
}
