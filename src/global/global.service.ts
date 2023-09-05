import { Injectable } from '@nestjs/common';
import { AccountDocument } from '../account/account.schema';

@Injectable()
export class GlobalService {
    public static apps: any = null;
    public static routes: Array<any> = [];
    public static account: AccountDocument = null;
}
