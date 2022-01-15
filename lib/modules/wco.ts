import { Scraper_Module } from "../scraper";
import { IEpisode, IVideo, ISearch } from "../types"

export default class WCO extends Scraper_Module {

    baseUrl: string = 'https://www.wcostream.com';

    public search = async (keyword: string): Promise<ISearch[]> => {
        let html = await this._post(`${this.baseUrl}/search`, {}, `catara=${encodeURI(keyword)}&konuara=series`);
        let $ = this.cheerio.load(html);
        
        return $('#blog .cerceve').toArray().map((el: any) => {
            return {
                url: this.baseUrl + el.children[1].children[1].children[1].attribs.href,
                title: el.children[1].children[1].children[1].children[0].data,
                type: el.children[3].children[2].data
            }
        })
    }

    //WARNING: THIS IS NOT PRECISE
    //I never bothered to properly fix this, some of the results will be movies but will show up as a certain episode instead.
    //I would not use this for production unless you decided to fix it.
    public getEpisodes = async (url: string): Promise<IEpisode[]> => {
        let html = await this._get(url);
        let $ = this.cheerio.load(html);

        const slug = url.split('/')[4];

        return $('#catlist-listview ul li a.sonra')
        .toArray()
        .filter((el: any) => el.attribs.href.match(/(?:episode-)?([0-9]{1,4})-/) && !isNaN(parseInt(el.attribs.href.match(/(?:episode-)?([0-9]{1,4})-/)[1])))
        .map((el: any) => {
            let number = el.attribs.href;
            let replaces = slug.split('-');
            for(let i = 0; i < replaces.length; i++) {
                number = number.replace(replaces[i], '');
            }

            return {
                url: el.attribs.href,
                number: parseInt(number.match(/([0-9]{1,4})/)[1])
            };
        })
    }

    //It seems that the user agent needs to be the same when navigating to the video file in your browser
    //Haven't checked into it to confirm it.
    //Video requires the 'Referer' header as the Base URL.
    public getVideo = async (url: string): Promise<IVideo[]> => {
        const embedUrl = await this.getEmbedUrl(url);
        const embedSrc = await this._get(embedUrl);

        const $ = this.cheerio.load(embedSrc);
        const link = $('script')
            .toArray()
            .filter((el: any) => el.children[0] && el.children[0].data.match(/getvidlink\.php\?v=/))
            .map((el: any) => {
                return el.children[0].data
            })[0].match(/get\("(.*?)"/)[1];

        const linkResponse: any = await this._get('https://www.wcostream.com' + link, { 
            "X-Requested-With": "XMLHttpRequest",
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36'
        });
        
        let arr: IVideo[] = [];

        if(linkResponse.hd) {
            arr.push({
                url: url,
                file: linkResponse.cdn + '/getvid?evid=' + linkResponse.hd,
                type: 'video/mp4',
                quality: 720
            })
        }

        arr.push({
            url: url,
            file: linkResponse.cdn + '/getvid?evid=' + linkResponse.enc,
            type: 'video/mp4',
            quality: 576
        })

        return arr
    }

    private async getEmbedUrl(url: string): Promise<string> {
        let html = await this._get(url);
        let $ = this.cheerio.load(html);

        //.filter((x: any) => x && x.data.match(/decodeURIComponent/)).get(0)
        let rawContent = $('script')
            .toArray()
            .filter((el: any) => el.children[0] && el.children[0].data.match(/decodeURIComponent/))
            .map((el: any) => {
                return el.children[0].data
            })[0];
        
        const encodedTable = JSON.parse(rawContent.match(/\[(.*)\]/)![0]);
        const randomDecrease: number = rawContent.match(/- ([0-9]{1,8})\); }/)![1];

        let element = "";
        encodedTable.forEach((value: string) => { 
            let val = value.replace('"', '');
            const buff = Buffer.from(val, 'base64');
            val = buff.toString('utf-8').replace(/\D/g, '');
            element += String.fromCharCode(parseInt(val) - randomDecrease)
        });

        const iframe = decodeURIComponent(escape(element))
        $ = this.cheerio.load(iframe);

        return 'https://www.wcostream.com' + $('iframe').get(0).attribs.src
    }

    
}