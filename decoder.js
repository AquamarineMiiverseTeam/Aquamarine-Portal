//thank you pretendo for the decoding

const pako = require('pako')
const TGA = require('tga')
const PNG = require('pngjs').PNG
const zlib = require('zlib')

const jpegLib = require('jpeg-js')
const jimp = require('jimp')

const util = require('util')

const fs = require('fs')

function decodeParamPack(input) {
    let base64Result = Buffer.from(input, 'base64').toString();

    base64Result = base64Result.slice(1, -1).split("\\");
        
    const out = {};
    for (let i = 0; i < base64Result.length; i += 2) {
        out[base64Result[i].trim()] = base64Result[i + 1].trim();
    }
    return out;
}

function paintingProccess(painting) {
    let paintingBuffer = Buffer.from(painting, 'base64');
    let output = '';
    try {
        output = pako.inflate(paintingBuffer);
    }
    catch (err) {
        console.error(err);
    }
    let tga = new TGA(Buffer.from(output));
    let png = new PNG({
        width: tga.width,
        height: tga.height
    });
    png.data = tga.pixels;
    let pngBuffer = PNG.sync.write(png);
    return `${pngBuffer.toString('base64')}`;
}

function decodeIcon(icon) {
    const icon2 = Buffer.from(icon, 'base64')

    var output = ''

    try {
        output = zlib.inflateSync(icon2)
    } catch (error) {
        console.log(error)
    }

    let tga = new TGA(Buffer.from(output))

    fs.writeFileSync('icon.tga', output)
}


function encodeIcon(community_id) {

    return new Promise((resolve, reject) => {
        jimp.read(`static/img/icons/${community_id}.jpg`, function(err, image) {
            const image2 = image.write(`${community_id}.tga`)
    
            const data = zlib.deflateSync(Buffer.from(image2.bitmap.data, 'base64')).toString('base64')

            image.write(`tga_icons/${community_id}.tga`)

            resolve('')
        })
    })
}

module.exports = {decodeParamPack, paintingProccess, decodeIcon, encodeIcon}