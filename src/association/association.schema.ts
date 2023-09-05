import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as Sch } from 'mongoose';

@Schema({
    toJSON: { versionKey: false },
    timestamps: true,
})
export class Association {

    @Prop({
        type: Sch.Types.ObjectId,
        required: true,
        ref: "Enterprise",
    })
    enterprise?: any;

    @Prop({
        type: Sch.Types.ObjectId,
        required: true,
        ref: "Account",
    })
    account?: any;

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
}

export type AssociationDocument = Association & Document;

export const AssociationSchema = SchemaFactory.createForClass(Association);
