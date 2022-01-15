import { Scraper_Module } from "../scraper";
import { IEpisode, IVideo, ISearch } from "../types"

interface IDetails {
    movie_id: string,
    last_ep: number
}

export default class Gogoanime extends Scraper_Module {

    baseUrl: string = 'https://gogoanime.lol';

    public search = async (keyword: string): Promise<ISearch[]> => {
        let response = await this._get(`${this.baseUrl}/search.html?keyword=${encodeURI(keyword)}`);
        const $ = this.cheerio.load(response);
        
        return $('.last_episodes ul.items li')
        .toArray()
        .map((el: any) => {
            return {
                url: el.children[1].children[1].attribs.href,
                thumbnail: el.children[1].children[1].children[1].attribs.src,
                title: el.children[1].children[1].attribs.title
            };
        })
    }

    public getEpisodes = async (url: string): Promise<IEpisode[]> => {
        let { movie_id, last_ep } = await this.getAnimeDetails(url);

        const slug: string = url.split('/')[4]
        let html = await this._get(`${this.baseUrl}/ajax/load_list_episode?ep_start=1&ep_end=${last_ep}&id=${movie_id}&default_ep=1000&alias=${slug}`);
        let $ = this.cheerio.load(html);

        return $('#episode_related li a')
        .toArray()
        .map((el: any) => {
            return {
                url: el.attribs.href,
                number: parseInt(el.children[1].children[0].data.replace('Episode', ''))
            };
        })
    }

    public getVideo = async (url: string): Promise<IVideo> => {
        const embedUrl = await this.getEmbedUrl(url);
        const videoId = embedUrl.split('/')[4].replace('?domain=gogoanime.lol', '');
        const sKey = (await this._get(embedUrl, { "referer": url })).match(/window\.skey = '(.*?)';/)[1]
        
        const response = await this._get(`https://vidstream.pro/info/${videoId}?domain=gogoanime.lol&skey=${sKey}`, { 'referer': embedUrl })

        return {
            url: url,
            file: response.media.sources[0].file,
            type: 'HLS',
            quality: null
        }
    }

    private async getEmbedUrl(url: string): Promise<string> {
        const html = await this._get(url);
        const $ = this.cheerio.load(html);

        return $('iframe').toArray()[0].attribs.src
    }

    private async getAnimeDetails(url: string): Promise<IDetails> {
        let html = await this._get(url);
        let $ = this.cheerio.load(html);

        let movie_id = $('#movie_id')[0].attribs.value
        let last_ep = $('#episode_page li a')
        last_ep = last_ep[last_ep.length - 1].attribs.ep_end

        return {
            movie_id,
            last_ep
        }
    }
}