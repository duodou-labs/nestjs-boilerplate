import { registerEnumType } from '@nestjs/graphql';

export enum Brand {
  HONDA = 'HONDA',
  YAMAHA = 'YAMAHA',
}

registerEnumType(Brand, { name: 'Brand' });
