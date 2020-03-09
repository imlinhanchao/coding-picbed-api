const { Coding } = require('coding-picbed');
const http = require('http');
const fs = require("fs");
const path = require("path");
const formidable = require('formidable');
const url = require('url');

const install = require('./install');

const github = 'https://github.com/imlinhanchao/coding-picbed-api'
let codings = {};

async function main() {
    let config = await install();
    if(process.argv[2] != 'install') createServer(config);
}

async function createServer(config) {
    console.info('Waiting to initialize...');
    let coding = new Coding();
    await coding.config(config);
    codings[config.repository] = coding;
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
                    if (config.supportcustom
                        && url.parse(request.url).pathname == 'reset') {
                        let c = new Coding();
                        let { t, r } = fields;
                        if(!t || !r) return response.end(JSON.stringify({
                            status: 2,
                            msg: 'Parameter error!'
                        }));
                        await c.config({ token: t, repository: r });
                        codings[repository] = c;
                        return response.end(JSON.stringify({
                            status: 0,
                            msg: 'Reset Success!',
                            data: [
                                ...c.domains.map(d => `http://${d}/`),
                                ...(c.isShare ? [`https://${c.user}.coding.net/p/${c.project}/d/${c.repo}/git/raw/master/`] : [])
                            ]
                        }));
                    }
        
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
                        let c = coding;
                        if (config.supportcustom && fields.t && !(c = codings[fields.r])) {
                            c = new Coding();
                            let { t, r } = fields;
                            await c.config({ token: t, repository: r });
                            codings[r] = c;
                        }

                        let data = await c.upload(file);
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