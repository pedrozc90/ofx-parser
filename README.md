# OFX #

> Forked from [**node-ofx**](https://github.com/chilts/node-ofx)

Parse Open Financial Exchange (OFX) files into a usable data structure. Serialize objects into OFX file format.

## Install

```bash
npm install git+https://github.com/pedrozc90/ofx-parser.git
```

## Usage

### Parsing

```typescript
import fs from "fs";
import ofx from "ofx";

const content = fs.readFileSync("Account-1234-5678.ofx", "utf-8");
const data = ofx.parse(content);
console.log(data);
```

### Serializing

```typescript
import fs from "fs";
import ofx from "ofx";

const header = {
    OFXHEADER: "100",
    DATA: "OFXSGML",
    VERSION: "103",
    SECURITY: "NONE",
    ENCODING: "USASCII",
    CHARSET: "1252",
    COMPRESSION: "NONE",
    OLDFILEUID: "NONE",
    NEWFILEUID: "unique id here"
};

const body = {
    SIGNONMSGSRQV1: {
      SONRQ: {
        DTCLIENT: "value",
        USERID: "user id",
        USERPASS: "password",
        LANGUAGE: "ENG",
        FI: {
          ORG: "org",
          FID: "fid"
        },
        APPID: "QWIN",
        APPVER: "2100",
        CLIENTUID: "needed by some places"
      }
    }
};

const ofx_string = ofx.serialize(header, body);
console.log(ofx_string);
```

### Data

In your data returned, you will have the following properties:

* OFX - a dump of the XML parsing as a js object
* header - just the 'key:values' pairs from the top of the OFX file

### Caveats

The OFX file format is yucky, horrible and just silly. This module helps parse
the ones I know about. And it doesn't do it in a nice way either. It may or may
not work for your own use - only by trying it will you find out.

If you discover a broken file, please submit an issue with the sample file.

This module takes the OFX format and does the following:

* splits off the initial set of metadata (the "Key:Value" lines)
* tries to mechnically turn the SGML into a valid XML format
* turns the XML into a JavaScript data structure

## License

Please, read [LICENSE](./LICENSE) file.
