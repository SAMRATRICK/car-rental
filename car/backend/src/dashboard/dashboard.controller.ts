import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('GetDashboardData')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardData() {
    return this.dashboardService.getDashboardData();
  }
}
