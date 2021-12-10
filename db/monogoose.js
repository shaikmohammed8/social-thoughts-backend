const mongoose = require('mongoose')

mongoose.connect(process.env.databaseUrl, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false

}).then(() => {
    console.log('every thing is fine');
}).catch((err) => {
    console.log(err);
});
