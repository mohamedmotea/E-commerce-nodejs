import express from 'express'
import { config } from 'dotenv'
config({path:'./config/dev.config.env'})
import initiateApp from './src/initiate-app.js'

const app = express()
initiateApp(app,express)
