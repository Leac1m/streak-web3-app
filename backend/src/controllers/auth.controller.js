import User from "../models/user.js";
import TonWeb from "tonweb";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { badRequest, unauthorized } from "../utils/ApiError.js";
import crypto from "crypto";
import { Address } from "@ton/core";

// import { Address } from "@ton/core";
import nacl from "tweetnacl";
// import crypto from "crypto";

export const authController = async (req, res) => {
  try {
    const {
      walletAddress,
      signature,
      nonce,
      publicKey,
      message,
      domain,
      timestamp
    } = req.body;

    // ---------------------------
    // VALIDATE NONCE
    // ---------------------------
    const redisNonce = await global.redis.get(`nonce:${walletAddress}`);
    if (!redisNonce) throw badRequest("Nonce expired or invalid.");

    const expectedSuffix = `Nonce: ${redisNonce}`;
    if (!message.endsWith(expectedSuffix)) {
      throw badRequest("Message does not end with expected nonce suffix.");
    }

    // Timestamp freshness
    const nowMs = Date.now();
    const timestampMs = Number(timestamp) * 1000;
    const driftMs = Math.abs(nowMs - timestampMs);

    if (driftMs > 5 * 60 * 1000) {
      throw badRequest("Timestamp outside allowed drift window.");
    }

    // ---------------------------
    // RECONSTRUCT TON-CONNECT SIGNATURE PAYLOAD
    // ---------------------------

    const addr = Address.parse(walletAddress);

    // prefix = 4 bytes zero
    const prefix = Buffer.alloc(4);

    // label = "ton-connect"
    const label = Buffer.from("ton-connect", "utf8");

    // Address encoding: 1 byte wc + 32 byte hash
    const wc = Buffer.from([addr.workChain]); // int8
    const addrHash = Buffer.from(addr.hash);

    // Domain: length (4 bytes LE) + value
    const domainBuf = Buffer.from(domain, "utf8");
    const domainLen = Buffer.alloc(4);
    domainLen.writeUInt32LE(domainBuf.length);

    // Timestamp: uint64 BE
    const tsBuf = Buffer.alloc(8);
    tsBuf.writeBigUInt64BE(BigInt(timestamp));

    // Payload: message (utf-8 bytes)
    const payloadBuf = Buffer.from(message, "utf8");

    const fullMessage = Buffer.concat([
      prefix,
      label,
      wc,
      addrHash,
      domainLen,
      domainBuf,
      tsBuf,
      payloadBuf
    ]);

    const messageHash = crypto.createHash("sha256").update(fullMessage).digest();

    // signature + pubkey MUST be base64
    const signatureBuffer = Buffer.from(signature, "base64");
    const publicKeyBuffer = Buffer.from(publicKey, "hex");

    const isValid = nacl.sign.detached.verify(
      messageHash,
      signatureBuffer,
      publicKeyBuffer
    );

    if (!isValid) {
      throw unauthorized("Invalid signature.");
    }

    // Remove nonce to prevent replay
    await global.redis.del(`nonce:${walletAddress}`);

    // ---------------------------
    // SAVE USER, ISSUE JWT
    // ---------------------------

    let user = await User.findOne({ walletAddress });
    if (!user) user = new User({ walletAddress });

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      env.jwtSecret,
      { expiresIn: `${env.jwtExpiryHours}h` }
    );

    return res.status(200).json({
      success: true,
      message: "Authenticated successfully",
      token,
      user: {
        walletAddress: user.walletAddress,
        heroPoints: user.heroPoints,
        streak: user.streak,
      },
    });

  } catch (err) {
    console.error("Auth error:", err);
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        details: err.details
      });
    }
    return res.status(500).json({ success: false, message: "Authentication failed." });
  }
};
