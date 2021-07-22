const fs = require("fs");
const fetch = require("node-fetch");
const FileType = require("file-type");
const request = require("request");

const api_key = 'f336714212c5735b4d41b3bcf6a5630c';
let polygon_id = '';

var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);
  
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
  };
  


function savePhotoFromAPI(long, lat, count) {

    let requestBody = {
        "name":"Paulygon",
        "geo_json":{
            "type":"Feature",
            "properties":{
 
            },
            "geometry":{
                "type":"Polygon",
                "coordinates":[
                    [
                        [long,lat],
                        [long+0.01,lat],
                        [long+0.01,lat+0.01],
                        [long,lat+0.01],
                        [long,lat]
                        // [-121.2958,36.6683],
                        // [-121.2779,36.6687],
                        // [-121.2773,36.6792],
                        // [-121.2958,36.6792],
                        // [-121.2958,36.6683]
                    ]
                ]
            }
        }
    }

    fetch(`http://api.agromonitoring.com/agro/1.0/polygons?appid=${api_key}`, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {"Content-Type": "application/json"}
    })
    .then(response => response.json())
    .then(json => {
        // console.log(json);
        polygon_id=json.id;
    }).then(() => {
        let url = `http://api.agromonitoring.com/agro/1.0/image/search?start=1500000000&end=1613701423&resolution_min=10&polygon_id=${polygon_id}&appid=${api_key}`;
        fetch(url).then(function(response) {
            return response.json();
        }).then(function(data) {
            download(data[0].image.truecolor, 'img/' + count + '.png', function(){
                console.log('done');
            });
            // console.log(data)
        });
    })
}

function startScan() {
    console.log("starting scan");
    fs.readFile('progress.txt', 'utf8' , (err, data) => {
        if (err) {
          console.error("err")
          return
        }
        let long = parseFloat(data.split(",")[0]);
        let lat = parseFloat(data.split(",")[1]);
        let count = parseFloat(data.split(",")[2]);

        
        while(long <= -120.9) {
            console.log(long)
            if(lat > 90) {
                lat = -90;
            }
            while(lat <= 36.1) {
                savePhotoFromAPI(long, lat, count);
                lat+=0.01;
                count++;
                fs.writeFile('progress.txt', long + "," + lat + "," + count, function (err) {
                    if (err) return console.log(err);
                });
            }
            long+=0.01;
            fs.writeFile('progress.txt', long + "," + lat + "," + count, function (err) {
                if (err) return console.log(err);
            });
        }
      })
}

startScan();

// savePhotoFromAPI(-121, 36, 1);