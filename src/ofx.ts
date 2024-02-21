import xml2json from "xml2json";

export interface Ofx {
    header: { [key: string]: string } | null;
    OFX: { [key: string]: any } | null;
    [key: string]: any;
}

function sgml2Xml(sgml: string): string {
    return sgml
        .replace(/>\s+</g, "><")    // remove whitespace inbetween tag close/open
        .replace(/\s+</g, "<")      // remove whitespace before a close tag
        .replace(/>\s+/g, ">")      // remove whitespace after a close tag
        .replace(/<([A-Z0-9_]*)+\.+([A-Z0-9_]*)>([^<]+)/g, "<\$1\$2>\$3")
        .replace(/<(\w+?)>([^<]+)/g, "<\$1>\$2</\$1>");
}

function parseXml(content: string): any {
    const json = xml2json.toJson(content, { coerce: false });
    return JSON.parse(json);
}

function parseOfx(content: string): any {
    try {
        return parseXml(content);
    } catch (e) {
        return parseXml(sgml2Xml(content));
    }
}

export function parse(data: string): Ofx {
    // firstly, split into the header attributes and the footer sgml
    const ofx = data.split("<OFX>", 2);

    // firstly, parse the headers
    const headerString = ofx[0].split(/\r?\n/);
    
    let header: any | null = null;
    headerString.forEach((attrs) => {
        const headAttr = attrs.split(/:/, 2);
        if (typeof headAttr[1] === "undefined") return;
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

export function serialize(header: any, body: any): string {
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

const objToOfx = (obj: any): string => {
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
            return out += `${start}\n${objToOfx(item)}${end}\n`
        }
        out += start + item + "\n";
    });

    return out;
}

export default { parse, serialize };
