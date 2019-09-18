(async () => {
var faker = require('faker');
let db = await require('mongodb').MongoClient.connect('mongodb://localhost:27017/jewish_world');
let dbo = db.db("jewish_world");
let synagogues = [];
let speakers = [];
let lessons = [];
for (let i = 0; i < 25; i++) {
    // minyan exact 
    let randTime = faker.random.number({min: 0, max: 86400})
    synagogues.push({
        name: faker.lorem.sentence(),
        address: faker.address.streetAddress(),
        location: {type: "Point", coordinates: [Number(faker.address.longitude()), Number(faker.address.latitude())]},
        nosach: faker.lorem.word(),
        minyans: [
            {
                minyan : faker.lorem.word(),
                timeType : "exact",
                days : [ 
                    1, 
                    2, 
                    3
                ],
                time : randTime,
                timeString: new Date(randTime * 1000).toISOString().substr(11, 5),
                lastVerified : new Date()
            }
        ],
        externals: {
            safer_torah: faker.random.boolean(),
            disabled_access: faker.random.boolean(),
            parking: faker.random.boolean(),
            women_section: faker.random.boolean()
        },
        //shtiblach: req.body.shtiblach,
        phone_number: faker.phone.phoneNumber(),
        image: faker.random.image(),
        donation_link: faker.internet.url(),
        notes: faker.lorem.text()
    })
    randTime = faker.random.number({min: 0, max: 86400})
    //minyan relative
    synagogues.push({
        name: faker.lorem.sentence(),
        address: faker.address.streetAddress(),
        location: {type: "Point", coordinates: [Number(faker.address.longitude()), Number(faker.address.latitude())]},
        nosach: faker.random.word(),
        minyans: [
            {
                minyan : faker.random.word(),
                timeType : "relative",
                days : [ 
                    1, 
                    2, 
                    3
                ],
                sun_position: 'sunset',
                offset: faker.random.number({min: 0, max: 60}),
                time : randTime,
                timeString: new Date(randTime * 1000).toISOString().substr(11, 5),
                lastVerified : new Date()
            }
        ],
        externals: {
            safer_torah: faker.random.boolean(),
            disabled_access: faker.random.boolean(),
            parking: faker.random.boolean(),
            women_section: faker.random.boolean()
        },
        shtiblach: faker.random.boolean(),
        phone_number: faker.phone.phoneNumber(),
        image: faker.random.image(),
        donation_link: faker.internet.url(),
        notes: faker.lorem.text()
    })
}
    var syna_ops = await dbo.collection("synagogues").insertMany(synagogues);

    for (let i = 0; i < 50; i++) {
        speakers.push({name: faker.name.firstName(), avatar: faker.image.imageUrl(), about: faker.lorem.sentences()})
    }
    var sp_ops = await dbo.collection("speakers").insertMany(speakers);

    for (let i = 0; i < 25; i++) {
        // once time lesson
        let d = new Date();
        let time = (+new Date(d).getHours()) * 60 * 60 + (+new Date(d).getMinutes()) * 60;
        lessons.push({
            speakerId: sp_ops.insertedIds[Math.floor(Math.random() * 50)],
            lessonSubject: 'One time ' + faker.lorem.sentence(),
            address: faker.address.streetAddress(),
            location: {type: "Point", coordinates: [Number(faker.address.longitude()), Number(faker.address.latitude())]},
            description: faker.lorem.sentences(),
            synagogueId: syna_ops.insertedIds[Math.floor(Math.random() * 50)],
            audience: faker.lorem.word(),
            date: d,
            time: time,
            timeString: new Date(time * 1000).toISOString().substr(11, 5),
            days: [faker.random.number({min:0, max: 6})],
            notes: faker.lorem.text(),
            contact_name: faker.name.firstName(),
            contact_number: faker.phone.phoneNumber()
        })

        // recurring lesson
        let randTime = faker.random.number({min: 0, max: 86400})
        lessons.push({
            speakerId: sp_ops.insertedIds[Math.floor(Math.random() * 50)],
            lessonSubject: 'Recurring ' + faker.lorem.sentence(),
            address: faker.address.streetAddress(),
            location: {type: "Point", coordinates: [Number(faker.address.longitude()), Number(faker.address.latitude())]},
            description: faker.lorem.sentences(),
            synagogueId: syna_ops.insertedIds[Math.floor(Math.random() * 50)],
            audience: faker.lorem.word(),
            //date: faker.date.soon(faker.random.number({min:0, max: 6})),
            time: randTime,
            timeString: new Date(randTime * 1000).toISOString().substr(11, 5),
            days: [0, 1, 4, 5],
            notes: faker.lorem.text(),
            contact_name: faker.name.firstName(),
            contact_number: faker.phone.phoneNumber()
        })
    }
    let less_ops = await dbo.collection("lessons").insertMany(lessons);
    console.log("done")
})()



//console.log(synagogue)