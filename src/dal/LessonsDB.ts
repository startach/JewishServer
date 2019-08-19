import { MongoDB } from "./MongoDB";
import { Lesson } from "../model/Lesson";
import getCoordByCity from "city-to-coords";

export class LessonsDB extends MongoDB<Lesson> {
    constructor() {
        super("lessons")
    }

    public getLessonsByCity = async (city: string) => {
        const coords = await getCoordByCity(city);
        const now = new Date();

        const innerQuery = {
            days: { $all: now.getDay() + 1 },
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [
                            coords.lng,
                            coords.lat
                        ]
                    },
                    $maxDistance: 0,
                    $minDistance: 3000,
                }
            }
        };

        const models = await this.DB
            .find(innerQuery)
            .toArray();
        return models.sort((a, b) => a.likes.length - b.likes.length).slice(4);
    }
}
