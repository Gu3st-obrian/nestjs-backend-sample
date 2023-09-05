import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as Sch } from 'mongoose';

@Schema({
    toJSON: { versionKey: false },
    timestamps: true,
})
export class Role {

    /**
     * Role details.
     */

    @Prop({
        type: Sch.Types.String,
        required: true,
        unique: true,
    })
    name?: string;

    @Prop({
        type: Sch.Types.String,
        required: true,
    })
    desc?: string;

    @Prop({
        type: Sch.Types.Boolean,
        required: true,
    })
    view?: boolean;

    @Prop({
        type: Sch.Types.Number,
        required: true,
    })
    catg?: number;
}

export type RoleDocument = Role & Document;

export const RoleSchema = SchemaFactory.createForClass(Role);
