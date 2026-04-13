import { pool } from '../config/db.js'

import { request, response } from 'express'

//* -> VERIFICA SI EN LA TABLA ES AI 
export const createPeriod = async (req = request, res = response) => {

  try {

    const { per_name, per_date_ini, per_date_fin } = req.body

    const [data] = await pool.query('INSERT INTO AMS_PERIOD (per_name, per_date_ini, per_date_fin) VALUES (?,?,?)',
      [per_name, per_date_ini, per_date_fin]
    )

    const response = {
      content: null,
      status: true,
      message: 'Periodo creado correctamente'
    }

    return res.status(200).json({ data: response })

  } catch (error) {

    console.error(error)

    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: error.message
    })

  }

}

//* TODOS LOS PERIODOS
export const getAllPeriod = async (req, res) => {

  const [data] = await pool.query('SELECT * FROM AMS_PERIOD')

  if (data.length === 0) return res.status(404).json({ errorMessage: 'No hay periodos creados' })

  const result = {
    content: data,
    status: true,
    message: 'Lista de todos los periodos'
  }

  const Data = {
    data: data
  }

  return res.status(200).json(Data)

}


//* ACTUALIZAR PERIODO
export const updatePeriod = async (req = request, res = response) => {

  try {

    const { id } = req.params
    const { per_name, per_date_ini, per_date_fin } = req.body

    const [result] = await pool.query(
      `UPDATE AMS_PERIOD 
       SET per_name = ?, per_date_ini = ?, per_date_fin = ?
       WHERE per_id = ?`,
      [per_name, per_date_ini, per_date_fin, id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: false,
        message: 'Periodo no encontrado'
      })
    }

    return res.status(200).json({
      status: true,
      message: 'Periodo actualizado correctamente'
    })

  } catch (error) {

    console.error(error)

    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: error.message
    })

  }

}