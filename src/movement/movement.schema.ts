import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as Sch } from 'mongoose';
import { createHmac } from 'crypto';
import { COLLECTION_NAME as WALLETS_COLLECTION_NAME } from '../wallet/wallet.schema';

export enum MovementTypeEnum {
    DEBIT = 'DEBIT',
    CREDIT = 'CREDIT'
};

export const COLLECTION_NAME = 'movements';


@Schema({
    toJSON: { versionKey: false },
    timestamps: true,
    collection: COLLECTION_NAME,
})
export class Movement {

    @Prop({
        type: Sch.Types.ObjectId,
        required: true,
    })
    wallet?: any;

    @Prop({
        type: Sch.Types.String,
        required: true,
    })
    nature?: MovementTypeEnum;

    @Prop({
        type: Sch.Types.Number,
        default: 0,
    })
    beforeBalance?: number;

    @Prop({
        type: Sch.Types.Number,
        required: true,
    })
    amount?: number;

    @Prop({
        type: Sch.Types.Number,
        default: 0,
    })
    afterBalance?: number;

    @Prop({
        type: Sch.Types.Boolean,
        default: false,
    })
    virtual?: boolean;

    @Prop({
        type: Sch.Types.String,
        required: true,
    })
    motif?: string;

    @Prop({
        type: Sch.Types.String,
        default: "",
    })
    description?: string;

    @Prop({
        type: Sch.Types.String,
        required: true,
        unique: true,
    })
    uniqueKey?: string;

    @Prop({
        type: Sch.Types.String,
        // required: true,
        unique: true,
    })
    signature?: string;

    @Prop({
        type: Sch.Types.Boolean,
        default: true,
    })
    active?: boolean;

    @Prop({
        type: Sch.Types.Boolean,
        default: true,
    })
    confirmed?: boolean;
}

export type MovementDocument = Movement & Document;

export const MovementSchema = SchemaFactory.createForClass(Movement);

/**
 * Auto sign movement request with proper secret key.
 */
MovementSchema.pre('save', async function (doc: any) {
    // Construct signature movement.
    const props = [];
    props.push(this['wallet']);
    props.push(this['nature']);
    props.push(this['amount']);
    props.push(this['virtual']);
    props.push(this['motif']);
    props.push(this['description']);
    props.push(this['uniqueKey']);

    // Get last element signature.
    let secret: string = null;
    for await (const lastElement of this.db.collections[COLLECTION_NAME].find().sort({ createdAt: -1 }).limit(1)) {
        secret = lastElement['signature'];
    }

    if (!secret || !secret.length) {
        console.log('MongoCreateWarning: Failed to retrieve previous signature');
        /**
         * Super Admin make first movement.
         * So, if not found, throw an error.
         */
        throw new Error('Failed to retrieve signature');
    }

    // Get last operation balance.
    const lastOperation = <MovementDocument>await this.db.collections[COLLECTION_NAME].findOne({ wallet: this['wallet'] }, { sort: { createdAt: -1 } });

    // Set before balance.
    this['beforeBalance'] = lastOperation ? lastOperation.afterBalance : 0;
    props.push(this['beforeBalance']);

    // Set after balance.
    this['afterBalance'] = (this['nature'] == MovementTypeEnum.CREDIT) ? this['beforeBalance'] + this['amount'] : this['beforeBalance'] - this['amount'];
    props.push(this['afterBalance']);

    // Sign entry.
    this['signature'] = createHmac('sha256', secret).update(props.join('|')).digest('hex');
});

/**
 * Auto update account balance.
 */
MovementSchema.post('save', async function (doc: MovementDocument) {
    
    // Get last movement operation.
    const lastOperation = <MovementDocument> await this.db.collections[COLLECTION_NAME].findOne({ 
        wallet: doc.wallet,
    }, {
        sort: { createdAt: -1 },
    });
    
    /**
     * Update Turn Over & Real Balance only here.
     * Available Balance are monitored by payments operations.
     */
    await this.db.collections[WALLETS_COLLECTION_NAME].updateOne({
        _id: doc.wallet,
    }, {
        $inc: {
            realBalance: (doc.nature == MovementTypeEnum.CREDIT) ? lastOperation.amount : -1 * lastOperation.amount,
            turnoverBalance: lastOperation.amount,
        }
    });
});
