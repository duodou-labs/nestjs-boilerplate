import { registerEnumType } from '@nestjs/graphql';

export enum BooleanEnum {
  TRUE = 'TRUE',
  FALSE = 'FALSE',
}

registerEnumType(BooleanEnum, { name: 'BooleanEnum' });
