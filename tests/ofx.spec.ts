import { expect, describe, it } from "@jest/globals";

import fs from "fs";
import path from "path";
import { parse, serialize } from "../src/ofx";

describe("ofx", () => {

    it("parse", () => {
        const file = fs.readFileSync(path.join(__dirname, "data/example1.ofx"), "utf-8");
        const data = parse(file);

        // headers
        expect(data.header.OFXHEADER).toBe("100");
        expect(data.header.ENCODING).toBe("USASCII");

        const transactions = data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.STMTTRN;
        expect(transactions.length).toBe(5);

        const status = data.OFX.SIGNONMSGSRSV1.SONRS.STATUS;
        expect(status.CODE).toBe("0");
        expect(status.SEVERITY).toBe("INFO");
    });

    it("parse XML", () => {
        const file = fs.readFileSync(path.join(__dirname, "data/example-xml.qfx"), "utf-8");
        const data = parse(file);

        // headers
        expect(data.header.OFXHEADER).toBe("100");
        expect(data.header.ENCODING).toBe("USASCII");

        var transaction = data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.STMTTRN;
        expect(transaction).toStrictEqual({
            TRNTYPE: "INT",
            DTPOSTED: "20161215000550",
            TRNAMT: "0.84",
            FITID: "21172131531687",
            NAME: "Interest Paid"
        });

        var status = data.OFX.SIGNONMSGSRSV1.SONRS.STATUS;
        expect(status.CODE).toBe("0");
        expect(status.SEVERITY).toBe("INFO");
    });

    // parse <-> serialize
    it("serialize", () => {
        const file = fs.readFileSync(path.join(__dirname, "data/example1.ofx"), "utf-8");
        const data = parse(file);

        const content = serialize(data.header, data.OFX);
        expect(content).toBe(file);
        expect(parse(content)).toStrictEqual(data);
    });
})