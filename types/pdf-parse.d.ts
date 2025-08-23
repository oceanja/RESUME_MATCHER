declare module 'pdf-parse/lib/pdf-parse.js' {
  export interface PDFParseResult { text: string }
  const pdfParse: (data: Buffer | Uint8Array | ArrayBuffer) => Promise<PDFParseResult>;
  export default pdfParse;
}