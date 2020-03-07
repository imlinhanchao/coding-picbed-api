const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function main() {
    let config_path = path.join(__dirname, 'config.json');

    if (process.argv[2] != 'install' && fs.existsSync(config_path)) return require('./config');
    
    let config = {};
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.inputData = function (key, defaultVal) {
        return new Promise((resolve, reject) => {
            try {
                this.question(`${key}: ` + (defaultVal ? `[${defaultVal}]` : ''), function (val) {
                    resolve(val || defaultVal);
                });
            } catch (error) {
                reject(error);
            }
        });
    };

    config.token = await rl.inputData('Coding Token');
    config.repository = await rl.inputData('Coding Repository URL');
    config.size = parseInt(await rl.inputData('File Size Limit(MB), -1 mean no limit', 1));
    config.port = parseInt(await rl.inputData('Server Port', 8888));

    fs.writeFile(config_path,
        JSON.stringify(config, null, 4),
        (err) => {
            if (err) console.error(`Save api config failed: ${err.message}`);
        });
    rl.close();

    return config;
}

module.exports = main;