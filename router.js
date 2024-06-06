const express = require('express');
const router = express.Router()
const mysql = require('mysql');
const path = require('path');


const configMySql = {
    host: 'localhost',
    user: 'cief',
    password: '123456',
    database: 'renting_cars'
    
}

const connMySql = mysql.createConnection(configMySql);
try {
    connMySql.connect();
    console.log('Conectado');
} catch (error) {
    console.log(error);
}


// const jsonData = require('./vehicles.json');


router.get('/', (req, res) => {

    const SELECT = "SELECT * FROM modelos";
    const menuSelect = "SELECT * FROM modelos group by tipo";

    connMySql.query(menuSelect, (err, result) => {
        
        if(err) throw err;
        menuresult = result

        connMySql.query(SELECT, (err, result) => {
            
            if(err) throw err;
            res.render('index', {
                title: 'Alquiler de vehiculos',
                datosVehiculos: result,
                menu: menuresult

            })
            
        })

    })     
    
})

router.get('/stock', (req, res) =>{
   const SELECT = "SELECT id_modelo, nombre_modelo, unidades_totales FROM modelos"

   connMySql.query(SELECT, (err, result) => {
        if(err) throw err;
        res.render('stock', {
            title: 'stock de vehiculos',
            datosVehiculos: result
            
        })
        console.log(result);
   })

})

router.get('/formInsert', (req, res) =>{

    
    res.render('formInsert', {
        title: 'Alquiler de vehiculos'
    })
})

router.get('/reserva', (req, res) =>{
    
    res.render('reserva', {
        title: 'Alquiler de vehiculos'
        
    })
})
router.get('/login', (req, res) =>{
    
    res.render('login', {
        title: 'Crea una cuenta'
        
    })
})
router.get('/identificacion/:modeloid', (req, res) =>{

    const IDMODELO = req.params.modeloid;

    res.render('identificacion', {
        title: 'Alquiler de vehiculos',
        idmodelo: IDMODELO
    })
    
})
router.get('/modelo/:modelo', (req, res) =>{

    // console.log("/coche"); 
    const SELECT = `SELECT * FROM modelos WHERE tipo = '${req.params.modelo}'`;
    const menuSelect = "SELECT * FROM modelos group by tipo";

    connMySql.query(menuSelect, (err, result) => {

        if(err) throw err;
        menuresult = result

     connMySql.query(SELECT, (err, result) => {
        
        if(err) throw err;
        res.render('modelo', {
            title: 'Nuestro modelos de coche',
            datosVehiculos: result,
            menu: menuresult
        })
     }) 
     
    })
})

router.get('/modelo/:modelo/:modeloinfo', (req, res) =>{
    console.log("params", req.params);
    const SELECT = `SELECT * FROM modelos WHERE id_modelo = '${req.params.modeloinfo} '`;
    const menuSelect = "SELECT * FROM modelos group by tipo";

    connMySql.query(menuSelect, (err, result) => {
        if(err) throw err;
        menuresult = result

     connMySql.query(SELECT, (err, result) => {
        
        
        if(err) throw err;
        res.render('info_modelo', {
            title: 'informacion del vehiculo',
            datosVehiculos: result,
            menu: menuresult
        })
        console.log(result);
       

     })  
    })
  
})

router.post('/verificacion', (req, res) =>{
    
    const { dni, id } = req.body;
    const SELECTCOCHE = `SELECT * FROM modelos WHERE id_modelo = ${id}`;
    
    connMySql.query(SELECTCOCHE, (err, cocheResult) => {
        if (err) throw err;
        
        const SELECT = `SELECT * FROM clientes WHERE dni = ${dni}`;
        connMySql.query(SELECT, (err, clienteResult) => {
            if (err) throw err;
    
            if (clienteResult.length !== 0) {
                res.render('reserva', {
                    title: 'Reserva a estos precios',
                    datosCliente: clienteResult,
                    datosCoche: cocheResult // Aquí convertimos el objeto en un array
                });
            } else {
                res.redirect('login');
            }
        });
    });     
})
   
router.post('/insert', (req, res) => {
    
    const {nombre, personas, puertas, cambio, maletas, tipo, precio } = req.body;
   
    const INSERT = `INSERT INTO modelos (nombre_modelo, personas, puertas, cambio, maletas, tipo, precioDia) VALUES ('${nombre}', ${personas}, ${puertas}, '${cambio}', ${maletas}, '${tipo}', ${precio})`;

    connMySql.query(INSERT, (err, result) => {
        if(err) throw err;
        res.redirect('/')
    })
    
    
})

router.post('/update', (req, res) => {
 const {id, stock} = req.body;
 const UPDATE = `UPDATE modelos SET unidades_totales = ${stock} WHERE id_modelo = ${id}`

     connMySql.query(UPDATE, (err, result) => {
        if(err) throw err;
        res.redirect('/')
    })

})
router.post('/insertAlquiler', (req, res) => {

    const {fechaI, fechaD, resultado} = req.body;
    const DIFF = `SELECT DATEDIFF(Day, ${fechaD}, ${fechaI})`
    // console.log(DIFF);

    connMySql.query(DIFF, (err, result) => {
        if(err) throw err;
        res.redirect('/')
    })
})


module.exports = router;