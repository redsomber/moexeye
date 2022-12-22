import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose'

@modelOptions({ schemaOptions: { timestamps: true } })
export class Data {
  @prop({ required: true })
  data!: object
}

export const DataModel = getModelForClass(Data)
