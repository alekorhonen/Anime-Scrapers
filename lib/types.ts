export interface IEpisode {
    url: string;
    number: number
}

export interface IVideo {
    url: string,
    file: string,
    type: string,
    quality: number|null
}

export interface ISearch {
    url: string,
    thumbnail: string|null,
    title: string,
    total_episodes: number|null
}

export interface IServerLink {
    url: string,
    source: string
}

export interface IResponse {
    enc: string;
    hd: string;
    server: string;
    cdn: string;
}