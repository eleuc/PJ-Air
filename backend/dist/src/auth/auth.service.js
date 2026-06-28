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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const nodemailer = __importStar(require("nodemailer"));
const config_1 = require("../config");
let AuthService = class AuthService {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async signup(body) {
        const { email, password, full_name, username, phone, company_name } = body;
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser)
            throw new common_1.ConflictException('Email already registered');
        const userResult = await this.usersService.create({
            email,
            password,
        });
        const user = Array.isArray(userResult) ? userResult[0] : userResult;
        await this.usersService.createProfile({
            id: user.id,
            full_name,
            username,
            phone,
            company_name,
        });
        return {
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                app_metadata: {},
                user_metadata: { full_name: full_name },
                aud: 'authenticated',
                created_at: new Date().toISOString(),
            },
            session: {
                access_token: 'local-test-token-' + user.id,
                refresh_token: 'local-test-refresh-' + user.id,
                expires_in: 3600,
                token_type: 'bearer',
                user: { id: user.id, email: user.email },
            }
        };
    }
    async login(identifierInput, password) {
        const identifier = identifierInput.trim().toLowerCase();
        const user = await this.usersService.findByEmailWithRole(identifier) ||
            await this.usersService.findByIdentifier(identifier);
        if (!user || user.password !== password) {
            throw new common_1.UnauthorizedException('Invalid login credentials');
        }
        return {
            user: {
                id: user.id,
                email: user.email,
                app_metadata: {},
                user_metadata: {
                    full_name: user.profile?.full_name,
                    role: user.role || 'client',
                },
                aud: 'authenticated',
                created_at: new Date().toISOString(),
            },
            session: {
                access_token: 'local-test-token-' + user.id,
                refresh_token: 'local-test-refresh-' + user.id,
                expires_in: 3600,
                token_type: 'bearer',
                user: { id: user.id, email: user.email },
            }
        };
    }
    async recoverPassword(identifier) {
        const user = await this.usersService.findByEmail(identifier) ||
            await this.usersService.findByIdentifier(identifier);
        if (!user) {
            throw new common_1.UnauthorizedException(`No hemos conseguido un usuario o email que coincida con: ${identifier}`);
        }
        const siteUrl = config_1.SITE_URL;
        try {
            let transporterParams;
            if (config_1.SMTP_HOST) {
                transporterParams = {
                    host: config_1.SMTP_HOST,
                    port: parseInt(config_1.SMTP_PORT),
                    secure: config_1.SMTP_SECURE,
                    auth: {
                        user: config_1.SMTP_USER,
                        pass: config_1.SMTP_PASS,
                    },
                };
            }
            else {
                transporterParams = {
                    host: 'smtp.ethereal.email',
                    port: 587,
                    secure: false,
                    auth: {
                        user: 'mckenna.beier@ethereal.email',
                        pass: 'JSF9re7Xh3bTzH4JUK',
                    },
                };
            }
            let transporter = nodemailer.createTransport(transporterParams);
            try {
                await transporter.verify();
            }
            catch (e) {
                console.log("SMTP verify failed, creating dynamic Ethereal test account...");
                const testAccount = await nodemailer.createTestAccount();
                transporter = nodemailer.createTransport({
                    host: 'smtp.ethereal.email',
                    port: 587,
                    secure: false,
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass,
                    },
                });
            }
            const info = await transporter.sendMail({
                from: config_1.SMTP_USER ? `"Jhoanes Bakery, Order System" <${config_1.SMTP_USER}>` : '"Jhoanes Bakery, Order System" <noresponder@jhpanesbakery.com>',
                to: user.email,
                subject: "Password Recovery",
                text: `Estimado cliente, su contraseña es: ${user.password}\n\nIr a la tienda: ${siteUrl}/auth/login`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Password Recovery</h2>
            <p>Estimado cliente, su contraseña es: <strong>${user.password}</strong></p>
            <br/>
            <p>
              <a href="${siteUrl}/auth/login" 
                 style="display: inline-block; background-color: #b8860b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Ir a la tienda
              </a>
            </p>
          </div>`,
            });
            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            return {
                message: `Gracias, su contraseña se ha enviado al correo ${user.email}`,
                email: user.email,
            };
        }
        catch (error) {
            console.error('Error sending email:', error);
            throw new common_1.InternalServerErrorException('Error al enviar el correo de recuperación');
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.usersService.findOne(userId);
        if (!user || user.password !== currentPassword) {
            throw new common_1.UnauthorizedException('Invalid current password');
        }
        await this.usersService.updatePassword(userId, newPassword);
        return { message: 'Password updated successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map