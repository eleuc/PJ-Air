const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/src/app.module');
const { OrdersService } = require('../dist/src/orders/orders.service');

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const ordersService = app.get(OrdersService);
    
    const orders = await ordersService.findAll();
    const jsonStr = JSON.stringify(orders);
    console.log(`New JSON length: ${(jsonStr.length / 1024 / 1024).toFixed(2)} MB (${(jsonStr.length / 1024).toFixed(2)} KB)`);
    
    await app.close();
}

bootstrap().catch(console.error);
