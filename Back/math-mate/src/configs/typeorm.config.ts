import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeORMConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'qkdl546335',
  database: 'app',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
};
