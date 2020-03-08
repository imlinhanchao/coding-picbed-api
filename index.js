const http = require('http');
const fs = require("fs");
const path = require("path");
const coding = require('coding-picbed');
const formidable = require('formidable');

const install = require('./install');

const github = 'https://github.com/imlinhanchao/coding-picbed-api'

async function main() {
    let config = await install();
    if(process.argv[2] != 'install') createServer(config);
}

async function createServer(config) {
    console.info('Waiting to initialize...');
    await coding.config(config);
    fs.mkdir(path.join(__dirname, 'tmp'), () => { });
    let html = fs.readFileSync(path.join(__dirname, 'upload.html'))

    http.createServer(async function (request, response) {
        if (request.method == 'POST') {
            try {
                response.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Allow-Headers': 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With'
                });
                
                const form = formidable({ multiples: true });
         
                form.parse(request, async (err, fields, files) => {
                    if (!files.f) return response.end(JSON.stringify({
                        status: 2,
                        msg: 'Parameter error!'
                    }));
                    if (config.size > 0 && files.f.size > 1024 * 1024 * config.size) {
                        response.end(JSON.stringify({
                            status: 1,
                            msg: 'File size to big!'
                        }));
                    }
                    let file = files.f.path + path.extname(files.f.name);
                    fs.renameSync(files.f.path, file);
                    try {
                        let data = await coding.upload(file);
                        fs.unlink(file, () => { });
                        response.end(JSON.stringify({
                            status: 0,
                            msg: 'upload success',
                            data
                        }));
                    } catch (e) {
                        response.end(JSON.stringify({
                            status: 3,
                            msg: e.message
                        }));
                    }
                });
            } catch (error) {
                response.end(JSON.stringify({
                    status: -1,
                    msg: `Has something wrong: ${error.message}. Please post a <a href="${github}/issues">Issue</a> to me.`
                }));
                console.error(error);
            }
        } else {
            response.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8',
            });
            response.end(html)
        }
    
    }).listen(8888);
    console.info('Server running at http://localhost:8888/');
}

main();