
const express = require('express');
const axios = require('axios');

const app = express();

//ensure you have an imgur Client-ID
let secret = process.env.IMGUR_CLIENT_ID;

let searches = [];

app.get('/', (req, res) => {
    res.end(`
USAGE:
    IMAGE SEARCH:
        https://xev-img-search.glitch.me/api/imagesearch/<query>

        QUERY PARAMS:
            <query> - what you are searching for (i.e., LOL-cats)

        OPTIONAL PARAMS:
            offset=<int> where <int> is the page to offset to

    RECENT SEARCHES:
        https://xev-img-search.glitch.me/api/latest/imagesearch

RESULT EXAMPLES:
    IMAGE SEARCH:
        [0:
            {
                url:	"https://i.imgur.com/nnZL8tk.gif",
                snippet:	"TRY NOT TO LAUGH or GRIN: Funny Monkeys VS Dogs and Cats Compilation",
                thumbnail:	"https://i.imgur.com/nnZL8tk.gif",
                context:	"https://i.imgur.com/nnZL8tk.gif"
            }
        ]
    RECENT SEARCHES:
        [0:
            {
                term:	"cats and dogs",
                when:	"Fri Oct 27 2017 18:53:25 GMT+0000 (UTC)"
            }
        ]
    `);
})

//perform the image search
app.get('/api/imagesearch/:query', (req, res) => {
    //store search result
    searches.push({
        term: req.params.query,
        when: new Date().toString()
    });

    //do the lookup
    axios({
        url:`https://api.imgur.com/3/gallery/search/time/all/${req.query.offset||0}/`,
        method: 'GET',
        params: {
            q: req.params.query
        },
        headers: {
            'authorization': 'Client-ID '+ secret,
        }
    }).then(data => {
        //process results into a simple to use format
        let results = data.data.data.map(item => {
            let img = item.images ? item.images[0] : item;
            return {
                url: img.link,
                snippet: img.description || item.title,
                thumbnail: img.link.slice(0,-4)+'t'+img.link.slice(-4),
                context: item.link
            }
        });
        res.send(results);
    }).catch(err => {
        res.send(err);
    });
});

//return the most recent searches
app.get('/api/latest/imagesearch', (req, res) => {
    res.send(searches);
});

let listener = app.listen(process.env.PORT, () => {
    console.log('Your app is listening on port ' + listener.address().port);
});
