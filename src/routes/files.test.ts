import { sanitizeFilename } from "./files";

describe("sanitizeFilename", () => {
  it.each([
    ["relatório final.pdf", "relatório final.pdf"],
    ["../../etc/passwd", "passwd"],
    ["C:\\Users\\ana\\foto.png", "foto.png"],
    ["nome\u0000com\u001fcontrole.txt", "nomecomcontrole.txt"],
    ["   ", "arquivo"],
  ])("%j → %j", (input, expected) => {
    expect(sanitizeFilename(input)).toBe(expected);
  });
});
