const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const {promisify} = require('util');
const connection = require('../database/db');



//procedimiento para registrarnos
exports.register = async (req, res)=>{
    try {
        const name = req.body.name;
        const email = req.body.email;
        const user = req.body.user;
        const pass = req.body.pass;
        const cliente = req.body.cliente;
        let passHash = await bcryptjs.hash(pass, 8);
        if(name == ""||email == ""||user == ""||pass == "" || !email.includes("@")|| cliente == ""){
            return res.status(401).json({status: false, message:"Campos sin informacion", data:[req.body]}); 
        }else{
            connection.query('INSERT INTO users (full_name,email,idclients,pass,user,idrol) values (?,?,?,?,?,?) ',[name , email, cliente , passHash,user, 1], async (error, result)=>{
                if(error){
                    console.log(error);
                    res.status(401).json({status: false, message:"El Usuario ya fue creado", data:[req.body]})
                
                }else{
                    const id = result.insertId;
                    const token = jwt.sign({id:id}, process.env.JWT_SECRETO, {expiresIn: process.env.JWT_TIEMPO_EXPIRA})
                    return res.status(200).json({status: true, message:"OK", data:[result,token]}) 
                }
                
            })
            
        }   
    } catch (error) {
        console.log(error)
    }       
}

//login
exports.login = async (req, res)=>{
        
    try {
        const user = req.body.user;
        const pass = req.body.pass;
        if(!user || !pass ){
             res.status(401).json({status: false, message:"Campos sin informacion", data:[req.body]});
        }else{
                connection.query('SELECT * FROM users WHERE user = (?)', [user], async (error, results)=>{
                if(error){
                    console.log(err);
                }
                if( results.length == 0 || ! (await bcryptjs.compare(pass, results[0].pass)) ){
                    res.status(401).json({status: false, message:"Usuario y contraseña no coinciden", data:[req.body]});
                }else{
                    //inicio de sesión OK
                    const id = results[0].idusers
                    //console.log(results);
                    const token = jwt.sign({id:id}, process.env.JWT_SECRETO, {
                        expiresIn: process.env.JWT_TIEMPO_EXPIRA
                    })
                    let { user, idrol, idclients } = results[0];
                    const info = { user: user, idrol: idrol, idclients: idclients }
                    await res.status(200).json({status: true, message:"OK", data:[info,token]});
                   
                }
            })
        }
        
    } catch (error) {
        console.log(error);
        
    }
        

        
        
}
        
    

// procedimiento  para autenticar usuario
exports.isAuthenticated = async (req, res, next)=>{
    let token = req.headers['x-access-token'] || req.headers['authorization'];
     if (!token) {
        res.status('401').send("Es necesario un token de autenticacion")
    }
    if(token){
        try {
            token = token.slice(7,token.length)
            const decodificada = await promisify(jwt.verify)(token, process.env.JWT_SECRETO)
            connection.query('SELECT * FROM users WHERE id = ?', [decodificada.id], (error, results)=>{
                if(!results){return next()}
                req.user = results[0]
                return next()
            })
        } catch (error) {
            console.log(error)
            return next()
        }
    }
}



