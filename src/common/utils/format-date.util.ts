import { DateFormat } from '@common/enums/date-format.enum';
import * as dayjs from 'dayjs';

export const formatDate = (date: Date | string, pattern: DateFormat) => {
  return dayjs(date).format(pattern);
};
