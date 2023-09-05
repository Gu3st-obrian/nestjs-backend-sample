import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { DateTime } from 'luxon';
import { ResourceRoles } from './app.auth';
import { CommonService } from './common/common.service';
import { GlobalService } from './global/global.service';

@Injectable()
export class AppService {
    private readonly logger = new Logger(AppService.name);

    constructor (
        private readonly commonService: CommonService,
        private readonly configService: ConfigService,
    ) {}

    @Timeout(0)
    handleCronImmediate() {
        this.logger.debug(`Register App Routes to Permission API`);
        // Register apps.
        this.appRegister();
    }

    @Cron(CronExpression.EVERY_30_SECONDS)
    handleCronMinutes() {
        this.logger.debug(`HandleCronMinutes: ${DateTime.now().toFormat("dd LLL yyyy, HH:mm")}`);
        // Register apps.
        this.appRegister(); 
    }

    private appRegister() {
        //
        const payload: any = {
            name: this.configService.get<string>('app.name'),
            tag: this.configService.get<string>('app.tag'),
            routes: [],
        };

        // 
        const routes = [];

        // Build complete routes with proper role.
        GlobalService.routes.forEach((route:{path:string,method:string,regexp:RegExp}) => {
            // Add roles to each route.
            const roles = ResourceRoles[`${route.method}:${route.path}`];
            // Preserve regex logic.
            const obj = { flags: route.regexp.flags, source: route.regexp.source };
            //
            routes.push({ ...route, regexp: JSON.stringify(obj), roles });
        });

        // Update route list.
        GlobalService.routes = [...routes];

        // Update payload.
        payload.routes = routes;

        // Register application.
        this.commonService.emitMessage("apps.register", payload);
    }
}
