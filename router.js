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
    // console.log('Conectado');
} catch (error) {
    // console.log(error);
}


// const jsonData = require('./vehicles.json');


router.get('/', (req, res) => {

    const SELECT = `SELECT nombre_modelo,unidades_totales, unidades_alquiladas,
        count(al.id_modelo) * (md.precioDia) AS facturacionTotal
     FROM modelos md
     INNER JOIN alquileres al ON al.id_modelo = md.id_modelo
     GROUP BY md.id_modelo, nombre_modelo, unidades_totales, unidades_alquiladas;`;
    const menuSelect = "SELECT *FROM modelos group by tipo";

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
        // console.log(result);
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
router.get('/register', (req, res) =>{
    
    
    res.render('register', {
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

    // // console.log("/coche"); 
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
    // console.log("params", req.params);
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
        // console.log(result);
       

     })  
    })
  
})

router.post('/verificacion', (req, res) =>{
    
    const { dni, id_modelo } = req.body;
    const SELECTCOCHE = `SELECT * FROM modelos WHERE id_modelo = ${id_modelo}`;
    
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
                res.render('/register')
                
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

    const {id_cliente, id_modelo, fecha_recogida, fecha_entrega, precioTotal} = req.body;
    // console.log("Esto es el body4", req.body);

    const INSERT = `INSERT INTO alquileres (id_cliente, id_modelo, fecha_recogida, fecha_entrega, facturacion) 
        VALUES (${id_cliente}, ${id_modelo}, '${fecha_recogida}', '${fecha_entrega}', ${precioTotal})`;
        console.log(INSERT);

    connMySql.query(INSERT, (err, result) => {
        if(err) throw err;
    
        res.redirect('/login')
    })
    
})

router.post("/disponible", (req, res) => {
    const {fechaI, fechaD, id_modelo, id_cliente} = req.body; 
    
    
    const disponible = `SELECT md.unidades_totales - 
                            (SELECT COUNT(*) 
                            FROM alquileres 
                            WHERE id_modelo = ${id_modelo}) AS disponible
                        FROM modelos md 
                        WHERE md.id_modelo = ${id_modelo};`

    const total = `SELECT DISTINCT md.id_modelo, md.nombre_modelo, 
                        '${fechaI}' AS fecha_recogida,
                        '${fechaD}' AS fecha_entrega,
                        precioDia * (DATEDIFF('${fechaD}', '${fechaI}')+1) AS precioTotal 

                        from clientes cl 
                        INNER JOIN alquileres al ON cl.id_cliente = al.id_cliente
                        INNER JOIN modelos md ON al.id_modelo = md.id_modelo
                        WHERE  md.id_modelo = ${id_modelo}
                        `

    const cliente = `SELECT * FROM clientes WHERE id_cliente = ${id_cliente}`
    console.log(disponible);
    console.log(total);


    connMySql.query(cliente, (err, resCli) => {
        if (err) throw err;
        // // console.log(res);
       infocliente = resCli

        connMySql.query(disponible, (err, resDisp) => {
            if (err) throw err;
            // // console.log(res);

            if (resDisp[0].disponible !== 0){   

                connMySql.query(total, (err, resTotal) => {
                    if (err) throw err;

                        res.render('factura', {
                        title: 'factura',
                        datosFac: resTotal,
                        datosCliente: infocliente
                    
                    })
                    
                    
                })
            } else{
                res.render('no_disponible', {
                    title: 'no_disponible'
                })
            }
        })
    })
})

router.post("/insertUsuario", (req, res) => {

    const {nombre, apellido, dni, email, tel, poblacion, password} = req.body;
    console.log(req.body);

    const INSERT = `INSERT INTO clientes (nombre, apellido, dni, tel, email, poblacio, password) VALUES ('${nombre}', '${apellido}', '${dni}', '${tel}', '${email}', '${poblacion}', '${password}')`;
    console.log(INSERT);

    connMySql.query(INSERT, (err, result) => {
        if(err) throw err;

        res.redirect('/')
    })
})
module.exports = router;