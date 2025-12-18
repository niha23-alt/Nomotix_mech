import mongoose from "mongoose";
const garageschema=new mongoose.Schema({
    name:String,
    location:{
       type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    },
    address: String
    },
    services:[{
        service:{type:mongoose.Schema.Types.ObjectId,ref:"Service"},
        CustomPrice:Number,
        serviceDescription:String,
        durationInMinutes:Number,
    }],
    ratingsSummary:{
        Customer:{
            average:{type:Number,default:0},
            totalReviews:{
                type:Number,default:0
            },
        },
        teamReview:{
            average:{type:Number,default:0},
            totalReviews:{ type:Number,default:0},
        }
    },
    servicesCompleted:{type:Number,default:0},
},{
    timestamps:true,
}
);
garageschema.index({location:"2dsphere"});
export default mongoose.model('Garage',garageschema);