import { SynagoguesDB } from './dal/SynagoguesDB';
const DB = new SynagoguesDB();
const schedule = require('node-schedule');
const KosherZmanim = require('kosher-zmanim').default;
const tzlookup = require("tz-lookup");
//0 0 * * *

export function updateMinyan(){
     
     schedule.scheduleJob('*/5 * * * * *', async () => {
          let synagogues = await DB.getAll();
          synagogues.forEach((synagogue)=>{
               if(synagogue.minyans != null){
                    synagogue.minyans.forEach((minyan) => {
                         if(minyan.timeType == 'relative'){
                              let timezone = tzlookup(synagogue.location.coordinates[1], synagogue.location.coordinates[0])
                              const options = {
                                   date: new Date(),
                                   timeZoneId: timezone,
                                   locationName: timezone, //for simplicity, location is timezone
                                   latitude: synagogue.location.coordinates[1],
                                   longitude: synagogue.location.coordinates[0]
                              }
                              const kosherZmanim = new KosherZmanim(options);
                              const zmanim = kosherZmanim.getZmanimJson();
                              if (minyan.sun_position == 'sunrise') {
                                   let sunriseMinyanTime = new Date(new Date(zmanim.BasicZmanim.Sunrise).getTime() + minyan.offset * 60000);
                                   let hours = new Date(sunriseMinyanTime.toLocaleString("en-US", {timeZone: timezone})).getHours();
                                   let minutes = new Date(sunriseMinyanTime.toLocaleString("en-US", {timeZone: timezone})).getMinutes();
                                   minyan.time = hours * 60 * 60 + minutes * 60;
                                   minyan.timeString = new Date(minyan.time * 1000).toISOString().substr(11, 5);
                                   minyan.lastVerified = new Date();
                              } else if(minyan.sun_position == 'sunset'){
                                   let sunsetMinyanTime = new Date(new Date(zmanim.BasicZmanim.Sunset).getTime() + minyan.offset * 60000);
                                   let hours = new Date(sunsetMinyanTime.toLocaleString("en-US", {timeZone: timezone})).getHours();
                                   let minutes = new Date(sunsetMinyanTime.toLocaleString("en-US", {timeZone: timezone})).getMinutes();
                                   minyan.time = hours * 60 * 60 + minutes * 60;
                                   minyan.timeString = new Date(minyan.time * 1000).toISOString().substr(11, 5);
                                   minyan.lastVerified = new Date();
                              }
                              console.log(minyan);
                         }
                    });
               }
          });
     })
}
