import { ObjectId } from "bson";
import { Location } from "./Location";
import { Favorite } from "./Favorite";
import { SearchQuery } from "./SearchQuery";

export interface User {
    _id: ObjectId;
    email: string,
    first_name: string,
    last_name: string,
    fb_id: string,
    g_id: string
    cityName: string,
    Location: Location,
    favorites: Favorite[],
    favorites_count: number,
    searchHistory: SearchQuery[]
}
