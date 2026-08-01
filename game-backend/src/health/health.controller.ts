import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PostgresConnector } from '../db/connectors/postgres/PostgresConnector';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly postgresConnector: PostgresConnector) {}

  @Get()
  @ApiOperation({ summary: 'Health endpoint for general service availability' })
  @ApiOkResponse({ description: 'Service is up and responding.' })
  getHealth() {
    return { status: 'ok' };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe for container health checks' })
  @ApiOkResponse({
    description: 'Service is alive and should not be restarted.',
  })
  getLiveHealth() {
    return { status: 'ok' };
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness probe that checks whether dependencies are reachable',
  })
  @ApiOkResponse({ description: 'Service is ready to receive traffic.' })
  async getReadyHealth() {
    try {
      const isHealthy = await this.postgresConnector.healthCheck();
      return isHealthy ? { status: 'ok' } : { status: 'error' };
    } catch {
      return { status: 'error' };
    }
  }
}
