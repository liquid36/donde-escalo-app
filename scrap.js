const puppeteer = require('puppeteer');
const addDays = require('date-fns/addDays');

module.exports.scrapWether = async function scrapWether (id) {
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // <- this one doesn't works in Windows
            '--disable-gpu'
          ],
          headless: true
    }); 
    const newPage = await browser.newPage();


    await newPage.goto('http://wap2.windguru.cz/view.php?&sc=' + id + '&m=3&n=&from=search&start=0&full=1');
    
    newPage.on('console', async (msg) => {
        const msgArgs = msg.args();
        for (let i = 0; i < msgArgs.length; ++i) {
            console.log(await msgArgs[i].jsonValue());
        }
    });
    const result = await newPage.evaluate(() => {

        function extractColumns(tr) {
            const rs = [];
            tr.querySelectorAll('td').forEach(element => rs.push(element.innerText.replace('\n', ' '))); 
            return rs;
        }

        function extractCloud(tr) {
            const rs = [];
            tr.querySelectorAll('td').forEach((td, index) => {
                if (index === 0) {
                    rs.push({});
                    return;
                }

                const divs = td.querySelectorAll('div');
                rs.push({
                    high: Number(divs[0].innerText.replace('-', '').trim()),
                    mid: Number(divs[1].innerText.replace('-', '').trim()),
                    low: Number(divs[2].innerText.replace('-', '').trim()),
                })

            });
            return rs;
        }
        const rows = document.querySelectorAll('table tr');

        const isoRow = rows[5].querySelectorAll('td')[0].innerText;
        const offset = isoRow.includes('isotherm') ? 1 : 0;

        const dates = extractColumns(rows[0]);
        const windSpeed = extractColumns(rows[1]);
        const windGust = extractColumns(rows[2]);
        const temp = extractColumns(rows[4]);
        // const isoTerm = extractColumns(rows[5]);
        const cloudCover = extractCloud(rows[5 + offset]);
        const precip = extractColumns(rows[6 + offset]);
        return {
            dates,
            windSpeed,
            windGust,
            temp,
            // isoTerm,
            cloudCover,
            precip
        }
    });

    await browser.close();

    const dds = calcDates(result.dates); 

    const len = dds.length;

    const datos = [];

    for(let i = 0; i < len; i++) {

        const precip = parseFloat(result.precip[i + 1]);

        datos.push({
            date: dds[i],
            windSpeed: Number(result.windSpeed[i + 1]),
            windGust: Number(result.windGust[i + 1]),
            temp: Number(result.temp[i + 1]),
            // isoTerm: result.isoTerm[i + 1],
            cloudCover: result.cloudCover[i + 1],
            precip: isNaN(precip) ? 0 : precip
        })
    }
    return datos;
} 

function dateSplit(text) {
    const [day, hour] = text.split(' ');
    return { 
        day, 
        hour: Number(hour.substring(0, 2)) 
    };
}

function calcDates(datesArray) {
    let start = new Date();
    datesArray.splice(0, 1);

    let { day: currentDay, hour: currentHour } = dateSplit(datesArray.splice(0, 1)[0]);

    start.setHours(currentHour, 0, 0);

    const dates = [ new Date(start.getTime()) ];

    for(let item of datesArray) {
        const { day, hour } = dateSplit(item);

        if (currentDay !== day) {
            currentDay = day;
            start = addDays(start, 1);
        }
        start.setHours(hour, 0, 0);
        dates.push(new Date(start));
    }
    return dates
}

const dayOfWeek = {
    'Su': 0,
    'Mo': 1,
    'Tu': 2,
    'We': 3,
    'Th': 4,
    'Fr': 5,
    'Sa': 6
}