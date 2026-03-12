import { pool } from '../config/db.js'

// ***************************GET A TODOS LOS CURSOS **********************************
export const getAllTeachers = async (req, res) => {
  try {
    // Consultamos todos los cursos
    const [teacher] = await pool.query('SELECT * FROM AMS_TEACHERS');

    const response = {
      content: teacher,
      status: true,
      message: 'Profesores obtenidos correctamente'
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