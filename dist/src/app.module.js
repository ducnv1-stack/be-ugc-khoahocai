"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const settings_module_1 = require("./settings/settings.module");
const roles_module_1 = require("./roles/roles.module");
const courses_module_1 = require("./courses/courses.module");
const customers_module_1 = require("./customers/customers.module");
const orders_module_1 = require("./orders/orders.module");
const payments_module_1 = require("./payments/payments.module");
const socket_module_1 = require("./socket/socket.module");
const notifications_module_1 = require("./notifications/notifications.module");
const audit_module_1 = require("./audit/audit.module");
const stats_module_1 = require("./stats/stats.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            settings_module_1.SettingsModule,
            roles_module_1.RolesModule,
            courses_module_1.CoursesModule,
            customers_module_1.CustomersModule,
            orders_module_1.OrdersModule,
            payments_module_1.PaymentsModule,
            socket_module_1.SocketModule,
            notifications_module_1.NotificationsModule,
            audit_module_1.AuditModule,
            stats_module_1.StatsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map