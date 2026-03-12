import { request, response } from 'express'

import { pool } from '../config/db.js'

export const createEvaluationType = async (req = request, res = response) => {

    const { eva_tp_name } = req.body

    try {
        const [create] = await pool.query('INSERT INTO AMS_EVALUATION_TYPE (eva_tp_name,eva_tp_state) VALUES (?,?)', [eva_tp_name, 'A'])

        const response = {

            content: null,
            status: true,
            message: 'Tipo Actividad Creada Correctamente'
        }

        const data = {
            data: response
        }

        return res.status(200).json(data)

    } catch (error) {

        console.error(error)

        return res.status(500).json({
            status: false,
            message: 'Error interno del servidor',
            error: error.message
        })

    }
}


export const getAllEvaluationType = async (req, res) => {
  try {
    
    const [evaluationType] = await pool.query('SELECT * FROM AMS_EVALUATION_TYPE');

    const response = {
      content: evaluationType,
      status: true,
      message: 'Tipos de evaluaciones obtenidas correctamente'
    };

    const data = {
      data: response
    };

    return res.status(200).json(data);

  } catch (error) {
    
    console.error(error)

    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: error.message
    })
  }
};