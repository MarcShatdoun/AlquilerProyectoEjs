const express = require('express');
const bodyParser = require('body-parser');
const app = express();



//importando las rutas
const router = require('./router');


const PORTPUBLIC = 3000;
const PORTPRIVATE = 4000;

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));
app.use(router);

app.use((req, res, next) => {
    res.status(404).render('notfound404')
})




app.listen(PORTPUBLIC, () => { 
    console.log(`Server public running on port http://localhost:${PORTPUBLIC}`) 
})