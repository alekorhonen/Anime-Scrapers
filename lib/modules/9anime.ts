import { Scraper_Module } from "../scraper";
import { IEpisode, IVideo, ISearch } from "../types"

//This is not the official 9anime website, this is some rip off. But they do have a source that gives direct video files.
//The video host does ban indeed, so you're going to have to rotate your requests with proxies. 

export default class nineAnime extends Scraper_Module {

    baseUrl: string = 'https://9anime.gg';
    assetsUrl: string = 'https://assets.9anime.gg/';

    public search = async (keyword: string): Promise<ISearch[]> => {
        let response = await this._get(`${this.baseUrl}/my-ajax?limit=100&page=1&action=load_search_movie&keyword=${encodeURI(keyword)}`);
        
        return response.data.map((result: any) => {
            return {
                url: `${this.baseUrl}/watch/${result.post_name}.${result.salt}`,
                thumbnail: this.assetsUrl + result.image,
                title: result.post_title,
                total_episodes: parseInt(result.total_episode)
            }
        })
    }

    public getEpisodes = async (url: string): Promise<IEpisode[]> => {
        let html = await this._get(url);
        let $ = this.cheerio.load(html);

        return $('ul.episodes li a')
        .toArray()
        .map((el: any) => {
            return {
                url: el.attribs['data-src'],
                number: parseInt(el.attribs.title)
            };
        })
    }

    public getVideo = async (url: string): Promise<IVideo[]> => {
        const embedUrl: any = await this.getEmbedUrl(url);
        const videoId: string = embedUrl.fembed.link.split('/')[4]
        
        const result = await this._post(`https://animepl.xyz/api/source/${videoId}`, {}, {})

        return result.data.map((source: any) => {
            return {
                url: url,
                file: source.file,
                type: 'video/mp4',
                quality: source.label
            }
        })
    }

    private async getEmbedUrl(url: string): Promise<string> {
        const id = url.replace('https://media.opencdn.co/?id=', '');
        return await this._get(`https://app.opencdn.co/go?id=${id}`);
    }

    
}