const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://sam:linuxlomas@m123-rs1.jxomq.mongodb.net/?retryWrites=true&w=majority";
const { scrapWether } = require("./scrap");

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  const scrapDate = new Date().toISOString().substring(0, 10);
  try {
    await client.connect();
    const db = client.db("test");
    const places = await db.collection("places").find({}).toArray();
    for (const place of places) {
      const wether = await scrapWether(place.windguruId);

      const minDate = wether[0].date;
      const maxDate = wether[wether.length - 1].date;

      await db.collection("wether").deleteMany({
        "place._id": place._id,
        date: {
          $gte: minDate,
          $lte: maxDate,
        },
      });

      // await db.collection('wether').updateMany({
      //     'place._id': place._id,
      //     date: {
      //         $gte: minDate,
      //         $lte: maxDate
      //     }
      // }, { $set: { old: true }});

      const docs = wether.map((w) => ({
        ...w,
        place,
        scrapDate,
        old: false,
      }));

      await db.collection("wether").insertMany(docs);
    }

    console.log("FIN");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

// scrapWether(198474).then(console.log);
