"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding data...');
    const permissions = [
        { code: 'dashboard.view', name: 'Xem tổng quan', module: 'dashboard' },
        { code: 'customers.view', name: 'Xem khách hàng', module: 'customers' },
        { code: 'customers.manage', name: 'Quản lý khách hàng', module: 'customers' },
        { code: 'orders.view', name: 'Xem đơn hàng', module: 'orders' },
        { code: 'orders.manage', name: 'Quản lý đơn hàng', module: 'orders' },
        { code: 'payments.view', name: 'Xem giao dịch', module: 'payments' },
        { code: 'courses.view', name: 'Xem khóa học', module: 'courses' },
        { code: 'courses.manage', name: 'Quản lý khóa học', module: 'courses' },
        { code: 'schedules.view', name: 'Xem lịch học', module: 'schedules' },
        { code: 'schedules.manage', name: 'Quản lý lịch học', module: 'schedules' },
        { code: 'reports.view', name: 'Xem báo cáo', module: 'reports' },
        { code: 'users.view', name: 'Xem nhân sự', module: 'users' },
        { code: 'users.manage', name: 'Quản lý nhân sự', module: 'users' },
        { code: 'roles.view', name: 'Xem vai trò & quyền', module: 'roles' },
        { code: 'roles.manage', name: 'Quản lý vai trò & quyền', module: 'roles' },
        { code: 'webhooks.view', name: 'Xem webhook', module: 'webhooks' },
        { code: 'webhooks.manage', name: 'Quản lý webhook', module: 'webhooks' },
        { code: 'logs.view', name: 'Xem lịch sử hệ thống', module: 'logs' },
        { code: 'settings.view', name: 'Xem cài đặt', module: 'settings' },
        { code: 'settings.manage', name: 'Quản lý cài đặt', module: 'settings' },
    ];
    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { code: perm.code },
            update: perm,
            create: perm,
        });
    }
    const roles = [
        { name: 'ADMIN', description: 'Quản trị viên toàn quyền', isSystem: true },
        { name: 'SALE', description: 'Nhân viên Sale / CSKH', isSystem: true },
        { name: 'INSTRUCTOR', description: 'Giảng viên', isSystem: true },
        { name: 'ACCOUNTANT', description: 'Kế toán', isSystem: true },
    ];
    const dbRoles = {};
    for (const role of roles) {
        const createdRole = await prisma.role.upsert({
            where: { name: role.name },
            update: role,
            create: role,
        });
        dbRoles[createdRole.name] = createdRole;
    }
    const allPermissions = await prisma.permission.findMany();
    for (const perm of allPermissions) {
        await prisma.rolePermission.upsert({
            where: { roleId_permissionId: { roleId: dbRoles['ADMIN'].id, permissionId: perm.id } },
            update: {},
            create: { roleId: dbRoles['ADMIN'].id, permissionId: perm.id },
        });
    }
    const salePerms = allPermissions.filter(p => [
        'dashboard.view', 'customers.view', 'customers.manage',
        'orders.view', 'orders.manage', 'schedules.view'
    ].includes(p.code));
    for (const perm of salePerms) {
        await prisma.rolePermission.upsert({
            where: { roleId_permissionId: { roleId: dbRoles['SALE'].id, permissionId: perm.id } },
            update: {},
            create: { roleId: dbRoles['SALE'].id, permissionId: perm.id },
        });
    }
    console.log('Update existing users with role ID...');
    const users = await prisma.user.findMany();
    for (const user of users) {
        const fallbackRole = dbRoles['SALE'];
        if (!user.roleId) {
            await prisma.user.update({
                where: { id: user.id },
                data: { roleId: fallbackRole.id }
            });
        }
    }
    const defaultSettings = [
        {
            key: 'theme',
            value: {
                primaryColor: '#2563eb',
                mode: 'light'
            }
        },
        {
            key: 'general',
            value: {
                siteName: 'CSMS CRM',
            }
        }
    ];
    for (const setting of defaultSettings) {
        await prisma.systemSetting.upsert({
            where: { key: setting.key },
            update: setting,
            create: setting,
        });
    }
    const adminEmail = 'admin@csms.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
        console.log('Creating default admin user...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                name: 'Hệ thống Admin',
                roleId: dbRoles['ADMIN'].id,
            },
        });
        console.log('Default admin created: admin@csms.com / admin123');
    }
    else {
        await prisma.user.update({
            where: { email: adminEmail },
            data: { roleId: dbRoles['ADMIN'].id }
        });
    }
    console.log('Seeding completed!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map