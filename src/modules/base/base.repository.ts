import { DataSource, EntityTarget, Repository } from 'typeorm';

export class BaseRepository<E> extends Repository<E> {
  constructor(
    public readonly dataSource: DataSource,
    protected entity: EntityTarget<E>,
  ) {
    super(entity, dataSource.createEntityManager());
  }
}
