"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true }));
    app.enableCors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' });
    app.setGlobalPrefix('api');
    await app.listen(process.env.PORT || 3001);
    console.log(`Server running on port ${process.env.PORT || 3001}`);
}
bootstrap();
//# sourceMappingURL=main.js.map