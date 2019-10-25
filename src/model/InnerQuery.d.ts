export interface InnerQuery {
    name?: { [regex: string]: string },
    address?: { [regex: string]: string },
    time?: { [regex: string]: string },
    speakerId?: object,
    "minyans.startTime"?: { [regex: string]: string },
    "minyans.endTime"?: { [regex: string]: string },
    "minyans.days": number,
    "externals.mikve"?: boolean,
    "externals.parking"?: boolean,
    "externals.disabled_access"?: boolean,
    "externals.shtiblach"?: boolean,
    location?: {
        $near: {
            $geometry: {
                type: string,
                coordinates: number[]
            },
            $maxDistance: number,
            $minDistance: number,
        }
    }
}