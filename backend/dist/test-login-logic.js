"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const auth_service_1 = require("./src/auth/auth.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const authService = app.get(auth_service_1.AuthService);
    console.log("Testing login for eleucn1@gmail.com...");
    try {
        const result = await authService.login('eleucn1@gmail.com', '123456');
        console.log("Login Success!", JSON.stringify(result.user, null, 2));
    }
    catch (e) {
        console.log("Login Failed:", e.message);
    }
    await app.close();
}
bootstrap();
//# sourceMappingURL=test-login-logic.js.map