const axios = require('axios');

function init(adapter, cam) {
    adapter.__urlCameras = adapter.__urlCameras || {};
    adapter.__urlCameras[cam.name] = true;

    // check parameters
    if (!cam.url || typeof cam.url !== 'string' || (!cam.url.startsWith('http://') && !cam.url.startsWith('https://'))) {
        return Promise.reject(`Invalid URL: "${cam.url}"`);
    }

    return Promise.resolve();
}

function unload(adapter, cam) {
    if (adapter.__urlCameras[cam.name]) {
        delete adapter.__urlCameras[cam.name];
    }
    // after last unload all the resources must be cleared too
    if (Object.keys(adapter.__urlCameras)) {
        // unload
    }

    // do nothing
    return Promise.resolve();
}

function process(adapter, cam, req, res) {
    return axios.get(cam.url, {
        responseType: 'arraybuffer',
        validateStatus: status => status < 400,
        timeout: parseInt(cam.timeout || adapter.config.defaultTimeout, 10) || 2000,
    })
        .then(response => ({
            body: response.data,
            contentType: response.headers['Content-type'] || response.headers['content-type']
        }))
        .catch(error => {
            if (error.response) {
                throw new Error(error.response.data || error.response.status);
            } else {
                throw new Error(error.code);
            }
        });
}

module.exports = {
    init,
    process,
    unload,
};