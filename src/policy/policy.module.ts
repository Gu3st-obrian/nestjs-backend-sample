import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PolicySchema } from './policy.schema';
import { PolicyService } from './policy.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: 'Policy',
                schema: PolicySchema,
            },
        ]),
    ],
    providers: [PolicyService],
    exports: [PolicyService],
})
export class PolicyModule { }
