import mongoose, { Schema,model } from "mongoose";

const subscriptionSchema=new Schema({
subsciber:{
    type:Schema.Types.ObjectId,
    ref:"User"
},
channel:{
    type:Schema.Types.ObjectId,
    ref:"User"
},
},{
    timestamps:true
})

export const Subscription=model('Subscription',subscriptionSchema)
