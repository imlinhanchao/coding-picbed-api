const http = require('http');
const url = require("url");
const querystring = require('querystring');
const coding = require('coding-picbed');

const install = require('./install');

const github = 'https://github.com/imlinhanchao/coding-picbed-api'

async function main() {
    createServer(await install());
}

async function createServer(config) {
    console.info('waiting to initialize...');
    await coding.config(config);

    http.createServer(async function (request, response) {
        let query = querystring.parse(url.parse(request.url).query);
        
        if (query.w) {
            try {
                response.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE, PUT',
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Allow-Headers': 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With'
                });
                let data = {};
                response.end();
            } catch (error) {
                response.end(`
                    <p>Has something wrong:</p>
                    <p>
                        ${error.message}
                    </p>
                    <p>
                        Send a <a href="${github}/issues">Issue</a> to me.
                    </p>`);
                console.error(error);
            }
        } else {
            response.end(`<script>location='${github}'</script>`);
        }
    
    }).listen(8888);
    console.info('Server running at http://localhost:8888/');
}

main();