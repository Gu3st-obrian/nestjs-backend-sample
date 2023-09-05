import { Controller, Get, HttpStatus, Logger, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CommonService } from '../common/common.service';
import { RoleService } from './role.service';


@ApiTags('Role')
@Controller('role')
export class RoleController {
    private readonly logger = new Logger(RoleController.name);

    constructor(
        private readonly service: RoleService,
        private readonly commonService: CommonService,
    ) { }

    @ApiQuery({ name: "page", type: Number, required: false, description: "Page number to show" })
    @ApiQuery({ name: "size", type: Number, required: false, description: "Number of results per page" })
    @ApiQuery({ name: "meta", type: String, required: false, description: "JSON string of field to query set" })
    @ApiOkResponse({ description: "List of allowed roles list" })
    @Get("allowed")
    public async getAllowedRoles(@Res() res: Response, @Query() query: any) {
        // Build request query.
        query = this.commonService.buildQueryRequest(query);

        // Count all movements of this user.
        const total = await this.service.countDocument({ view: true });

        // Get requested movements page.
        const results = await this.service.findManyBy({ view: true }, [], { _id: 0, name: 1, desc: 1 }, {
            skip: query.page * query.size,
            limit: query.size,
        });
        
        //
        return this.commonService.render(res, HttpStatus.OK, {
            data: results,
            total: total ? total + 1 : query.size, // TODO: Add +1 for test only.
            page: query.page + 1,
            length: (results && results.length) ? results.length : 0,
        });
    }

    @ApiQuery({ name: "page", type: Number, required: false, description: "Page number to show" })
    @ApiQuery({ name: "size", type: Number, required: false, description: "Number of results per page" })
    @ApiQuery({ name: "meta", type: String, required: false, description: "JSON string of field to query set" })
    @ApiOkResponse({ description: "List of all roles list" })
    @Get("restricted")
    public async getAllRoles(@Res() res: Response, @Query() query: any) {
        // Build request query.
        query = this.commonService.buildQueryRequest(query);

        // Count all movements of this user.
        const total = await this.service.countDocument({});

        // Get requested movements page.
        const results = await this.service.findManyBy({}, [], { _id: 0, name: 1, desc: 1 }, {
            skip: query.page * query.size,
            limit: query.size,
        });
        
        //
        return this.commonService.render(res, HttpStatus.OK, {
            data: results,
            total: total ? total + 1 : query.size, // TODO: Add +1 for test only.
            page: query.page + 1,
            length: (results && results.length) ? results.length : 0,
        });
    }
}
