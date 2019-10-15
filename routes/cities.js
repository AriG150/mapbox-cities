const express = require('express');
const mbClient = require('@mapbox/mapbox-sdk');
const mbGeocode = require('@mapbox/mapbox-sdk/services/geocoding');
const db = require('../models')
const router = express.Router();

const mb = mbClient({ accessToken: process.env.MAPBOX_KEY });
const geoCode = mbGeocode(mb);



router.get('/search', function (req, res) {
  res.render('cities/search');
});

router.get('/results', function (req, res) {
  //forward Geocode using req.query
  geoCode.forwardGeocode({
    query: `${req.query.city}, ${req.query.state}`,
    types: ['place'], 
    countries: ['us']
  }).send()
  .then(function(response) {
    // console.log(response.body.features)
    //iterate through the response and render stuff on page 
    let results = response.body.features.map(result => {
      return { 
        name: result.place_name,
        lat: result.center[1], 
        long: result.center[0]
      }
    })
    res.render('cities/results', {query: req.query, results }); //access to both city and state 
  })
});


//POST /add 
router.post('/add', function(req, res){
  console.log(req.body)
  //add a city to the cities table in our db 
  db.city.findOrCreate({
    where: {
      name:req.body.name
    },
    defaults: {
      lat: req.body.lat,
      long: req.body.long
    }
  })
  .then(function([city, created]){
    console.log(`💫  ${city.name} was ${created ? 'created' : 'found'}`)
    res.redirect('/favorites')
  })
})

//GET /favorites
router.get('/favorites', function(req, res){
  //TODO retreive all cities 
  db.city.findAll()
  .then(function(cities){
    let markers = cities.map(city => {
        let markerObj = {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [city.long, city.lat]
          },
          "properties": {
            "title": city.name,
            "icon": "airport"
          }
        }
        return JSON.stringify(markerObj)
    })
    res.render('cities/favorites', {cities, mapkey: process.env.MAPBOX_KEY, markers})
  })
})


module.exports = router;