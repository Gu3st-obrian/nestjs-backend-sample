import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as Sch } from 'mongoose';

@Schema({
    toJSON: { versionKey: false },
    timestamps: true,
    collection: "policies"
})
export class Policy {

    @Prop({
        type: Sch.Types.ObjectId,
        required: true,
    })
    account?: any;

    @Prop({
        type: Sch.Types.ObjectId,
        required: true,
    })
    role?: any;

    @Prop({
        type: Sch.Types.Boolean,
        default: true,
    })
    active?: boolean;
}

export type PolicyDocument = Policy & Document;

export const PolicySchema = SchemaFactory.createForClass(Policy);
