# TSP parse engine

## Install

1. Install dependencies```$ npm install```
2. Launch MongoDB
3. Seed regprocess collection (see below)
3. Run program with defaults params (env vars) ```$ npm start```

## Launch

  ### Live mode
  CHANNEL=hackerloop CURRENT_SET=1 MONGODB_URL=mongodb://localhost:3001/meteor node main.js

  ### Test mode
  Find a channel that have a big traffic and message
  TESTMODE=true CHANNEL=imaqtpie CURRENT_SET=1 MONGODB_URL=mongodb://localhost:3001/meteor node main.js

## Seed regprocess collection

```
db.regprocess.insert([
{
  "_id": ObjectId("59c3c180608b9f246b2302a1"),
  "regex": "^(w|s|d|a|j|k)$",
  "insensitive": true,
  "recursive": true,
  "type": "record",
  "storage": "record",
  "set": "1"
},

{
  "_id": ObjectId("59c3c18e608b9f246b2302a2"),
  "regex": "^(fart|prout)$",
  "insensitive": true,
  "recursive": true,
  "type": "vote",
  "storage": "vote",
  "set": "1"
}
])
```
