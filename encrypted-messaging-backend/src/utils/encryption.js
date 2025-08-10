const crypto = require("crypto");

// Derive key once from secret in env (32 bytes)
const key = crypto.scryptSync(process.env.ENCRYPTION_SECRET, "salt", 32);
const algorithm = "aes-256-cbc";

function encrypt(text) {
    // Generate new random IV per encryption
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return { iv: iv.toString("hex"), encryptedData: encrypted };
}

function decrypt(encryptedData, ivHex) {
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
}

module.exports = { encrypt, decrypt };
