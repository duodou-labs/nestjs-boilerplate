import { DataSource, DataSourceOptions } from 'typeorm';
import { StorageDriver, addTransactionalDataSource, initializeTransactionalContext } from 'typeorm-transactional';
import { ConfigService } from './config.service';

const configService = new ConfigService();
const dataSource = new DataSource(configService.typeOrmConfig as DataSourceOptions);

initializeTransactionalContext({ storageDriver: StorageDriver.ASYNC_LOCAL_STORAGE });
addTransactionalDataSource(dataSource);

export default dataSource;
