import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as Sch } from 'mongoose';

@Schema({
    toJSON: { versionKey: false },
    timestamps: true,
})
export class Linkage {

    @Prop({
        type: Sch.Types.ObjectId,
        required: true,
        ref: "Account",
    })
    master?: any;

    @Prop({
        type: Sch.Types.ObjectId,
        required: true,
        ref: "Account",
    })
    subject?: any;
}

export type LinkageDocument = Linkage & Document;

export const LinkageSchema = SchemaFactory.createForClass(Linkage);
