const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { promisify } = require('util');
const mysql = require('mysql2/promise');
const connection = require('../database/db');
const { log } = require('console');
const nodemailer = require('nodemailer');
const generateEmailHtml = require('../utils/generateHtml');
const generateEmailHtml2 = require('../utils/generateHtml2');




//procedimiento para registrarnos
exports.register = async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const user = req.body.user;
        const pass = req.body.pass;
        const cliente = req.body.cliente;
        let passHash = await bcryptjs.hash(pass, 8);
        if (name == "" || email == "" || user == "" || pass == "" || !email.includes("@") || cliente == "") {
            return res.status(401).json({ status: false, message: "Campos sin informacion", data: [req.body] });
        } else {
            connection.query('INSERT INTO users (full_name,email,idclients,pass,user,idrol) values (?,?,?,?,?,?) ', [name, email, cliente, passHash, user, 1], async (error, result) => {
                if (error) {
                    console.log(error);
                    res.status(401).json({ status: false, message: "El Usuario ya fue creado", data: [req.body] })

                } else {
                    const id = result.insertId;
                    const token = jwt.sign({ id: id }, process.env.JWT_SECRETO, { expiresIn: process.env.JWT_TIEMPO_EXPIRA })
                    return res.status(200).json({ status: true, message: "OK", data: [result, token] })
                }

            })

        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "Error Del Sistema", data: [req.body] });
    }
}

//login
exports.login = async (req, res) => {

    try {
        const user = req.body.user;
        const pass = req.body.pass;
        if (!user || !pass) {
            return res.status(401).json({ status: false, message: "Campos sin informacion", data: [req.body] });
        } else {
            connection.query('SELECT * FROM users WHERE user = (?)', [user], async (error, results) => {
                if (error) {
                    console.log(error);
                }
                if (results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))) {

                    return res.status(401).json({ status: false, message: "Usuario y contraseña no coinciden", data: [req.body] });
                } else {
                    //inicio de sesión OK
                    const id = results[0].idusers
                    //console.log(results);
                    const token = jwt.sign({ id: id }, process.env.JWT_SECRETO, {
                        expiresIn: process.env.JWT_TIEMPO_EXPIRA
                    })
                    let { user, idrol, idclients } = results[0];
                    const info = { user: user, idrol: idrol, idclients: idclients }
                    return res.status(200).json({ status: true, message: "OK", data: [info, token] });

                }
            })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: error.message, data: [req.body] });

    }

}

// procedimiento  para autenticar token
exports.isAuthenticated = async (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    if (!token) {
        return res.status(401).send("Es necesario un token de autenticacion")
    }
    if (token) {
        try {
            token = token.slice(7, token.length)
            const decodificada = await promisify(jwt.verify)(token, process.env.JWT_SECRETO)
            const results = connection.query('SELECT * FROM users WHERE idusers = ?', [decodificada.id]);

            if (!results) {
                return res.status(401).json({ status: false, message: "Usuario no encontrado", data: [req.body] });
            } else {
                return next()
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, message: error.message, data: [req.body] });
        }
    }
}
exports.getEmail = async (req, res, next) => {
    try {
        let [result] = await connection.promise().query("select * from clientes where fecha = CURDATE()-5")

        for (let index = 0; index < result.length; index++) {

            const element = result[index];
            let response = sendEmail(element.email, element.idclientes)

        }

        return res.status(200).json({ status: true, message: "OK", data: [result] });

    } catch (error) {
        return res.status(200).json({ status: false, message: "error", data: [error.message] });
    }
}

/**Enviar segundo correo */
exports.sendSecondEmail = async (req, res, next) => {

    try {

        const id = req.params.id;
        sendsecondEmail(id)
        let [result] = await connection.promise().query('UPDATE clientes SET renovacion = 1 where idclientes = ?', [id])
        return res.status(200).json({ status: true, message: "Envio de segundo correo", data: [id] });



    } catch (error) {
        return res.status(200).json({ status: false, message: "error", data: [error.message] });
    }



}
exports.getname = async (req, res, next) => {

    try {

        const id = req.body.idclientes;
    
        let [result] = await connection.promise().query('select Nombre from clientes where idclientes = ?', [id]);
        console.log(result);
        console.log(id);
          
        
        
        return res.status(200).json({ status: true, message: "envio exitoso", data: result, id:id });



    } catch (error) {
        return res.status(500).json({ status: false, message: "error", data: [error.message] });
    }

}

sendEmail = async (email, id) => {

    /**configurar gmail */
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'tbwjuancho01@hotmail.com',
            pass: 'JAMC5695259'
        }
    });

    let mailOptions = {
        from: 'kvillalbanino@gmail.com',
        to: email,
        subject: 'Correo de prueba con HTML',
        html: generateEmailHtml(id)
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            return {
                message: error
            };
        } else {
            console.log('Correo electrónico enviado: ' + info.response);
            return info
        }
    });
}

sendsecondEmail = async (id) => {

    /**configurar gmail */
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'kevinazul999@gmail.com',
            pass: 'efpcvhxhsrxsrqns'
        }
    });

    let mailOptions = {
        from: 'second@gmail.com',
        to: "kevinazul9999@gmail.com",
        subject: 'Segundo correo',
        html: generateEmailHtml2(id)
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            return {
                message: error
            };
        } else {
            console.log('Correo electrónico enviado: ' + info.response);
            return info
        }
    });
}



