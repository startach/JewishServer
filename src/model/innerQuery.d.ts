export interface InnerQuery {
    name?: { [regex: string]: string },
    address?: { [regex: string]: string },
    "minyans.days"?: { [regex: string]: number[] },
    "minyans.startTime"?: { [regex: string]: number },
    "minyans.endTime"?: { [regex: string]: number },
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