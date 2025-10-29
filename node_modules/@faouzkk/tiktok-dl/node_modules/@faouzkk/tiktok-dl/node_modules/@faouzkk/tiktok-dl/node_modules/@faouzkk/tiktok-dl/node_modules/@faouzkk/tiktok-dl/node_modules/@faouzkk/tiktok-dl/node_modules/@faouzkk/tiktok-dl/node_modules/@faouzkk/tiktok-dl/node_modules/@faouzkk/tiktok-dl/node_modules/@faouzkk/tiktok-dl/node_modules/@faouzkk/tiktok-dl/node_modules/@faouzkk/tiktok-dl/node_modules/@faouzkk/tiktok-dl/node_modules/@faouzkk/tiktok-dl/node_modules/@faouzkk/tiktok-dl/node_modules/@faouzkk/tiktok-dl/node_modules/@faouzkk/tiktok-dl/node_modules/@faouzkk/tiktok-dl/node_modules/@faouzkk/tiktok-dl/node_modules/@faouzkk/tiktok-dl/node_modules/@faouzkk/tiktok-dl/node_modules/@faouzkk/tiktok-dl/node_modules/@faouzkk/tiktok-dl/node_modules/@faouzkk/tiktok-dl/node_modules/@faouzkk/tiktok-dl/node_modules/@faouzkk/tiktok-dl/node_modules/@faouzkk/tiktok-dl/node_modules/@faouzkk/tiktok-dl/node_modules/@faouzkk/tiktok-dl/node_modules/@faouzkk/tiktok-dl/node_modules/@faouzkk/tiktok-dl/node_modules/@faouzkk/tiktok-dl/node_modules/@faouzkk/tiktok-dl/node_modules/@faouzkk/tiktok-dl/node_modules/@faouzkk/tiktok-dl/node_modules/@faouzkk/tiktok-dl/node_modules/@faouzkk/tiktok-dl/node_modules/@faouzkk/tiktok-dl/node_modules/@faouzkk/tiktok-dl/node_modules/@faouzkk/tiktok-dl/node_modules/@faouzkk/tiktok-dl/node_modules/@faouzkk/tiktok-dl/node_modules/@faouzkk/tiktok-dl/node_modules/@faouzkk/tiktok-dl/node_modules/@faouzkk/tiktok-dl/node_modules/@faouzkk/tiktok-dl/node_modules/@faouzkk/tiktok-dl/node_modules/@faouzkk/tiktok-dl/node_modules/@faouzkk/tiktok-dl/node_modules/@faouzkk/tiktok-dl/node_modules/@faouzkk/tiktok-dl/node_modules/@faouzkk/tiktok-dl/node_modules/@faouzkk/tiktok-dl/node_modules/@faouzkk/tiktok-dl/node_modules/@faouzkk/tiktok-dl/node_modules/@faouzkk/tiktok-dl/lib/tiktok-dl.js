const axios = require("axios");
const cheerio = require("cheerio");



async function tiktokdl(url) {

    if (typeof (url) !== 'string') throw new TypeError('url must be a string');

    try {

        const { data } = await axios({
            method: 'POST',
            url: 'https://ssstik.io/abc?url=dl',
            data: new URLSearchParams({
                id: url,
                locale: 'fr',
                tt: 'Qm93TXQ3'
            }),
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0',
                'Accept': '*/*',
                'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'HX-Request': 'true',
                'HX-Trigger': '_gcaptcha_pt',
                'HX-Target': 'target',
                'HX-Current-URL': 'https://ssstik.io/fr',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': 'https://ssstik.io',
                'Connection': 'keep-alive',
                'Referer': 'https://ssstik.io/fr',
                'Cookie': '_ga_ZSF3D6YSLC=GS1.1.1728787933.1.1.1728790407.55.0.0; _ga=GA1.1.624110977.1728787934; __gads=ID=05c5f6958f05a123:T=1728787934:RT=1728790192:S=ALNI_MYu9BXIb0XCauLE81pIdJ0OvowKLw; __gpi=UID=00000f3c6c26576c:T=1728787934:RT=1728790192:S=ALNI_MYIhnTpHoJA9qrmMTkgBiRbF26FFA; __eoi=ID=1b22cf63288ace8e:T=1728787934:RT=1728790192:S=AA-AfjaKaZxZV95qb7nEcJJdaJB0; FCNEC=%5B%5B%22AKsRol8d17sGI9Yqvz7RmFptA7-KX02rNwnN88JVIq9SSDpnsC5-CrZTQ6bjOjFXD-o6QG0YPVhILJQPJA5vY93Ft9ZRvB0vqUtypI42rAb827nzgZSFGzaVP7gobXYeuC9stDc3oB1kKwKlg6y1g8zDqew8t5kgKA%3D%3D%22%5D%5D',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'Priority': 'u=0'
            }
        })

        if (!data) throw new Error('Error when fethings');

        const $ = cheerio.load(data);

        let videoUri = $('a.download_link.without_watermark').attr('href');
        let AudioURI = $('a.download_link.music').attr('href');

        if (videoUri && AudioURI) {

            return {
                status: 200,
                author: 'FaouzKK',
                video: videoUri,
                audio: AudioURI

            }
        }
        else {
            throw new Error('No result founded ; make sur that the url is correct');
        }

    } catch (err) {
        console.log(err);
        return {
            status: 500,
            author: 'FaouzKK',
            message: err.message
        }
    }
}

module.exports = { tiktokdl }

