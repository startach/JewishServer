export interface SearchQuery {
    name?: string,
    address?: string,
    days?: number[],
    hours?: number[],
    mikve?: boolean,
    parking?: boolean,
    disabled_access?: boolean,
    shtiblach?: boolean,
    lat?: number,
    lon?: number,
    min_radius?: number,
    max_radius?: number
}