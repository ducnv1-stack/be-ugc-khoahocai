"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const create_order_dto_1 = require("./dto/create-order.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
let OrdersController = class OrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    create(createOrderDto, req) {
        const saleId = req.user.id;
        return this.ordersService.create(createOrderDto, saleId);
    }
    findAll() {
        return this.ordersService.findAll();
    }
    findOne(id) {
        return this.ordersService.findOne(id);
    }
    updateMemo(id, memo) {
        return this.ordersService.updateMemo(id, memo);
    }
    updatePrice(id, data, req) {
        return this.ordersService.updatePrice(id, data, req.user.id);
    }
    updatePaidAmount(id, paidAmount, req) {
        return this.ordersService.updatePaidAmount(id, paidAmount, req.user.id);
    }
    updateInvoiceStatus(id, invoiceIssued, req) {
        return this.ordersService.updateInvoiceStatus(id, invoiceIssued, req.user.id);
    }
    remove(id, req) {
        return this.ordersService.remove(id, req.user.id);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('orders.create', 'orders.manage'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('orders.view', 'orders.manage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('orders.view', 'orders.manage'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/memo'),
    (0, permissions_decorator_1.RequirePermissions)('orders.update', 'orders.manage', 'customers.manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('memo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "updateMemo", null);
__decorate([
    (0, common_1.Patch)(':id/price'),
    (0, permissions_decorator_1.RequirePermissions)('orders.update', 'orders.manage', 'customers.manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "updatePrice", null);
__decorate([
    (0, common_1.Patch)(':id/paid-amount'),
    (0, permissions_decorator_1.RequirePermissions)('orders.payment.update', 'orders.manage', 'customers.manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('paidAmount')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "updatePaidAmount", null);
__decorate([
    (0, common_1.Patch)(':id/invoice-status'),
    (0, permissions_decorator_1.RequirePermissions)('orders.invoice.update', 'orders.manage', 'customers.manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('invoiceIssued')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "updateInvoiceStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('orders.delete', 'orders.manage', 'customers.manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "remove", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map