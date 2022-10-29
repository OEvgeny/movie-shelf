import cors from 'cors'

export default fromNodeMiddleware(cors((origin, cb) => cb(null, { origin, credentials: true })))
