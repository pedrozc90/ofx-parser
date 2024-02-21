"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serialize = exports.parse = void 0;
const xml2json_1 = __importDefault(require("xml2json"));
function sgml2Xml(sgml) {
    return sgml
        .replace(/>\s+</g, "><") // remove whitespace inbetween tag close/open
        .replace(/\s+</g, "<") // remove whitespace before a close tag
        .replace(/>\s+/g, ">") // remove whitespace after a close tag
        .replace(/<([A-Z0-9_]*)+\.+([A-Z0-9_]*)>([^<]+)/g, "<\$1\$2>\$3")
        .replace(/<(\w+?)>([^<]+)/g, "<\$1>\$2</\$1>");
}
function parseXml(content) {
    const json = xml2json_1.default.toJson(content, { coerce: false });
    return JSON.parse(json);
}
function parseOfx(content) {
    try {
        return parseXml(content);
    }
    catch (e) {
        return parseXml(sgml2Xml(content));
    }
}
function parse(data) {
    // firstly, split into the header attributes and the footer sgml
    const ofx = data.split("<OFX>", 2);
    // firstly, parse the headers
    const headerString = ofx[0].split(/\r?\n/);
    let header = null;
    headerString.forEach((attrs) => {
        const headAttr = attrs.split(/:/, 2);
        if (typeof headAttr[1] === "undefined")
            return;
        if (header == null) {
            header = {};
        }
        header[headAttr[0]] = headAttr[1];
    });
    // make the SGML and the XML
    const content = (ofx.length !== 1) ? `<OFX>${ofx[1]}` : "";
    // Parse the XML/SGML portion of the file into an object
    // Try as XML first, and if that fails do the SGML->XML mangling
    let dataParsed = parseOfx(content);
    if (!Object.keys(dataParsed).length) {
        dataParsed = { OFX: null };
    }
    // put the headers into the returned data
    // dataParsed.header = header;
    return { header, ...dataParsed };
}
exports.parse = parse;
function serialize(header, body) {
    // header order could matter
    const headers = [
        "OFXHEADER",
        "DATA",
        "VERSION",
        "SECURITY",
        "ENCODING",
        "CHARSET",
        "COMPRESSION",
        "OLDFILEUID",
        "NEWFILEUID"
    ];
    let out = "";
    headers.forEach((name) => {
        out += `${name}:${header[name]}\n`;
    });
    out += "\n";
    out += objToOfx({ OFX: body });
    return out;
}
exports.serialize = serialize;
const objToOfx = (obj) => {
    let out = "";
    Object.keys(obj).forEach((name) => {
        const item = obj[name];
        const start = `<${name}>`;
        const end = `</${name}>`;
        if (item instanceof Object) {
            if (item instanceof Array) {
                item.forEach((it) => {
                    out += `${start}\n${objToOfx(it)}${end}\n`;
                });
                return;
            }
            return out += `${start}\n${objToOfx(item)}${end}\n`;
        }
        out += start + item + "\n";
    });
    return out;
};
exports.default = { parse, serialize };
//# sourceMappingURL=ofx.js.map