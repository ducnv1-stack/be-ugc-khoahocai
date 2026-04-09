import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getSettings(): Promise<Record<string, any>>;
    updateSettings(body: Record<string, any>): Promise<Record<string, any>>;
}
