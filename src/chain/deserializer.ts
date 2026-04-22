import ByteBuffer, { BBuffer as Buffer } from '../bytebuffer'
import { PublicKey } from '../crypto'

export type Deserializer = (buffer: any) => void

const PublicKeyDeserializer = (
    buf: any
) => {
    const c: any = fixed_buf(buf, 33)
    return PublicKey.fromBuffer(c)
}

const UInt64Deserializer = (b: any) => b.readUint64()

const UInt32Deserializer = (b: any) => b.readUint32()

const BinaryDeserializer = (b: any) => {
    const len = b.readVarint32()
    const b_copy = b.copy(b.offset, b.offset + len)
    b.skip(len)
    return Buffer.from(b_copy.toBinary(), 'binary')
}

const BufferDeserializer = (keyDeserializers: [string, Deserializer][]) => (
    buf: any
) => {
    const obj = {}
    // Convert the input to a ByteBuffer ONCE, outside the loop. Each
    // deserializer then reads sequentially, advancing the shared offset.
    //
    // Prior versions of this code re-ran `ByteBuffer.fromBinary(buf.toString(...))`
    // on every iteration. That pattern only worked because the old
    // @ecency/bytebuffer's `toString('binary')` serialized just the *remaining*
    // bytes (respecting offset/limit). The bundled replacement in
    // src/bytebuffer.ts serializes the entire buffer instead, so the re-parse
    // pattern silently rewound the read offset to 0 on every field, corrupting
    // every field after the first. Symptoms: memo decryption throwing
    // "Invalid key" because the nonce parsed as the first 8 bytes of the
    // `from` public key.
    if (!(buf instanceof ByteBuffer)) {
        buf = ByteBuffer.fromBinary(buf.toString('binary'), ByteBuffer.LITTLE_ENDIAN)
    }
    for (const [key, deserializer] of keyDeserializers) {
        try {
            obj[key] = deserializer(buf)
        } catch (error) {
            error.message = `${key}: ${error.message}`
            throw error
        }
    }
    return obj
}

function fixed_buf(b: any, len: number): any {
    if (!b) {
        throw Error('No buffer found on first parameter')
    } else {
        const b_copy = b.copy(b.offset, b.offset + len)
        b.skip(len)
        return Buffer.from(b_copy.toBinary(), 'binary')
    }
}

const EncryptedMemoDeserializer: any = BufferDeserializer([
    ['from', PublicKeyDeserializer],
    ['to', PublicKeyDeserializer],
    ['nonce', UInt64Deserializer],
    ['check', UInt32Deserializer],
    ['encrypted', BinaryDeserializer]
])

export const types = {
    EncryptedMemoD: EncryptedMemoDeserializer
}
