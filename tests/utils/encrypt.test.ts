import { encrypt } from "../../utils/encrypt";

describe("encrypt", () => {
  it("should return a Buffer with iv+tag+ciphertext", () => {
    process.env.ENCRYPTION_KEY = "".padStart(64, "a"); // mock 32 bytes hex
    const data = { foo: "bar" };
    const result = encrypt(data);
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeGreaterThan(28); // 12 IV + 16 tag + ciphertext
  });
});
