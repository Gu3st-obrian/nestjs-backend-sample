import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { Document, Schema as Sch } from 'mongoose';
import { AfricaZoneBJ } from '../app.constant';


@Schema({
    toJSON: { versionKey: false },
    timestamps: true,
})
export class Account {

    /**
     * Account details.
     */

    @Prop({
        type: Sch.Types.String,
        required: true,
        unique: true, // Can have multiples users for same account.
        index: true,
    })
    pk?: string;

    @Prop({
        type: Sch.Types.String,
        default: null,
    })
    firstname?: string;

    @Prop({
        type: Sch.Types.String,
        default: null,
    })
    lastname?: string;

    @Prop({
        type: Sch.Types.String,
        required: true,
        unique: true,
    })
    phone?: string;

    @Prop({
        type: Sch.Types.String,
        default: "",
    })
    email?: string;

    @Prop({
        type: Sch.Types.String,
        default: "",
    })
    password?: string;

    @Prop({
        type: Sch.Types.Boolean,
        default: false,
    })
    passwordExpired?: boolean;

    @Prop({
        type: Sch.Types.Boolean,
        default: false,
    })
    active?: boolean;

    /**
     * End of account details.
     */

    /**
     * Account validation.
     */

    @Prop({
        type: Sch.Types.String,
        required: true,
    })
    otpValue?: string;

    @Prop({
        type: Sch.Types.Number,
        default: DateTime.now().setZone(AfricaZoneBJ).plus({ hours: 2 }).toMillis(),
    })
    otpDate?: number;

    @Prop({
        type: Sch.Types.Number,
        default: 0,
    })
    otpResent?: number;

    @Prop({
        type: Sch.Types.Boolean,
        default: false,
    })
    otpConfirm?: boolean;

    /**
     * End of account validation.
     */

    /**
     * Account permissions.
     */
    
    @Prop({
        type: [
            {
                type: Sch.Types.ObjectId,
                ref: 'Role',
            }
        ],
        default: [],
    })
    policies?: Array<any>;

    @Prop({
        type: [
            {
                type: Sch.Types.ObjectId,
                ref: 'Wallet',
            }
        ],
        required: true,
    })
    wallets?: Array<any>;

    @Prop({
        type: [
            {
                type: Sch.Types.ObjectId,
                ref: 'Association',
            }
        ],
        required: true,
    })
    associations?: Array<any>;

    /**
     * End of account permissions.
     */

    /**
     * User invite Id or not.
     */
     @Prop({
        type: Sch.Types.ObjectId,
        ref: 'Account',
        default: null,
    })
    userInvite?: any;

    @Prop({
        type: Sch.Types.Array,
        default: [],
    })
    personalInviteLink?: Array<string>;

    /**
     * End of invite.
     */
}

export type AccountDocument = Account & Document;

export const AccountSchema = SchemaFactory.createForClass(Account);
