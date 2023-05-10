
const t = require('./test.js');
const callback = () => {

    const context = {
        http: {
            createServer: (cb) => {
                const req = { url: 't222', };
                const res = { end: (p) => console.log(p + 't222'), };
                cb(req, res);
                return { server: { listen: (port) => console.log(`API 222on port ${port}`) } }
            }
        }
    }

    t.http = context.http;


    t.apply(context);
    t(80);
    console.dir(t)
};
callback();

