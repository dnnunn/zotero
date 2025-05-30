'use strict';

const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { getSignatures, writeSignatures, onSuccess, onError } = require('./utils');

async function getReader(signatures) {
    const t1 = Date.now();
    
    const modulePath = path.join(__dirname, '..', 'reader');
    const targetDir = path.join(__dirname, '..', 'build', 'resource', 'reader');
    
    console.log('Using local reader build...');
    
    await fs.remove(targetDir);
    await fs.ensureDir(targetDir);
    
    await exec('npm ci', { cwd: modulePath });
    await exec('npm run build', { cwd: modulePath });
    await fs.copy(path.join(modulePath, 'build', 'zotero'), targetDir);
    
    signatures['reader'] = { hash: 'local' };
    
    const t2 = Date.now();
    
    return {
        action: 'reader',
        count: 1,
        totalCount: 1,
        processingTime: t2 - t1
    };
}

module.exports = getReader;
