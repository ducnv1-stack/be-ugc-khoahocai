import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    const settings = await this.prisma.systemSetting.findMany();
    const result: Record<string, any> = {};
    settings.forEach(s => {
      result[s.key] = s.value;
    });
    return result;
  }

  async updateSetting(key: string, value: any) {
    return this.prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async updateMultipleSettings(settings: Record<string, any>) {
    const promises = Object.entries(settings).map(([key, value]) =>
      this.prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    );
    await Promise.all(promises);
    return this.getSettings();
  }
}
