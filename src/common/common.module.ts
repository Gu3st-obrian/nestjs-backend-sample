import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, ClientsModule, Transport } from '@nestjs/microservices';
import { CommonService } from './common.service';

@Module({
    // imports: [
    //     ClientsModule.register([
    //         { name: 'POLICY_SERVICE', transport: Transport.NATS },
    //     ]),
    // ],
    providers: [
        CommonService,
        {
            provide: 'POLICY_SERVICE',
            useFactory: (configService: ConfigService) => {
                return ClientProxyFactory.create({
                    transport: Transport.NATS,
                    options: {
                        servers: [configService.get<string>('nats.uri')],
                        headers: { 'x-version': '1.0.0' },
                    }
                });
            },
            inject: [ConfigService],
        }
    ],
    exports: [CommonService]
})
export class CommonModule { }
