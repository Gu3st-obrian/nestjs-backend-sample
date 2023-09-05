import { Body, Controller, HttpStatus, Logger, Param, Post, Res } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { HttpErrorList, PROFILES } from '../app.constant';
import { AssociationService } from '../association/association.service';
import { CommonService } from '../common/common.service';
import { DtoCreateEnterprise } from './enterprise.entity';
import { EnterpriseService } from './enterprise.service';

@ApiTags('Enterprise')
@Controller('enterprise')
export class EnterpriseController {
    private readonly logger = new Logger(EnterpriseController.name);

    // TODO: CRUD enterprise with System profile.
    // TODO: Associate first user to new enterprise.
    // TODO: Set default user policies in association.
    // TODO: Create enterprise wallet.

    constructor(
        private readonly service: EnterpriseService,
        private readonly commonService: CommonService,
        private readonly associationService: AssociationService,
    ) { }

    @ApiBody({ type: DtoCreateEnterprise })
    @ApiOkResponse({ description: 'Create new enterprise' })
    @ApiBadRequestResponse({
        description: 'Owner account not found',
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Enterprise already exists',
    })
    @Post("create/for/:profile")
    public async create(@Res() res: Response, @Param("profile") profile: PROFILES, @Body() inputs: DtoCreateEnterprise) {
        // TODO: Verify RCCM value and IFU.

        // Process new enterprise request creation.
        const response = await this.service.createEnterprise(inputs);

        if (response.statusCode == HttpStatus.OK) {
            const getProfileRoles = await this.commonService.receiveProfilPolicy(profile, true);
            if (!getProfileRoles) {
                this.logger.error(
                    'updateAccountBySharedAdmin.error',
                    `Failed to get network default roles (${inputs.name} - ${inputs.ownerPK}) policies`
                );

                return this.commonService.render(
                    res,
                    HttpStatus.FAILED_DEPENDENCY,
                    HttpErrorList.UNAVAILABLE_POLICIES,
                );
            }

            // Create association of this user owner.
            const association = await this.associationService.create({
                enterprise: response.values._id,
                account: response.values.owner,
                policies: getProfileRoles,
            });

            const data = { ...response.values, associations: [association] };

            //
            return this.commonService.render(res, response.statusCode, data);
        }

        // 
        return this.commonService.render(res, response.statusCode, response.reason);
    }
}
