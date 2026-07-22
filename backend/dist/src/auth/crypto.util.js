"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.signJwt = signJwt;
exports.verifyJwt = verifyJwt;
const crypto = __importStar(require("crypto"));
const JWT_SECRET = process.env.JWT_SECRET || 'jhoanes-bakery-super-secret-key-change-in-production';
function base64url(source) {
    const buff = Buffer.isBuffer(source) ? source : Buffer.from(source);
    return buff.toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}
function verifyPassword(password, storedValue) {
    const [salt, hash] = storedValue.split(':');
    if (!salt || !hash)
        return false;
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
}
function signJwt(payload, expiresInSeconds = 86400) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const fullPayload = { ...payload, exp };
    const encodedHeader = base64url(JSON.stringify(header));
    const encodedPayload = base64url(JSON.stringify(fullPayload));
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto.createHmac('sha256', JWT_SECRET)
        .update(signatureInput)
        .digest();
    const encodedSignature = base64url(signature);
    return `${signatureInput}.${encodedSignature}`;
}
function verifyJwt(token) {
    const parts = token.split('.');
    if (parts.length !== 3)
        return null;
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto.createHmac('sha256', JWT_SECRET)
        .update(signatureInput)
        .digest();
    const expectedSignature = base64url(signature);
    if (encodedSignature !== expectedSignature)
        return null;
    try {
        const payloadJson = Buffer.from(encodedPayload, 'base64').toString('utf8');
        const payload = JSON.parse(payloadJson);
        if (payload.exp && Date.now() / 1000 > payload.exp) {
            return null;
        }
        return payload;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=crypto.util.js.map