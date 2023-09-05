import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { AccountModule } from './account/account.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MovementModule } from './movement/movement.module';
import { RepositoryModule } from './repository/repository.module';
import * as Joi from 'joi';
import configuration from './app.config';
import { MongooseModule } from '@nestjs/mongoose';
import { EnterpriseModule } from './enterprise/enterprise.module';
import { ScheduleModule } from '@nestjs/schedule';
import { GlobalModule } from './global/global.module';
import { PolicyModule } from './policy/policy.module';
import { RoleModule } from './role/role.module';
import { LoggedMiddleware } from './middleware/logged.middleware';
import { PolicyMiddleware } from './middleware/policy.middleware';

@Module({
    imports: [
        ConfigModule.forRoot({
            validationSchema: Joi.object({
                NODE_ENV: Joi.string().valid('dev', 'stage', 'prod').default('dev'),
            }),
            cache: false,
            isGlobal: true,
            ignoreEnvFile: true,
            load: [configuration],
        }),

        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                let database_url: string = configService.get<string>('database.url');
                // Database hostname & port.
                database_url = database_url.replace(
                    '<host>',
                    configService.get<string>('database.host'),
                );
                // Database User
                database_url = database_url.replace(
                    '<user>',
                    configService.get<string>('database.user'),
                );
                //
                database_url = database_url.replace(
                    '<pass>',
                    configService.get<string>('database.pass'),
                );
                //
                database_url = database_url.replace(
                    '<name>',
                    configService.get<string>('database.name'),
                );
                console.log('Database:', database_url);
                return { uri: database_url };
            },
            inject: [ConfigService],
        }),

        ScheduleModule.forRoot(),

        CommonModule,
        AccountModule,
        MovementModule,
        RepositoryModule,
        EnterpriseModule,
        GlobalModule,
        PolicyModule,
        RoleModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(LoggedMiddleware)
            .exclude(
                { path: '/account/login', method: RequestMethod.POST },
                { path: '/docs*', method: RequestMethod.ALL },
            )
            .forRoutes('*')
            .apply(PolicyMiddleware)
            .exclude(
                { path: '/account/login', method: RequestMethod.POST },
                { path: '/docs*', method: RequestMethod.ALL },
            )
            .forRoutes('*')
    }
}
