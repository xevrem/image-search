
const express = require('express');
const axios = require('axios');

const app = express();

//ensure you have an imgur Client-ID
let secret = process.env.IMGUR_CLIENT_ID;

let searches = [];

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
                thumbnail: img.link,
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
