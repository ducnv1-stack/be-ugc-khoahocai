import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // 1. Tạo Permissions
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

  // 2. Tạo System Roles
  const roles = [
    { name: 'ADMIN', description: 'Quản trị viên toàn quyền', isSystem: true },
    { name: 'SALE', description: 'Nhân viên Sale / CSKH', isSystem: true },
    { name: 'INSTRUCTOR', description: 'Giảng viên', isSystem: true },
    { name: 'ACCOUNTANT', description: 'Kế toán', isSystem: true },
  ];

  const dbRoles: Record<string, any> = {};
  for (const role of roles) {
    const createdRole = await prisma.role.upsert({
      where: { name: role.name },
      update: role,
      create: role,
    });
    dbRoles[createdRole.name] = createdRole;
  }

  // 3. Gán Permissions cho Roles
  const allPermissions = await prisma.permission.findMany();

  // ADMIN -> Tất cả quyền
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: dbRoles['ADMIN'].id, permissionId: perm.id } },
      update: {},
      create: { roleId: dbRoles['ADMIN'].id, permissionId: perm.id },
    });
  }

  // SALE -> Xem dashboard, sửa khách hàng, sửa đơn hàng, xem lịch học
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

  // Cập nhật User cũ sang các Role ID mới
  console.log('Update existing users with role ID...');
  const users = await prisma.user.findMany();
  for (const user of users) {
    // Tạm thời mapping
    const fallbackRole = dbRoles['SALE']; 
    if (!user.roleId) {
       await prisma.user.update({
         where: { id: user.id },
         data: { roleId: fallbackRole.id }
       });
    }
  }

  // Tạo SystemSettings
  const defaultSettings = [
    {
      key: 'theme',
      value: { 
        primaryColor: '#2563eb', // blug-600
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

  // 5. Tạo User Admin mặc định (nếu chưa có)
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
  } else {
    // Đảm bảo Admin cũ cũng có Role ADMIN mới nhất
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
