const request = require('sync-request');
const BASE_URL = "https://godaven.bitbean.com/api/V2/";
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const schedule = require('node-schedule');

export function godavenWorker(){
    schedule.scheduleJob('0 0 * * *', async () => {
        const worker = {
            index: async () => {
                const client = await MongoClient.connect(url, { useNewUrlParser: true })
                .catch(err => { console.log(err); });
        
                if (!client) {
                    return;
                }
                
                
                const db = client.db("jewish_world");
        
                var collection = db.collection('synagogues');
        
                worker.getSynagogues(collection);
            },
            getSynagogues: async (collection) => {
                var synagoguesArray = [];
                var i = 1;
                var pageNumber = 1;
        
                do {
                    let url = `shuls/search?type=shul&query=%20&pagenumber=${i}&limit=300&current_time=0&todays_day=0`;
                    let result = request('GET', BASE_URL + url);
                    let resultObj = JSON.parse(result.getBody());
                    
                    for (let j = 0; j < resultObj.shuls.length; j++) {
                        let synagogue = await worker.getSynagogueDetails(resultObj.shuls[j].id);
                        //console.log(synagogue)
                        //console.log(`DETAILS : ${j}`);
                        let res = await collection.updateOne({id: resultObj.shuls[j].id}, {$set: synagogue}, { upsert : true })    
                        //console.log(res)
                    }
                    console.log(`PAGE : ${i}`)
                    pageNumber = resultObj.num_of_pages;
                    i++;
                } while (i <= pageNumber);
        
                return synagoguesArray;
        
            },
            getSynagogueDetails: async (id) => {
                var synagogue;
                var url = `shuls/${id}/details`;
                var result = request('GET', BASE_URL + url);
                var resultObj = JSON.parse(result.getBody());
                //console.log(resultObj)
                //synagogue = resultObj;
                var properties = {
                    shtiblach: null,
                    mikve: null,
                    saferTorah: null,
                    parking: null,
                    disabled_access: null
                };
                var nameNotes = resultObj.name.concat(resultObj.notes);
                if(nameNotes.toLowerCase().indexOf('shtiebel') != -1 || 
                   nameNotes.toLowerCase().indexOf('shtibl') != -1 ||
                   nameNotes.toLowerCase().indexOf('שטיבל') != -1 ){
                    properties.shtiblach = true;
                } 
        
                if(nameNotes.toLowerCase().indexOf('mikv') != -1 || 
                   nameNotes.toLowerCase().indexOf('miqweh') != -1 ||
                   nameNotes.toLowerCase().indexOf('מקווה') != -1 || 
                   nameNotes.toLowerCase().indexOf('מקוה') != -1 ){
                    properties.mikve = true;
                } 
        
                if(resultObj.has_safer_torah == true){
                    properties.saferTorah = true;
                }
        
                var minyans = [];
                var existingIds = [];
                var daysNums = {
                    sun: 1,
                    mon: 2,
                    tues: 3,
                    wed: 4,
                    thurs: 5,
                    fri: 6,
                    sat: 7
                }
                for (let j = 0; j < Object.keys(resultObj.groupedByDayMinyanim).length; j++) {
                    let day = Object.keys(resultObj.groupedByDayMinyanim)[j];
                    for (let k = 0; k < Object.keys(resultObj.groupedByDayMinyanim[day]).length; k++) {
                        let minyan = Object.keys(resultObj.groupedByDayMinyanim[day])[k];
                        for (let l = 0; l < Object.keys(resultObj.groupedByDayMinyanim[day][minyan]).length; l++) {
                            if(!existingIds.includes(resultObj.groupedByDayMinyanim[day][minyan][l].id)){
                                let sunPos = null;
                                if(resultObj.groupedByDayMinyanim[day][minyan][l].zman_type != null){
                                    sunPos = resultObj.groupedByDayMinyanim[day][minyan][l].zman_type.name
                                }
        
                                minyans.push({
                                    minyan: resultObj.groupedByDayMinyanim[day][minyan][l].type,
                                    days: {
                                        mainInfo: resultObj.groupedByDayMinyanim[day][minyan][l].days.map((x)=>{return daysNums[x]}),
                                        olDays: resultObj.groupedByDayMinyanim[day][minyan][l].days,
                                        special_days_included: resultObj.groupedByDayMinyanim[day][minyan][l].special_days_included,
                                        special_days_only: resultObj.groupedByDayMinyanim[day][minyan][l].special_days_only,
                                        start_date: resultObj.groupedByDayMinyanim[day][minyan][l].start_date == null ? null : new Date(resultObj.groupedByDayMinyanim[day][minyan][l].start_date),
                                        end_date: resultObj.groupedByDayMinyanim[day][minyan][l].end_date == null ? null : new Date(resultObj.groupedByDayMinyanim[day][minyan][l].end_date),
                                        timeType: resultObj.groupedByDayMinyanim[day][minyan][l].zman_type == null ? 'absolute' : 'relative',
                                        sun_position: sunPos,
                                        offset: resultObj.groupedByDayMinyanim[day][minyan][l].offset_minutes,
                                        timeString: resultObj.groupedByDayMinyanim[day][minyan][l].time_at,
                                        not_earlier_than: resultObj.groupedByDayMinyanim[day][minyan][l].not_earlier_than,
                                        not_later_than: resultObj.groupedByDayMinyanim[day][minyan][l].not_later_than,
                                        moreInfo: {
                                            nusach: resultObj.groupedByDayMinyanim[day][minyan][l].nusach,
                                            notes: resultObj.groupedByDayMinyanim[day][minyan][l].notes,
                                            label: resultObj.groupedByDayMinyanim[day][minyan][l].label,
                                        },
                                        source: {
                                            name: "Go Daven",
                                            id: resultObj.groupedByDayMinyanim[day][minyan][l].id,
                                            updateDate: resultObj.groupedByDayMinyanim[day][minyan][l].updated_at
                                        }
                                    },
                                });
                                existingIds.push(resultObj.groupedByDayMinyanim[day][minyan][l].id);
                            }
        
                        }
                        
                    }
                    
                }
        
        
                synagogue = {
                    name: resultObj.name,
                    address: resultObj.formatted_address,
                    location: { type: 'Point', coordinates: [resultObj.lng, resultObj.lat] },
                    nosach: resultObj.shul_nusach,
                    properties: properties,
                    phone_number: [resultObj.phone],
                    notes: resultObj.notes,
                    source: {
                        name: "Go Daven",
                        id: resultObj.id,
                        crawlingDate: new Date(),
                        updateDate: new Date(resultObj.shul_last_updated_on),
                        removeDate: null
                    },
                    minyans: minyans
        
                }
        
        
                return synagogue;
            }
        
        }
        
        console.log('?')
        worker.index();         
    })
console.log('!')
}
