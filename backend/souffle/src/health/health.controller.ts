import {
  Controller,
  Get,
} from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MicroserviceHealthIndicator,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { Transport } from '@nestjs/microservices';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private microservice: MicroserviceHealthIndicator,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // PostgreSQL 연결 확인 (TypeORM 이름 기준)
      () => this.db.pingCheck('database'),

      // Redis TCP 연결 확인
      () =>
        this.microservice.pingCheck('redis', {
          transport: Transport.TCP,
          options: { host: 'localhost', port: 6379 },
        }),
    ]);
  }
}