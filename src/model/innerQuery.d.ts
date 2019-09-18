export interface InnerQuery {
    name?: { [regex: string]: string },
    address?: { [regex: string]: string },
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