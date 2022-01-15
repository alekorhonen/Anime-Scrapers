
import { WCO, nineAnime, Gogoanime, Gogoanime2, Tenshi, Gogoplay } from "./lib/modules";

(async function() {
   
    let scraper = new Gogoanime();

    let search = await scraper.search('One Piece');
    console.log(search)

    //let episodes = await scraper.getEpisodes('https://gogoanime.lol/category/one-piece');
    //console.log(episodes)
    
    //let video = await scraper.getVideo(episodes[0].url);
    //console.log(video)
    

}())
