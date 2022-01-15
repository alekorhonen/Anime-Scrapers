import { Scraper_Module } from "../scraper";
import { IEpisode, IVideo, ISearch } from "../types"

export default class Gogoplay extends Scraper_Module {

    baseUrl: string = 'https://gogoplay1.com';

    public search = async (keyword: string): Promise<ISearch[]> => {
        let response = await this._get(`${this.baseUrl}/search.html?keyword=${encodeURI(keyword)}`);
        const $ = this.cheerio.load(response);
        
        return $('li.video-block a')
        .toArray()
        .map((el: any) => {
            return {
                url: this.baseUrl + el.attribs.href,
                thumbnail: el.children[1].children[1].children[1].attribs.src,
                title: el.children[1].children[1].children[1].attribs.alt
            };
        })
    }

    public getEpisodes = async (url: string): Promise<IEpisode[]> => {
        let html = await this._get(url);
        let $ = this.cheerio.load(html);

        return $('.listing .video-block a')
        .toArray()
        .map((el: any) => {
            return {
                url: this.baseUrl + el.attribs.href,
                number: parseInt(el.children[3].children[0].data.trim().replace(/\D/g,''))
            };
        })
    }

    public getVideo = async (url: string): Promise<IVideo> => {
        const embedUrl: string = await this.getEmbedUrl(url);
        const videoId: string = embedUrl.match(/id=(.*?)&t/)![1];
        
        const response = await this._get(`https://gogoplay.link/api.php?id=${videoId}`);

        return {
            url: url,
            file: response.m3u8,
            type: 'HLS',
            quality: null
        }
    }

    private async getEmbedUrl(url: string): Promise<string> {
        const html = await this._get(url);
        const $ = this.cheerio.load(html);

        return $('iframe').toArray()[0].attribs.src
    }
}