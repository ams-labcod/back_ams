import {pool} from '../config/db.js'

import {request,response} from 'express'


export const createPeriod = async (req = request,res = response ) => {

try {

  const {per_name,per_date_ini, per_date_fin} = req.body  

  const [data] = await pool.query('INSERT INTO AMS_PERIOD (per_id,per_name, per_date_ini, per_date_fin) VALUES (UUID(),?,?,?)', 
    [per_name, per_date_ini, per_date_fin]
  )

   const response = {
        content : null,
        status : true,
        message: 'Periodo creado correctamente'
    }

    return res.status(200).json({data : response})
    
} catch (error) {

    console.log(error.message)

    return res.status(500).json({errorMessage: 'Error en el servidor'})
    
}

}