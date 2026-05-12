import { pool } from '../config/db.js'


export const createSubject = async (req, res) => {

  try {

    const { cou_id, tea_peo_id, cos_subject_name } = req.body

    const [validateSubjet] = await pool.query('SELECT COU_ID FROM AMS_COURSE_SUBJECT WHERE COU_ID AND COS_SUBJECT_NAME = ?',
      [cou_id, cos_subject_name]
    )

    if (validateSubjet.length > 0) {

      return res.status(400).json({ message: 'La materia ya fue registrada en este curso' })
    }

    const [result] = await pool.query('INSERT INTO AMS_COURSE_SUBJECT (COU_ID, TEA_PEO_ID, COS_SUBJECT_NAME, COS_STATE) VALUES (?,?,?,?) ',
      [cou_id, tea_peo_id, cos_subject_name, 'A']
    )

    const response = {
      content: null,
      status: true,
      message: 'Materia registrada correctamente'
    }

    return res.status(200).json({ data: response })

  } catch (error) {

    // Manejo de error de llave foránea (Si el curso o el profe no existen)
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ errorMessage: 'El ID del curso o del profesor no existe' });
    }

    console.error(error)

    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: error.message
    })

  }

}


// Obtener todas las materias
// TODO => TRAER EL NOMBRE DEL PROFESOR - EL NUMERO DEL CURSO (JOIN)
export const getAllCourseSubjects = async (req, res) => {
  try {
    const [subjects] = await pool.query('SELECT * FROM AMS_COURSE_SUBJECT');

    return res.status(200).json({
      data: {
        content: subjects,
        status: true,
        message: 'Materias obtenidas correctamente'
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errorMessage: 'Error en el servidor' });
  }
};

// Obtener una materia por ID
export const getCourseSubjectById = async (req, res) => {
  const { id } = req.params;

  try {
    const [subject] = await pool.query('SELECT * FROM AMS_COURSE_SUBJECT WHERE COS_ID = ?', [id]);

    if (subject.length === 0) {
      return res.status(404).json({ message: 'Materia no encontrada' });
    }

    return res.status(200).json({
      data: {
        content: subject[0],
        status: true,
        message: 'Materia obtenida correctamente'
      }
    });
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: error.message
    })
  }
};


// Actualizar una materia
export const updateCourseSubject = async (req, res) => {
  try {

    const { id } = req.params;
    
    const { cou_id, tea_peo_id, cos_subject_name } = req.body;

    if (!cou_id || !tea_peo_id || !cos_subject_name) {
      return res.status(400).json({ 
        message: 'Faltan datos obligatorios. Debes enviar el ID DEL CURSO, el ID DEL PROFESOR y el NOMBRE DE LA ASIGNATURA.' 
      });
    }

    const [result] = await pool.query(
      'UPDATE AMS_COURSE_SUBJECT SET COU_ID = ?, TEA_PEO_ID = ?, COS_SUBJECT_NAME = ? WHERE COS_ID = ?',
      [cou_id, tea_peo_id, cos_subject_name, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'La materia no existe o no se pudo actualizar' });
    }

    return res.status(200).json({
      data: {
        content: null,
        status: true,
        message: 'Materia actualizada correctamente'
      }
    });

  } catch (error) {

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ errorMessage: 'El ID del curso o del profesor no existe' });
    }
    console.error(error)

    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: error.message
    })
  }
};


// Dar de baja (Soft Delete)
export const disableCourseSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'UPDATE AMS_COURSE_SUBJECT SET COS_STATE = ? WHERE COS_ID = ?',
      ['I', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'La materia no existe' });
    }

    return res.status(200).json({
      data: {
        content: null,
        status: true,
        message: 'Materia dada de baja correctamente'
      }
    });

  } catch (error) {
    console.error(error)

        return res.status(500).json({
            status: false,
            message: 'Error interno del servidor',
            error: error.message
        })
  }
};

//* ACtivar materia
export const enableCourseSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'UPDATE AMS_COURSE_SUBJECT SET COS_STATE = ? WHERE COS_ID = ?',
      ['A', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'La materia no existe' });
    }

    return res.status(200).json({
      data: {
        content: null,
        status: true,
        message: 'Materia activada correctamente'
      }
    });

  } catch (error) {
    console.error(error)

        return res.status(500).json({
            status: false,
            message: 'Error interno del servidor',
            error: error.message
        })
  }
};