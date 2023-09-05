import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as Sch } from 'mongoose';

@Schema({
    toJSON: { versionKey: false },
    timestamps: true,
})
export class Enterprise {

    @Prop({
        type: Sch.Types.String,
        required: true,
    })
    name?: string;

    @Prop({
        type: Sch.Types.String,
        default: "",
    })
    description?: string;

    @Prop({
        type: Sch.Types.Boolean,
        default: true,
    })
    active?: boolean;

    @Prop({
        type: Sch.Types.ObjectId,
        required: true,
        ref: 'Account',
    })
    owner?: any;

    @Prop({
        type: [
            {
                type: Sch.Types.ObjectId,
                ref: 'Wallet',
            }
        ],
        default: [],
    })
    wallets?: Array<any>;

    @Prop({
        type: Sch.Types.String,
        required: true,
        unique: true,
    })
    rccm?: string;

    @Prop({
        type: Sch.Types.String,
        default: null,
    })
    rccm_proof?: string;

    @Prop({
        type: Sch.Types.String,
        required: true,
        unique: true,
    })
    ifu?: string;

    @Prop({
        type: Sch.Types.String,
        default: null,
    })
    ifu_proof?: string;
}

export type EnterpriseDocument = Enterprise & Document;

export const EnterpriseSchema = SchemaFactory.createForClass(Enterprise);
