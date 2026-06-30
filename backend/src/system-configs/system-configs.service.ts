import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from './system-config.entity';

@Injectable()
export class SystemConfigsService implements OnModuleInit {
  constructor(
    @InjectRepository(SystemConfig)
    private readonly repo: Repository<SystemConfig>,
  ) {}

  async onModuleInit() {
    // Ensure table exists in SQLite in production or development
    await this.repo.query(
      `CREATE TABLE IF NOT EXISTS system_configs (key TEXT PRIMARY KEY, value TEXT NOT NULL)`
    );

    // Seed default min_order_amount if not exists
    const minOrder = await this.repo.findOne({ where: { key: 'min_order_amount' } });
    if (!minOrder) {
      await this.repo.save({ key: 'min_order_amount', value: '500' });
      console.log('[CONFIG] Seeded default min_order_amount = 500');
    }
  }

  async get(key: string, defaultValue = ''): Promise<string> {
    const config = await this.repo.findOne({ where: { key } });
    return config ? config.value : defaultValue;
  }

  async update(key: string, value: string): Promise<SystemConfig> {
    let config = await this.repo.findOne({ where: { key } });
    if (config) {
      config.value = value;
    } else {
      config = this.repo.create({ key, value });
    }
    return this.repo.save(config);
  }
}
