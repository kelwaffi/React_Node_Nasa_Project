
const parse = require('csv-parse');
const fs = require('fs');
const path = require('path')

const planets = require('./planets.mongo');


// const habitablePlanets = [];

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED'
        && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
        && planet['koi_prad'] < 1.6;
}

function getaHabitablePlanets() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '../../data', 'kepler_data.csv'))
            .pipe(parse({
                comment: '#',
                columns: true,
            }))
            .on('data', async (data) => {
                if (isHabitablePlanet(data)) {
                    // insert + update = upsert
                    // TODO: replace create with upsert 
                    savePlanet(data)

                }
            })
            .on('error', (err) => {
                console.log(err)
                reject(err)
            })
            .on('end', async () => {
                const countPlanetsFound = (await getAllPlanets()).length
                console.log(`${countPlanetsFound} habitable planets found!`);
                resolve()
            })
    });

}

async function getAllPlanets() {
    return await planets.find({}, {
        "__v": 0,
        "_id": 0,

    });
}
async function savePlanet(planet) {
    try {
        await planets.updateOne({
            keplerName: planet.kepler_name,
        }, {
            keplerName: planet.kepler_name,
        }, { upsert: true })

    } catch (error) {
        console.log(`could not save planet ${error}`)
    }
}

module.exports = {
    getaHabitablePlanets,
    getAllPlanets,
}