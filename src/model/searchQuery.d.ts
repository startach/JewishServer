export interface SearchQuery {
    name?: string,
    //address?: string,
    //days?: number[],
    startTime: string,
    endTime: string,
    sortBy: string,
    //mikve?: boolean,
    //parking?: boolean,
    //disabled_access?: boolean,
    shtiblach?: boolean,
    lat?: number,
    lon?: number,
    min_radius?: number,
    max_radius?: number
}