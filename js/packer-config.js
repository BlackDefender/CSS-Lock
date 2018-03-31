// patches are relative to packer.js file
exports.config = {
    bundlePath: 'bundle.js',
    libs: [
        './sources/clipboard.min.js'
    ],
    app: [
        './sources/app.js'
    ],
    wrapIntoContentLoadedEvent: false,
    watcher: {
        path: './sources',
        delay: 100
    }
};