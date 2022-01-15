import { Scraper_Module } from "../scraper";
import { IEpisode, IVideo, ISearch } from "../types"

export default class Gogoanime2 extends Scraper_Module {

    baseUrl: string = 'https://gogoanime2.org';

    public search = async (keyword: string): Promise<ISearch[]> => {
        let response = await this._get(`${this.baseUrl}/search/${encodeURI(keyword)}`);
        const $ = this.cheerio.load(response);
        
        return $('.last_episodes ul.items li')
        .toArray()
        .map((el: any) => {
            return {
                url: this.baseUrl + el.children[1].children[1].attribs.href,
                thumbnail: this.baseUrl + el.children[1].children[1].children[1].attribs.src,
                title: el.children[1].children[1].attribs.title
            };
        })
    }

    public getEpisodes = async (url: string): Promise<IEpisode[]> => {
        let html = await this._get(url);
        const $ = this.cheerio.load(html);

        return $('#episode_related li a')
        .toArray()
        .map((el: any) => {
            return {
                url: this.baseUrl + el.attribs.href.replace(' ', ''),
                number: parseInt(el.children[1].children[1].data)
            };
        })
    }
    
    public getVideo = async (url: string): Promise<IVideo> => {
        const embedUrl = await this.getEmbedUrl(url);
        const html = await this._get(embedUrl);

        const file = html.match(/"file": '(.*?)'/)[1];

        return {
            url: url,
            file: (!file.includes('://')  ? this.baseUrl : '') + file,
            type: 'HLS',
            quality: null
        }
    }

    private async getEmbedUrl(url: string): Promise<string> {
        const html = await this._get(url);
        const $ = this.cheerio.load(html);

        return this.baseUrl + $('iframe').toArray()[0].attribs.src
    }
}