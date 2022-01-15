let axios   = require('axios'),
    cheerio = require('cheerio');

/*
axios.interceptors.request.use((request: any) => {
    console.log('Starting Request', JSON.stringify(request, null, 2))
    return request
})
*/

export class Scraper_Module {
    cheerio: any = cheerio;

    protected async _get(url: string, headers: object = {}, retries: number = 0) {
        let src: any;
    
        await axios.get(url, {
            "mode": "cors",
            headers: headers
        }).then((res: any) => {
            src = res.data
        }).catch(async () => {
            if(retries < 5) {
                return await this._get(url, headers, (retries + 1))
            }
        })
    
        return src;
    }

    protected async _post(url: string, headers: object, payload: any, retries: number = 0) {
        let src: any;
    
        await axios.post(url, payload, {
            headers: headers
        }).then((res: any) => {
            src = res.data
        }).catch(async () => {
            if(retries < 5) {
                return await this._post(url, headers, payload, (retries + 1))
            }
        })
    
        return src;
    }

    protected slugify(value: string) {
        return value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
    }
}