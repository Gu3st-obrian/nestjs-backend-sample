import { HttpStatus } from '@nestjs/common';

export interface ICommon {
    statusCode: HttpStatus;
    reason?: string;
    values?: any;
}
