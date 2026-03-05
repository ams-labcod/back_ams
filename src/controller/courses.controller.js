import { pool } from '../config/db.js'

//  ***************************CREAR CURSO**********************************
export const createCourse = async (req, res) => {
  
try {

  const {cou_level, cou_name_teach, cou_num_courses} = req.body;

  if (cou_level === 'PREESCOLAR') {
      cou_num_courses = null;
    }

  const [ExistCourse] = await pool.query('SELECT COU_ID FROM AMS_COURSES WHERE COU_LEVEL = ? AND COU_NAME_TEACH = ? ' , [cou_level, cou_name_teach]);

  if (ExistCourse.length > 0){

    return res.status(400).json({message: 'El curso ya existe'})
  }

  const  [Course] = await pool.query('INSERT INTO AMS_COURSES (COU_LEVEL, COU_NAME_TEACH, COU_NUM_COURSE, COU_STATE) VALUES(?,?,?,?) ', 
    [cou_level, cou_name_teach, cou_num_courses, 'A'])

    const response ={

      content:null,
      status:true,
      message: 'Curso Creado Correctamente'
    }

    const data = {
      data: response
    }

    return res.status(200).json(data)

} catch (error) {

  console.log(error)

  return res.status(500).json({errorMessage: 'Error en el servidor'})
  
}

}

//  ***************************GET A TODOS LOS CURSOS **********************************
export const getAllCourses = async (req, res) => {
  try {
    // Consultamos todos los cursos
    const [courses] = await pool.query('SELECT * FROM AMS_COURSES');

    const response = {
      content: courses,
      status: true,
      message: 'Cursos obtenidos correctamente'
    };

    const data = {
      data: response
    };

    return res.status(200).json(data);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ errorMessage: 'Error en el servidor' });
  }
};

//  ***************************GET A TODOS LOS CURSOS ACTIVOS **********************************
export const getAllCoursesAct = async (req, res) => {
  try {

    const state = 'A';

    // Consultamos todos los cursos
    const [courses] = await pool.query('SELECT * FROM AMS_COURSES WHERE COU_STATE = ? ', [state]);

    const response = {
      content: courses,
      status: true,
      message: 'Cursos activos obtenidos correctamente'
    };

    const data = {
      data: response
    };

    return res.status(200).json(data);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ errorMessage: 'Error en el servidor' });
  }
};

//  ***************************GET BY ID**********************************
export const getCourseById = async (req, res) => {

  const { id_course } = req.params; 

  try {
    // Consultamos el curso específico
    const [course] = await pool.query('SELECT * FROM AMS_COURSES WHERE COU_ID = ?', [id_course]);

    // Validamos si el curso existe
    if (course.length === 0) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    const response = {
      content: course[0], // Devolvemos el primer (y único) objeto, no el arreglo
      status: true,
      message: 'Curso obtenido correctamente'
    };

    const data = {
      data: response
    };

    return res.status(200).json(data);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ errorMessage: 'Error en el servidor' });
  }
};


//  ***************************UPDATE**********************************
export const updateCourse = async (req, res) => {

  try {
  
    const { id } = req.params;
    

    let { cou_level, cou_name_teach, cou_num_courses } = req.body;

    
    if (cou_level === 'PREESCOLAR') {
      cou_num_courses = null;
    }


    const [result] = await pool.query(
      'UPDATE AMS_COURSES SET COU_LEVEL = ?, COU_NAME_TEACH = ?, COU_NUM_COURSE = ? WHERE COU_ID = ?', 
      [cou_level, cou_name_teach, cou_num_courses, id]
    );

  
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'El curso no existe o no se pudo actualizar' });
    }

    const response = {
      content: null,
      status: true,
      message: 'Curso Actualizado Correctamente'
    };

    return res.status(200).json({ data: response });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ errorMessage: 'Error en el servidor al actualizar' });
  }
};



//  ***************************DAR DE BAJA UN CURSO**********************************
export const disableCourse = async (req, res) => {
  try {

    const { id } = req.params;

    const [result] = await pool.query(
      'UPDATE AMS_COURSES SET COU_STATE = ? WHERE COU_ID = ?', 
      ['I', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'El curso no existe' });
    }

    const response = {
      content: null,
      status: true,
      message: 'Curso dado de baja correctamente'
    };

    return res.status(200).json({ data: response });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ errorMessage: 'Error en el servidor al dar de baja' });
  }
};