const ByteBuffer = require("@ecency/bytebuffer");
const Buffer = ByteBuffer;
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
    buf: any | Buffer
) => {
    const obj = {}
    for (const [key, deserializer] of keyDeserializers) {
        try {
            // Decodes a binary encoded string to a ByteBuffer.
            buf = ByteBuffer.fromBinary(buf.toString('binary'), ByteBuffer.LITTLE_ENDIAN)
            obj[key] = deserializer(buf)
        } catch (error) {
            error.message = `${key}: ${error.message}`
            throw error
        }
    }
    return obj
}

function fixed_buf(b: any, len: number): Buffer | any {
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
