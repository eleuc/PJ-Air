import { Controller, Get, Post, Query, Param, Res, Redirect } from '@nestjs/common';
import { XeroService } from './xero.service';
import type { Response } from 'express';


@Controller('xero')
export class XeroController {
  constructor(private readonly xeroService: XeroService) {}

  @Get('connect')
  async connect(@Res() res: Response) {
    const url = await this.xeroService.getXeroAuthUrl();
    return res.redirect(url);
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Res() res: Response) {
    if (code) {
      await this.xeroService.handleCallback(code);
    }
    // Redirect back to frontend admin settings or profile
    const frontendUrl = process.env.FRONTEND_URL || 'https://testing.jhoanes.com';
    return res.redirect(`${frontendUrl}/produccion/settings`);
  }

  @Post('sync/:orderId')
  async syncOrder(@Param('orderId') orderId: string) {
    return this.xeroService.syncOrderToXero(orderId);
  }
}
