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
        { code: 'dashboard.view', name: 'Xem tong quan', module: 'dashboard' },
        { code: 'customers.view', name: 'Xem khach hang', module: 'customers' },
        { code: 'customers.create', name: 'Tao khach hang', module: 'customers' },
        { code: 'customers.update', name: 'Sua khach hang', module: 'customers' },
        { code: 'customers.delete', name: 'Xoa khach hang', module: 'customers' },
        { code: 'customers.restore', name: 'Khoi phuc khach hang', module: 'customers' },
        { code: 'customers.manage', name: 'Quan ly khach hang', module: 'customers' },
        { code: 'orders.view', name: 'Xem don hang', module: 'orders' },
        { code: 'orders.create', name: 'Tao don hang', module: 'orders' },
        { code: 'orders.update', name: 'Sua don hang', module: 'orders' },
        { code: 'orders.delete', name: 'Xoa don hang', module: 'orders' },
        { code: 'orders.payment.update', name: 'Cap nhat thanh toan don hang', module: 'orders' },
        { code: 'orders.invoice.update', name: 'Cap nhat hoa don don hang', module: 'orders' },
        { code: 'orders.manage', name: 'Quan ly don hang', module: 'orders' },
        { code: 'payments.view', name: 'Xem giao dich', module: 'payments' },
        { code: 'payments.settings.view', name: 'Xem cai dat thanh toan', module: 'payments' },
        { code: 'payments.webhook-logs.view', name: 'Xem nhat ky webhook thanh toan', module: 'payments' },
        { code: 'courses.view', name: 'Xem khoa hoc', module: 'courses' },
        { code: 'courses.create', name: 'Tao khoa hoc', module: 'courses' },
        { code: 'courses.update', name: 'Sua khoa hoc', module: 'courses' },
        { code: 'courses.delete', name: 'Xoa khoa hoc', module: 'courses' },
        { code: 'courses.restore', name: 'Khoi phuc khoa hoc', module: 'courses' },
        { code: 'courses.manage', name: 'Quan ly khoa hoc', module: 'courses' },
        { code: 'schedules.view', name: 'Xem lich hoc', module: 'schedules' },
        { code: 'schedules.create', name: 'Tao lich hoc', module: 'schedules' },
        { code: 'schedules.update', name: 'Sua lich hoc', module: 'schedules' },
        { code: 'schedules.delete', name: 'Xoa lich hoc', module: 'schedules' },
        { code: 'schedules.manage', name: 'Quan ly lich hoc', module: 'schedules' },
        { code: 'reports.view', name: 'Xem bao cao', module: 'reports' },
        { code: 'reports.export', name: 'Xuat bao cao', module: 'reports' },
        { code: 'expenses.view', name: 'Xem chi phi', module: 'expenses' },
        { code: 'expenses.create', name: 'Tao chi phi', module: 'expenses' },
        { code: 'expenses.update', name: 'Sua chi phi', module: 'expenses' },
        { code: 'expenses.delete', name: 'Xoa chi phi', module: 'expenses' },
        { code: 'expenses.confirm', name: 'Xac nhan chi phi', module: 'expenses' },
        { code: 'expenses.report.view', name: 'Xem bao cao chi phi', module: 'expenses' },
        { code: 'expenses.manage', name: 'Quan ly chi phi', module: 'expenses' },
        { code: 'users.view', name: 'Xem nhan su', module: 'users' },
        { code: 'users.create', name: 'Tao nhan su', module: 'users' },
        { code: 'users.update', name: 'Sua nhan su', module: 'users' },
        { code: 'users.delete', name: 'Xoa nhan su', module: 'users' },
        { code: 'users.manage', name: 'Quan ly nhan su', module: 'users' },
        { code: 'roles.view', name: 'Xem vai tro va quyen', module: 'roles' },
        { code: 'roles.create', name: 'Tao vai tro va quyen', module: 'roles' },
        { code: 'roles.update', name: 'Sua vai tro va quyen', module: 'roles' },
        { code: 'roles.delete', name: 'Xoa vai tro va quyen', module: 'roles' },
        { code: 'roles.manage', name: 'Quan ly vai tro va quyen', module: 'roles' },
        { code: 'webhooks.view', name: 'Xem webhook', module: 'webhooks' },
        { code: 'webhooks.update', name: 'Sua webhook', module: 'webhooks' },
        { code: 'webhooks.manage', name: 'Quan ly webhook', module: 'webhooks' },
        { code: 'logs.view', name: 'Xem lich su he thong', module: 'logs' },
        { code: 'settings.view', name: 'Xem cai dat', module: 'settings' },
        { code: 'settings.update', name: 'Sua cai dat', module: 'settings' },
        { code: 'settings.manage', name: 'Quan ly cai dat', module: 'settings' },
    ];
    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { code: perm.code },
            update: perm,
            create: perm,
        });
    }
    const roles = [
        { name: 'ADMIN', description: 'Quan tri vien toan quyen', isSystem: true },
        { name: 'SALE', description: 'Nhan vien Sale / CSKH', isSystem: true },
        { name: 'INSTRUCTOR', description: 'Giang vien', isSystem: true },
        { name: 'ACCOUNTANT', description: 'Ke toan', isSystem: true },
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
            where: {
                roleId_permissionId: {
                    roleId: dbRoles.ADMIN.id,
                    permissionId: perm.id,
                },
            },
            update: {},
            create: { roleId: dbRoles.ADMIN.id, permissionId: perm.id },
        });
    }
    const salePerms = allPermissions.filter((p) => [
        'dashboard.view',
        'customers.view',
        'customers.manage',
        'orders.view',
        'orders.manage',
        'schedules.view',
    ].includes(p.code));
    for (const perm of salePerms) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: dbRoles.SALE.id,
                    permissionId: perm.id,
                },
            },
            update: {},
            create: { roleId: dbRoles.SALE.id, permissionId: perm.id },
        });
    }
    const accountantPerms = allPermissions.filter((p) => [
        'dashboard.view',
        'orders.view',
        'payments.view',
        'reports.view',
        'expenses.view',
        'expenses.create',
        'expenses.update',
        'expenses.delete',
        'expenses.confirm',
        'expenses.report.view',
        'expenses.manage',
    ].includes(p.code));
    for (const perm of accountantPerms) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: dbRoles.ACCOUNTANT.id,
                    permissionId: perm.id,
                },
            },
            update: {},
            create: { roleId: dbRoles.ACCOUNTANT.id, permissionId: perm.id },
        });
    }
    console.log('Update existing users with role ID...');
    const users = await prisma.user.findMany();
    for (const user of users) {
        if (!user.roleId) {
            await prisma.user.update({
                where: { id: user.id },
                data: { roleId: dbRoles.SALE.id },
            });
        }
    }
    const defaultSettings = [
        {
            key: 'theme',
            value: {
                primaryColor: '#2563eb',
                mode: 'light',
            },
        },
        {
            key: 'general',
            value: {
                siteName: 'CSMS CRM',
            },
        },
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
                name: 'He thong Admin',
                roleId: dbRoles.ADMIN.id,
            },
        });
        console.log('Default admin created: admin@csms.com / admin123');
    }
    else {
        await prisma.user.update({
            where: { email: adminEmail },
            data: { roleId: dbRoles.ADMIN.id },
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