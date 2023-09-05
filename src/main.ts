import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
    SwaggerModule,
    DocumentBuilder,
    SwaggerCustomOptions,
    SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { AppModule } from './app.module';

import { GlobalService } from './global/global.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Allow env var processing.
    const configService = app.get<ConfigService>(ConfigService);

    // Enable CORS Policy.
    app.enableCors();

    /**
     * Setup Swagger for API Documentation.
     */
    const config = new DocumentBuilder()
        .setTitle('Provider Example')
        .setDescription('This API process all user requests.')
        .setVersion('1.0.0')
        .addTag('Utilisateur')
        .build();

    const options: SwaggerDocumentOptions = {
        operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    };
    const document = SwaggerModule.createDocument(app, config, options);

    const swaggerBaseUrl = 'docs';

    const customOptions: SwaggerCustomOptions = {
        swaggerOptions: {
            persistAuthorization: true,
        },
        customSiteTitle: 'My User API Docs',
    };
    SwaggerModule.setup(swaggerBaseUrl, app, document, customOptions);

    /**
     * End of Swagger setup.
     */



    // Server port.
    const port = configService.get<number>('http.port');
    console.log('Application port :', port);
    await app.listen(port);

    /**
     * Extraction of all routes available in this app.
     */

    const routes: Array<any> = [];
    const stack = app.getHttpServer()._events.request._router.stack
    // console.log('RouterStack', stack);

    stack.forEach((middleware: any) => {
        if (middleware.route && !String(middleware.route.path).startsWith(`/${swaggerBaseUrl}`)) { 
            for (const method in middleware.route.methods) {
                routes.push({
                    path: middleware.route.path,
                    method: String(method).toUpperCase(),
                    regexp: new RegExp(middleware.regexp),
                });
            }
        }
    });

    GlobalService.routes = routes;

    console.log('Route-App:', routes);

    /**
     * End of extraction..
     */
}
bootstrap();
