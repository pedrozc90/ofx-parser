export interface Ofx {
    header: {
        [key: string]: string;
    };
    [key: string]: any;
}
export declare function parse(data: string): Ofx;
export declare function serialize(header: any, body: any): string;
declare const _default: {
    parse: typeof parse;
    serialize: typeof serialize;
};
export default _default;
