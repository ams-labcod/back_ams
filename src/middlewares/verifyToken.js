import '../utils/env.js'

import  Jwt  from "jsonwebtoken";

import {response, request} from 'express'

//-- verificamos el token y la firma
export const verifyJwt =  (req = request, res = response, next) =>{

    const token = req.header('Authorization')

    //-- accedemos a la cookie
    //const cookieToken = req.cookies.token
  
    if(!token) return res.status(401).json({errorMessage:'Usuario no autorizado'})

    try {

        const decoded = Jwt.verify(token, process.env.JWT_SECRET);


        //-- guardamos el usuario
          req.user = decoded
        
        //-- pasa al siguiente

        next();

    } catch (error) {

        console.log(error)

        res.status(401).json({Message: 'Token no valido'})

        
    }
}