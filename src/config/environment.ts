import 'dotenv/config'

const CONFIG = {
  db: process.env.DB,
  jwt_public: `${process.env.secret_public}`,
  jwt_private: `${process.env.secret_private}`
}

export default CONFIG
