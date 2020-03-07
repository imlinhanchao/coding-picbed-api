const http = require('http');
const fs = require("fs");
const path = require("path");
const coding = require('coding-picbed');
const formidable = require('formidable');

const install = require('./install');

const github = 'https://github.com/imlinhanchao/coding-picbed-api'

async function main() {
    createServer(await install());
}

async function createServer(config) {
    console.info('waiting to initialize...');
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
                    let file = files.file.path + path.extname(files.file.name);
                    fs.renameSync(files.file.path, file);
                    let data = await coding.upload(file);
                    fs.unlink(file, () => {});
                    response.end(JSON.stringify({
                        status: 0,
                        msg: 'upload success',
                        data
                    }));
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
            //response.end(`<script>location='${github}'</script>`);
        }
    
    }).listen(8888);
    console.info('Server running at http://localhost:8888/');
}

main();