import { Scraper_Module } from "../scraper";
import { IEpisode, IVideo, ISearch } from "../types"

export default class Tenshi extends Scraper_Module {

    baseUrl: string = 'https://tenshi.moe';

    public search = async (keyword: string): Promise<ISearch[]> => {
        let html = await this._get(`${this.baseUrl}/anime?q=${encodeURI(keyword)}`);
        const $ = this.cheerio.load(html);

        return $('ul.anime-loop li a').toArray().map((el: any) => {
            return {
                url: el.attribs.href,
                title: el.attribs.title
            }
        })
    }

    public getEpisodes = async (url: string): Promise<IEpisode[]> => {
        const html = await this._get(url);
        const $ = this.cheerio.load(html);

        const anime_id = url.split('/')[4]

        const episode_count = $('section.entry-episodes h2.mb-3 span.badge')
        .toArray()
        .map((el: any) => {
            return el.children[0].data
        })[0];

        let arr: IEpisode[] = [];

        for(let i = 0; i < episode_count; i++) {
            arr.push({
                url: `${this.baseUrl}/anime/${anime_id}/` + i,
                number: i
            })
        }

        return arr;
    }

    public getVideo = async (url: string): Promise<IVideo> => {
        const embedUrl = await this.getEmbedUrl(url);
        const html = await this._get(embedUrl);
        
        let src = html.match(/src: '(.*?)',/)[1]
        let size = html.match(/size: (.*?),/)[1]

        return {
            url: url,
            file: src,
            type: 'video/mp4',
            quality: parseInt(size)
        }
    }

    private async getEmbedUrl(url: string): Promise<string> {
        const html = await this._get(url);
        const $ = this.cheerio.load(html);

        return $('iframe').toArray()[0].attribs.src
    }
}