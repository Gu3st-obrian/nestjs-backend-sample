import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Logger,
    Param,
    Post,
    Put,
    Req,
    Res,
    ValidationPipe,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { DateTime } from 'luxon';
import { AssociationService } from '../association/association.service';
import { AfricaZoneBJ, HttpErrorList, PROFILES } from '../app.constant';
import { CommonService } from '../common/common.service';
import { GlobalService } from '../global/global.service';
import { WalletService } from '../wallet/wallet.service';
import {
    DtoConfirmIdentity,
    DtoCreateIdentity,
    DtoCreateNetworkUserByAdmin,
    DtoCreateSession,
    DtoNewToken,
    DtoResentCodeIdentity,
    DtoUpdateIdentity,
} from './account.entity';
import { AccountDocument } from './account.schema';
import { AccountService } from './account.service';
import { LinkageService } from '../linkage/linkage.service';
import { RoleDocument } from '../role/role.schema';
import { WalletEntityEnum } from '../wallet/wallet.entity';

@ApiTags('User')
@Controller('account')
export class AccountController {
    private readonly logger = new Logger(AccountController.name);

    constructor(
        private readonly service: AccountService,
        private readonly commonService: CommonService,
        private readonly assocService: AssociationService,
        private readonly linkageService: LinkageService,
        private readonly walletService: WalletService
    ) { }

    @ApiBody({ type: DtoCreateSession })
    @ApiOkResponse({ description: 'User make login successfully' })
    @ApiBadRequestResponse({
        description: 'One of email address or phone are required',
    })
    @ApiResponse({
        status: HttpStatus.EXPECTATION_FAILED,
        description: 'Invalid credentials',
    })
    @Post('login')
    public async login(@Req() req: Request, @Res() res: Response, @Body(ValidationPipe) inputs: DtoCreateSession) {

        this.logger.log(inputs);

        // Phone or Email are required.
        if (!inputs.phone && !inputs.email) {
            return this.commonService.render(
                res,
                HttpStatus.BAD_REQUEST,
                HttpErrorList.LOGIN_REQUIRED,
            );
        }

        // Hash password.
        const password = this.service.makeHash(inputs.password);

        // Create filter request.
        let querySet: any = inputs.phone
            ? { phone: inputs.phone }
            : { email: inputs.email };

        // TODO: Remove after test...
        await this.service.update(querySet, {
            $set: {
                password: password,
            },
        });

        // Build query search.
        querySet = { ...querySet, password, active: true };

        // Search user.
        const foundedUser = await this.service.findManyBy(querySet, ['policies'], {
            password: 0,
        });
        if (!foundedUser || !Array.isArray(foundedUser) || foundedUser.length == 0) {
            return this.commonService.render(
                res,
                HttpStatus.EXPECTATION_FAILED,
                HttpErrorList.BAD_CREDENTIALS,
            );
        }

        /**
         * Check user policies before allowing resources access.
         */

        const auth = await this.commonService.emitPolicyVerification(
            req.url,
            req.method,
            foundedUser[0].policies,
        );
        this.logger.log('LoginAuthVerification:', auth);
        if (auth !== true) {
            return this.commonService.render(
                res,
                HttpStatus.FORBIDDEN,
                HttpErrorList.UNAUTHORIZED_POLICY_ERROR,
            );
        }

        /**
         * End of verification.
         */

        // Send response to relevant caller.
        return this.commonService.render(res, HttpStatus.OK, {
            userPK: foundedUser[0].pk,
            access_token: this.service.signSession(foundedUser[0].pk, false),
            refresh_token: this.service.signSession(foundedUser[0].pk, true),
        });
    }

    @ApiBody({ type: DtoNewToken })
    @ApiOkResponse({ description: 'User receive new tokens' })
    @ApiResponse({
        status: HttpStatus.EXPECTATION_FAILED,
        description: 'Invalid credentials',
    })
    @Post('refresh/token')
    public async refreshLogin(@Res() res: Response, @Body(ValidationPipe) inputs: DtoNewToken) {
        // Token must be a refresh one.
        const defaultContent: any = this.service.decodeToken(inputs.access_token);
        const refreshContent: any = this.service.decodeToken(inputs.refresh_token);

        // Verify validity of access_token.
        if (!refreshContent?.pku || !defaultContent?.pku || !defaultContent?.cad) {
            return this.commonService.render(
                res,
                HttpStatus.EXPECTATION_FAILED,
                HttpErrorList.BAD_CREDENTIALS,
            );
        }

        // Check User PK in database.
        const foundedUser: AccountDocument = await this.service.findOneBy({
            pk: defaultContent.pku,
        });

        // User don't exists. Warning !!! (Think about policies deletion).
        if (!foundedUser) {
            return this.commonService.render(
                res,
                HttpStatus.EXPECTATION_FAILED,
                HttpErrorList.BAD_CREDENTIALS,
            );
        }

        // Verify Logger value.
        const logger = this.commonService.generateId(foundedUser.pk);
        if (refreshContent.log != logger) {
            return this.commonService.render(
                res,
                HttpStatus.EXPECTATION_FAILED,
                HttpErrorList.BAD_CREDENTIALS,
            );
        }

        // Build new tokens.
        const data: DtoNewToken = {
            access_token: this.service.signSession(foundedUser.pk, false),
            refresh_token: this.service.signSession(foundedUser.pk, true),
        };

        // Send response to relevant caller.
        return this.commonService.render(res, HttpStatus.OK, data);
    }

    @ApiBody({ type: DtoCreateIdentity })
    @ApiOkResponse({ description: 'User create his personal account' })
    @ApiBadRequestResponse({
        description: 'One of email address or phone are required',
    })
    @ApiResponse({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        description: 'Invalid phone number according to country code',
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Username not available',
    })
    @ApiResponse({
        status: HttpStatus.EXPECTATION_FAILED,
        description: 'Something going bad during user creation',
    })
    @Post('owner/register')
    public async createAccountByOwner(@Res() res: Response, @Body(ValidationPipe) inputs: DtoCreateIdentity) {
        /**
         * Account created by my own.
         */

        // At least one between email and phone are required.
        if (!inputs.phone && inputs.email) {
            return this.commonService.render(
                res,
                HttpStatus.BAD_REQUEST,
                HttpErrorList.MISSING_USERNAME,
            );
        }

        /**
         * Make sure that user don't exists.
         */

        // Must be a valid phone number.
        if (!this.commonService.isValidPhoneNumber(inputs.phone)) {
            return this.commonService.render(
                res,
                HttpStatus.UNPROCESSABLE_ENTITY,
                HttpErrorList.INVALID_PHONE_NUMBER,
            );
        }

        // Build Search query.
        const querySet = { $or: [] };

        // Add phone number.
        querySet.$or.push({ phone: inputs.phone });

        if (inputs.email) {
            querySet.$or.push({ email: inputs.email });
        }

        //
        const foundedUser = await this.service.findManyBy(querySet);
        if (Array.isArray(foundedUser) && foundedUser.length > 0) {
            return this.commonService.render(
                res,
                HttpStatus.CONFLICT,
                HttpErrorList.UNAVAILABLE_USERNAME,
            );
        }

        /**
         * End of verification.
         */

        /**
         * Verification unsed OTP code.
         */
        let codeOtp = Math.floor(Math.random() * 1000000).toString();

        while (true) {
            // Make sure that code not already used for another verification process.
            const existingUser = await this.service.countDocument({
                otpValue: codeOtp,
                otpConfirm: false,
            });
            console.log('While.Boucle', existingUser);
            if (existingUser > 0) {
                codeOtp = Math.floor(Math.random() * 1000000).toString();
            } else {
                break;
            }
        }

        /**
         * End of OTP verification.
         */


        // Register new credentials.
        const newUser = await this.service.create({
            pk: this.commonService.generateId(),
            phone: inputs.phone,
            email: inputs.email || '',
            otpValue: codeOtp,
        });
        //
        if (!newUser) {
            return this.commonService.render(
                res,
                HttpStatus.EXPECTATION_FAILED,
                HttpErrorList.CREATE_USER_FAILED,
            );
        }

        // TODO: Send OTP value by SMS or email.
        // this.commonService.emitMessage('notification.sms.register', {
        //     template: 'SMS_SelfRegister_FR',
        //     otp: newUser.otpValue,
        // });

        return this.commonService.render(res, HttpStatus.OK, {
            message: HttpErrorList.OK,
            // FIXME: Remove after test.
            testOtp: newUser.otpValue,
        });
    }

    @ApiBody({ type: DtoConfirmIdentity })
    @ApiOkResponse({ description: 'Personal user confirm account with OTP code' })
    @ApiBadRequestResponse({
        description: 'One of email address or phone are required',
    })
    @ApiResponse({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        description: 'Invalid code OTP received',
    })
    @ApiResponse({
        status: HttpStatus.EXPECTATION_FAILED,
        description: 'Expiration of code OTP',
    })
    @Post('owner/register/otp/check')
    public async validateIdentityValue(@Res() res: Response, @Body(ValidationPipe) inputs: DtoConfirmIdentity) {
        // Get user if exist.
        const existingUser = await this.service.findOneBy({
            otpValue: inputs.code,
            otpConfirm: false,
        });
        //
        if (!existingUser) {
            return this.commonService.render(
                res,
                HttpStatus.UNPROCESSABLE_ENTITY,
                HttpErrorList.INVALID_CODE_OTP,
            );
        }

        // Verify expiration date.
        const now = DateTime.now().setZone(AfricaZoneBJ).toMillis();
        if (now > existingUser.otpDate) {
            return this.commonService.render(
                res,
                HttpStatus.EXPECTATION_FAILED,
                HttpErrorList.EXPIRY_CODE_OTP,
            );
        }

        // Update Identity verification.
        await this.service.update({
            pk: existingUser.pk
        }, {
            $set: {
                otpConfirm: true,
            }
        });

        //
        return this.commonService.render(res, HttpStatus.OK, {
            message: HttpErrorList.OK,
            userPK: existingUser.pk,
        });
    }

    @ApiBody({ type: DtoResentCodeIdentity })
    @ApiOkResponse({ description: 'Resend OTP code to relevant user' })
    @ApiBadRequestResponse({
        description: 'One of email address or phone are required',
    })
    @ApiResponse({
        status: HttpStatus.FAILED_DEPENDENCY,
        description: 'Associated user to OTP code not found',
    })
    @ApiResponse({
        status: HttpStatus.REQUEST_TIMEOUT,
        description: 'OTP already confirmed',
    })
    @Post('owner/register/otp/resend')
    public async getIdentityCodeValue(@Res() res: Response, @Body(ValidationPipe) inputs: DtoResentCodeIdentity) {
        // At least one between email and phone are required.
        if (!inputs.phone && inputs.email) {
            return this.commonService.render(
                res,
                HttpStatus.BAD_REQUEST,
                HttpErrorList.MISSING_USERNAME,
            );
        }

        // Build user query search.
        const querySet = { $or: [] };
        if (inputs.phone) querySet.$or.push({ phone: inputs.phone });
        if (inputs.email) querySet.$or.push({ email: inputs.email });

        // Get related user.
        const existingUser = await this.service.findManyBy(querySet);
        if (!Array.isArray(existingUser) || existingUser.length != 1) {
            return this.commonService.render(
                res,
                HttpStatus.FAILED_DEPENDENCY,
                HttpErrorList.BAD_CREDENTIALS,
            );
        }

        // Use first result.
        const foundedUser = existingUser[0];

        // Identity already validated.
        if (foundedUser.otpConfirm) {
            return this.commonService.render(
                res,
                HttpStatus.REQUEST_TIMEOUT,
                HttpErrorList.BAD_CREDENTIALS,
            );
        }

        // Verify expiration date.
        let now = DateTime.now().setZone(AfricaZoneBJ).toMillis();
        if (now > foundedUser.otpDate) {
            foundedUser.otpDate = DateTime.fromMillis(now).setZone(AfricaZoneBJ).plus({ hours: 2 }).toMillis();
        }

        // Update OTP content.
        await this.service.update({
            pk: foundedUser.pk,
        }, {
            $set: {
                otpDate: foundedUser.otpDate,
                otpResent: ++foundedUser.otpResent,
            }
        });

        // TODO: Send OTP value by SMS or email.
        // this.commonService.emitMessage('notification.sms.register', {
        //     template: 'SMS_SelfRegister_FR',
        //     otp: newUser.otpValue,
        // });

        return this.commonService.render(res, HttpStatus.OK, {
            message: HttpErrorList.OK,
            // FIXME: Remove after test.
            testOtp: foundedUser.otpValue,
        });
    }

    @ApiBody({ type: DtoResentCodeIdentity })
    @ApiOkResponse({ description: 'Final configuration on new user account' })
    @ApiBadRequestResponse({
        description: 'New user successfully configured',
    })
    @ApiResponse({
        status: HttpStatus.NOT_ACCEPTABLE,
        description: 'Received user not found',
    })
    @ApiResponse({
        status: HttpStatus.FAILED_DEPENDENCY,
        description: 'Failed to add policies to new user',
    })
    @ApiResponse({
        status: HttpStatus.EXPECTATION_FAILED,
        description: 'Something going bad during user update',
    })
    @Put('owner/register')
    public async updateAccountByOwner(@Res() res: Response, @Body(ValidationPipe) inputs: DtoUpdateIdentity) {
        // Identify user bu it PK.
        const foundedUser = await this.service.findOneBy({
            pk: inputs.userPK,
            otpConfirm: true,
            firstname: null,
            lastname: null,
        }, [], {});
        //
        if (!foundedUser) {
            return this.commonService.render(
                res,
                HttpStatus.NOT_ACCEPTABLE,
                HttpErrorList.BAD_CREDENTIALS,
            );
        }

        /**
         * Create new user wallet.
         */

        // Wallet & Policy.
        const walletIds = this.walletService.createEntityWallets(foundedUser._id, WalletEntityEnum.PERSON);

        // Add wallets into user model.
        await this.service.update({ _id: foundedUser._id }, {
            $set: {
                wallets: walletIds,
            }
        });

        /**
         * Create user permission.
         */


        /**
         * Create user permission.
         */

        const loadedRoles = await this.commonService.receiveProfilPolicy("CLIENT");
        this.logger.log('AuthVerification:', JSON.stringify(loadedRoles));
        //
        if (!loadedRoles) {
            this.logger.error(
                'updateAccountByOwner.error',
                `Failed to get default client user (${inputs.firstname} ${inputs.lastname}) policies`
            );

            return this.commonService.render(
                res,
                HttpStatus.FAILED_DEPENDENCY,
                HttpErrorList.UNAVAILABLE_POLICIES,
            );
        }

        for (const role of loadedRoles) {
            if (!foundedUser.policies.includes(role._id)) {
                //
                await this.service.update({ _id: foundedUser._id }, {
                    $push: {
                        policies: role._id,
                    }
                });
            }
        }

        /**
         * End of creation.
         */



        /**
         * Save user info.
         */

        // Hash user password.
        const password: string = this.service.makeHash(inputs.password);

        // Save user informations.
        let updatedResult = await this.service.update({ pk: foundedUser.pk }, {
            $set: {
                lastname: inputs.lastname,
                firstname: inputs.firstname,
                password: password,
                active: true,
            }
        });
        if (!updatedResult) {
            return this.commonService.render(
                res,
                HttpStatus.EXPECTATION_FAILED,
                HttpErrorList.CREATE_USER_FAILED,
            );
        }

        /**
         * Saving done.
         */


        //
        return this.commonService.render(res, HttpStatus.OK, {
            message: HttpErrorList.OK,
        });
    }

    @ApiParam({ name: "userPK", description: "User unique PK" })
    @ApiOkResponse({ description: 'Get all information about connected user' })
    @ApiForbiddenResponse({
        description: "User PK don't match session token",
    })
    @ApiResponse({
        status: HttpStatus.EXPECTATION_FAILED,
        description: 'User not found',
    })
    @Get('owner/me/:userPK')
    public async aboutMyself(@Res() res: Response, @Param('userPK') userPK: string) {
        // Confirm that user receive is the same as session token.
        if (GlobalService.account.pk !== userPK) {
            return this.commonService.render(
                res,
                HttpStatus.FORBIDDEN,
                HttpErrorList.LOGIN_REQUIRED,
            );
        }

        // Identify user by it PK.
        const foundedUser = await this.service.findOneBy({
            pk: userPK,
        }, ["policies", "wallets"]);
        //
        if (!foundedUser) {
            return this.commonService.render(
                res,
                HttpStatus.EXPECTATION_FAILED,
                HttpErrorList.EMPTY_RESULT,
            );
        }

        return this.commonService.render(res, HttpStatus.OK, foundedUser);
    }

    @ApiParam({ name: "userPK", description: "User unique PK" })
    @ApiOkResponse({ description: 'Get all information about user enterprise' })
    @ApiForbiddenResponse({
        description: "User PK don't match session token",
    })
    @ApiResponse({
        status: HttpStatus.EXPECTATION_FAILED,
        description: 'User not found',
    })
    @Get('shared/me/:userPK')
    public async aboutEnterprise(@Res() res: Response, @Param('userPK') userPK: string) {
        // Confirm that user receive is the same as session token.
        if (GlobalService.account.pk !== userPK) {
            return this.commonService.render(
                res,
                HttpStatus.FORBIDDEN,
                HttpErrorList.LOGIN_REQUIRED,
            );
        }

        // Identify user by it PK.
        const foundedUser = await this.service.findOneBy({
            pk: userPK,
        }, ["policies", "wallets"]);
        //
        if (!foundedUser) {
            return this.commonService.render(
                res,
                HttpStatus.EXPECTATION_FAILED,
                HttpErrorList.EMPTY_RESULT,
            );
        }

        // Extract user associations.
        const associations = await this.assocService.findManyBy({
            account: foundedUser._id,
        }, ["enterprise"], { account: 0 });

        // Set associations.
        foundedUser.associations = associations;

        return this.commonService.render(res, HttpStatus.OK, foundedUser);
    }

    @ApiBody({ type: DtoCreateNetworkUserByAdmin })
    @ApiOkResponse({ description: 'Create or update user as network with proper constraints' })
    @ApiBadRequestResponse({
        description: 'Invalid phone number received',
    })
    @ApiResponse({
        status: HttpStatus.EXPECTATION_FAILED,
        description: 'Something going bad during user creation or linkage',
    })
    @ApiResponse({
        status: HttpStatus.FAILED_DEPENDENCY,
        description: 'Failed to add policies to new network user',
    })
    @Post('admin/register/network')
    public async createNetworkAccountByAdmin(@Res() res: Response, @Body(ValidationPipe) inputs: DtoCreateNetworkUserByAdmin) {
        /**
         * Account created by admin user.
         * Administrator send user phone number to create new user.
         * If user already have account nothing happen here.
         * Else create new user and send default password by mail or SMS.
         * Add user to enterprise with no permission.
         * To add role to user, use relevant resources.
         */


        // Get user by phone number.
        let foundedUser = await this.service.findOneBy({ phone: inputs.phone }, ["policies"]);

        let defaultPassword = "";

        let loadedRoles: RoleDocument[] = [];

        // User not exists.
        if (!foundedUser) {
            // Must be a valid phone number.
            if (!this.commonService.isValidPhoneNumber(inputs.phone)) {
                return this.commonService.render(
                    res,
                    HttpStatus.BAD_REQUEST,
                    HttpErrorList.INVALID_PHONE_NUMBER,
                );
            }

            // Generate default password.
            defaultPassword = Math.floor(Math.random() * 1000000).toString();

            // Create user with proper value.
            foundedUser = await this.service.create({
                pk: this.commonService.generateId(),
                firstname: inputs.firstname,
                lastname: inputs.lastname,
                phone: inputs.phone,
                email: inputs.email || '',
                password: this.service.makeHash(defaultPassword),
                passwordExpired: true,
                active: true,
                otpValue: Math.floor(Math.random() * 1000000).toString(),
                otpConfirm: true,
            });

            //
            if (!foundedUser) {
                return this.commonService.render(
                    res,
                    HttpStatus.EXPECTATION_FAILED,
                    HttpErrorList.CREATE_USER_FAILED,
                );
            }

            /**
             * Create new user wallet.
             */

            // Wallet & Policy.
            const walletIds = this.walletService.createEntityWallets(foundedUser._id, WalletEntityEnum.PERSON);

            // Add wallets into user model.
            await this.service.update({ _id: foundedUser._id }, {
                $set: {
                    wallets: walletIds,
                }
            });

            /**
             * Create user permission.
             */

            const getClientRoles = await this.commonService.receiveProfilPolicy(PROFILES.CLIENT, PROFILES.PROVIDER);
            if (!getClientRoles) {
                this.logger.error(
                    'updateAccountBySharedAdmin.error',
                    `Failed to get client default roles (${inputs.firstname} ${inputs.lastname}) policies`
                );

                return this.commonService.render(
                    res,
                    HttpStatus.FAILED_DEPENDENCY,
                    HttpErrorList.UNAVAILABLE_POLICIES,
                );
            }

            // Load client role into var.
            loadedRoles = [...getClientRoles];

        } else {
            // Verify linkage existence.
            const foundLink = await this.linkageService.countDocument({
                subject: foundedUser._id,
            });

            // User and it link already exists.
            if (foundLink > 0) {
                return this.commonService.render(
                    res,
                    HttpStatus.EXPECTATION_FAILED,
                    HttpErrorList.CREATE_USER_FAILED,
                );
            }
        }

        /**
         * Get default role of all network user.
         */
        const getNetworkRoles = await this.commonService.receiveProfilPolicy(PROFILES.PROVIDER);
        if (!getNetworkRoles) {
            this.logger.error(
                'updateAccountBySharedAdmin.error',
                `Failed to get network default roles (${inputs.firstname} ${inputs.lastname}) policies`
            );

            return this.commonService.render(
                res,
                HttpStatus.FAILED_DEPENDENCY,
                HttpErrorList.UNAVAILABLE_POLICIES,
            );
        }

        // Load client role into var.
        loadedRoles = [...loadedRoles, ...getNetworkRoles];

        // Add role to relevant user.
        for (const role of loadedRoles) {
            if (!foundedUser.policies.includes(role._id)) {
                await this.service.update({ _id: foundedUser._id }, {
                    $push: {
                        policies: role._id,
                    }
                });
            }
        }

        // Create linkage to master (Rattachement).
        const newLink = await this.linkageService.create({
            master: GlobalService.account._id,
            subject: foundedUser._id,
        });
        //
        if (!newLink) {
            return this.commonService.render(
                res,
                HttpStatus.EXPECTATION_FAILED,
                HttpErrorList.CREATE_USER_LINK_FAILED,
            );
        }

        return this.commonService.render(res, HttpStatus.OK, {
            defaultPassword,
            userPK: foundedUser.pk,
        });
    }
}
