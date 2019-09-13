//import * as KosherZmanim from "kosher-zmanim";
const KosherZmanim = require('kosher-zmanim').default;
var tzlookup = require("tz-lookup");
//console.log(tzlookup(33.589886, -7.603869)); // prints "America/New_York"

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

let tz = tzlookup(32.109333, 34.855499)
console.log(tz)
const options = {
    date: new Date(),
    timeZoneId: tz,
    locationName: tz,
    latitude: 32.109333,
    longitude: 34.855499,
    //elevation: number,
    //complexZmanim: true
}
const kosherZmanim = new KosherZmanim(options);
const zmanim = kosherZmanim.getZmanimJson();

let sunset = new Date(zmanim.BasicZmanim.Sunset).toLocaleString("en-US", {timeZone: tz});
let sunrise = new Date(new Date(zmanim.BasicZmanim.Sunrise).getTime() + 30*60000).toLocaleString("en-US", {timeZone: tz});
console.log(sunrise)
console.log(sunset)

// let tz = tzlookup(32.109333, 34.855499)
// for (let i = 1; i < 30; i++) {
//     const options = {
//         date: new Date().addDays(i),
//         timeZoneId: tz,
//         //locationName: string;
//         latitude: 32.109333,
//         longitude: 34.855499,
//         //elevation?: number,
//         //complexZmanim?: boolean
//     }
//     const kosherZmanim = new KosherZmanim(options);
//     const zmanim = kosherZmanim.getZmanimJson();
    
//     console.log(zmanim.BasicZmanim.Sunrise)   
// }


