const express = require("express")
const mysql= require("mysql2")
var bodyParser=require('body-parser')
var app=express()

// Variable para saber si la BD está conectada
let dbConnected = false;
let con = null;

// Intentar conectar a la base de datos (opcional)
if (process.env.DATABASE_URL || process.env.DB_HOST) {
    con = mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || '5IV8',
        port: process.env.DB_PORT || 3306
    });
    
    con.connect((err) => {
        if (err) {
            console.error('⚠️ No se pudo conectar a la base de datos:', err.message);
            console.log('✅ La aplicación seguirá funcionando sin base de datos');
            dbConnected = false;
        } else {
            console.log('✅ Conectado a la base de datos');
            dbConnected = true;
        }
    });
} else {
    console.log('⚠️ No hay configuración de base de datos');
    console.log('✅ La aplicación funcionará sin base de datos');
}


app.use(bodyParser.json())


app.use(bodyParser.urlencoded({
    extended:true
}))
app.use(express.static('prueba'))

app.post('/agregarUsuario',(req,res)=>{
        let nombre=req.body.nombre
        let id=req.body.id

        if (!dbConnected || !con) {
            return res.status(503).send(`<h1>Base de datos no disponible</h1><p>Nombre que intentaste agregar: ${nombre}</p>`);
        }

        con.query('INSERT INTO usuario (id_usuario, nombre) VALUES (?, ?)', [id, nombre], (err, respuesta, fields) => {
            if (err) {
                console.log("Error al conectar", err);
                return res.status(500).send("Error al conectar");
            }
           
            return res.send(`<h1>Nombre:</h1> ${nombre}`);
        });
   
})

// Usar el puerto de Render o 10000 por defecto
const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=>{
    console.log(`Servidor escuchando en el puerto ${PORT}`)
})

//fun consultar


app.get('/obtenerUsuario',(req,res)=>{
    if (!dbConnected || !con) {
        return res.status(503).send('<h1>Base de datos no disponible</h1><p>No se pueden obtener usuarios</p>');
    }

    con.query('select * from usuario', (err,respuesta, fields)=>{
        if(err)return console.log('ERROR: ', err);
        var userHTML=``;
        var i=0;

        respuesta.forEach(user => {
            i++;
            userHTML+= `<tr><td>${i}</td><td>${user.nombre}</td></tr>`;


        });

        return res.send(`<table>
                <tr>
                    <th>id</th>
                    <th>Nombre:</th>
                <tr>
                ${userHTML}
                </table>`
        );


    });
});

app.post('/borrarUsuario', (req, res) => {
    const id = req.body.id; // El ID del usuario a eliminar viene en el cuerpo de la solicitud
    console.log("hola")

    if (!dbConnected || !con) {
        return res.status(503).send('<h1>Base de datos no disponible</h1><p>No se puede borrar el usuario</p>');
    }

    con.query('DELETE FROM usuario WHERE id_usuario = ?', [id], (err, resultado, fields) => {

        if (err) {
            console.error('Error al borrar el usuario:', err);
            return res.status(500).send("Error al borrar el usuario");
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).send("Usuario no encontrado");
        }
        return res.send(`Usuario con ID ${id} borrado correctamente`);
    });
});