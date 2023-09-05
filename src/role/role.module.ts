import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleSchema } from './role.schema';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { CommonModule } from '../common/common.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: 'Role',
                schema: RoleSchema,
            },
        ]),

        CommonModule
    ],
    providers: [RoleService],
    exports: [RoleService],
    controllers: [RoleController],
})
export class RoleModule { }
