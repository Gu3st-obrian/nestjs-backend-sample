import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as Sch } from 'mongoose';

export const COLLECTION_NAME = 'wallets';

export enum WalletTypeEnum {
    PRINCIPAL = 'PRINCIPAL',
    SECONDAIRE = 'SECONDAIRE'
};

@Schema({
    toJSON: { versionKey: false },
    timestamps: true,
})
export class Wallet {

    @Prop({
        type: Sch.Types.ObjectId,
        required: true,
    })
    account?: any;

    @Prop({
        type: Sch.Types.String,
        enum: WalletTypeEnum,
        required: true,
    })
    type?: WalletTypeEnum;

    @Prop({
        type: Sch.Types.String,
        required: true,
    })
    label?: string;

    /**
     * !!! ABOUT BALANCE !!!
     * Turn Over balance means in french Chiffre d'affaire. It's always an add operation.
     * So why having, available & real balance ?
     * We can't retrieve operation amount from user account until we deliver the service.
     * This is why, user still see his real balance.
     * And in background, we only use available balance to check if user has sufficient amount to make the request.
     */

    @Prop({
        type: Sch.Types.Number,
        default: 0,
    })
    availableBalance?: number;

    @Prop({
        type: Sch.Types.Number,
        default: 0,
    })
    realBalance?: number;

    @Prop({
        type: Sch.Types.Number,
        default: 0,
    })
    turnoverBalance?: number;
}

export type WalletDocument = Wallet & Document;

export const WalletSchema = SchemaFactory.createForClass(Wallet);
