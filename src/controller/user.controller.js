import { pool } from '../config/db.js'
import { salt } from '../utils/salt.js'
import bcrypt from 'bcrypt'
import { generateJwt } from '../helpers/generate-jwt.js'

export const create_person = async (req, res) => {

  const {
    usu_name1,
    usu_name2,
    usu_lastname1,
    usu_lastname2,
    usu_tp_person,
    usu_tp_id,
    usu_identification,
    usu_level,
    usu_tp_reg,
    usu_grade,
    usu_grade_l,
    usu_sex,
    usu_birth,
    usu_place_birth,
    usu_cel,
    usu_correo,
    usu_city,
    usu_departament,
    usu_address,
    usu_eps,
    usu_population,
    usu_prev_school,
    usu_allergies,
    usu_condition,
    cou_id
  } = req.body;

  let connection;

  try {

    // 1️⃣ Obtener conexión
    connection = await pool.getConnection();

    // 2️⃣ Iniciar transacción
    await connection.beginTransaction();

    // 3️⃣ Validar identificación existente
    const [exists] = await connection.query(
      'SELECT 1 FROM AMS_PEOPLE WHERE PEO_IDENTIFICATION = ? LIMIT 1',
      [usu_identification]
    );

    if (exists.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        status: false,
        message: 'Ya existe una persona registrada con esta identificación'
      });
    }

    // 4️⃣ Insert PERSONA
    await connection.query(
      'INSERT INTO AMS_PEOPLE (PEO_ID, PEO_NAME_1, PEO_NAME_2, PEO_LAST_NAME_1, PEO_LAST_NAME_2, PEO_TP_PERSON, PEO_TP_ID, PEO_IDENTIFICATION, PEO_LEVEL, PEO_TP_REG, PEO_GRADE, PEO_GRADE_L, PEO_SEX, PEO_BIRTH, PEO_PLACE_BIRTH, PEO_CEL, PEO_EMAIL, PEO_CITY, PEO_DEPARTAMENT, PEO_ADDRESS, PEO_EPS, PEO_POPULATION, PEO_PREV_SCHOOL, PEO_ALLERGIES, PEO_CONDITION, PEO_TYPE, PEO_STATE) VALUES (UUID(),?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        usu_name1,
        usu_name2,
        usu_lastname1,
        usu_lastname2,
        usu_tp_person,
        usu_tp_id,
        usu_identification,
        usu_level,
        usu_tp_reg,
        usu_grade,
        usu_grade_l,
        usu_sex,
        usu_birth,
        usu_place_birth,
        usu_cel,
        usu_correo,
        usu_city,
        usu_departament,
        usu_address,
        usu_eps,
        usu_population,
        usu_prev_school,
        usu_allergies,
        usu_condition,
        'A',
        'A'
      ]
    );

    // 5️⃣ Obtener PEO_ID
    const [rows] = await connection.query(
      'SELECT PEO_ID FROM AMS_PEOPLE WHERE PEO_IDENTIFICATION = ? LIMIT 1',
      [usu_identification]
    );

    const peoId = rows[0].PEO_ID;

    // 6️⃣ Crear usuario si aplica
    const tipoPersona = usu_tp_person?.trim().toUpperCase();

    if (tipoPersona === 'ESTUDIANTE' || tipoPersona === 'DOCENTE' || tipoPersona === 'ADMINISTRATIVO') {

      let role = null;
      // const role = tipoPersona === 'ESTUDIANTE'
      //   ? 'ROL_STUDENT'
      //   : 'ROL_TEACHER';
      if (tipoPersona === 'ESTUDIANTE') {
        role = 'ROL_STUDENT';
      } else if (tipoPersona === 'DOCENTE') {
        role = 'ROL_TEACHER';
      } else if (tipoPersona === 'ADMINISTRATIVO') {
        role = 'ROL_ADMINISTRATIVO';
      }

      const hashPassword = await bcrypt.hash(usu_identification, salt);

      await connection.query(
        'INSERT INTO AMS_USERS (USU_ID, USU_USER, USU_PASSWORD, USU_ROLE, USU_PEO_ID) VALUES (UUID(), ?, ?, ?, ?)',
        [
          usu_identification,
          hashPassword,
          role,
          peoId
        ]
      );

      // 7️⃣ DOCENTE
      if (tipoPersona === 'DOCENTE') {
        await connection.query(
          'INSERT INTO AMS_TEACHERS (TEA_PEO_ID, TEA_NAME,TEA_LAST_NAME, TEA_IDENTIFICATION, TEA_THEME, TEA_GROUP_DIR, TEA_STATE) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            peoId,
            usu_name1,
            usu_lastname1,
            usu_identification,
            '',
            usu_grade,
            'A'
          ]
        );
      }

      // 8️⃣ ESTUDIANTE
      if (tipoPersona === 'ESTUDIANTE') {
        await connection.query(
          'INSERT INTO AMS_ESTUDENTS (EST_ID, EST_NAME, EST_LAST_NAME,EST_IDENTIFICATION,EST_GROUP, EST_PEO_ID, COU_ID) VALUES (UUID(), ?, ?,?, ?, ?, ?)',
          [usu_name1,
            usu_lastname1,
            usu_identification,
            usu_grade,
            peoId,
            cou_id || null // -> Se le asigna un curso a un estudiante
          ]
        );
      }
    }


    // 9️⃣ Confirmar transacción
    await connection.commit();

    return res.status(201).json({
      status: true,
      message: 'Persona registrada correctamente'
    });

  } catch (error) {
    if (connection) await connection.rollback();

    console.error('❌ ERROR CREATE_PERSON');

    console.error(error)

    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: error.message
    })

  } finally {
    if (connection) connection.release();
  }
};



export const login = async (req, res) => {

  const { usu_user, usu_password } = req.body;

  try {

    //verificamos si existe el correo
    // const [data] = await pool.query('SELECT  p.PEO_ID, p.PEO_IDENTIFICATION, p.PEO_NAME_1, p.PEO_LAST_NAME_1, p.PEO_EMAIL,p.PEO_STATE,u.USU_PASSWORD AS usu_password, u.USU_ROLE AS usu_role FROM AMS_PEOPLE p INNER JOIN AMS_USERS u ON u.USU_PEO_ID = p.PEO_ID WHERE p.PEO_IDENTIFICATION = ? LIMIT 1 ', [usu_user])
    const [data] = await pool.query(
      `SELECT 
        p.PEO_ID, 
        p.PEO_IDENTIFICATION, 
        p.PEO_NAME_1, 
        p.PEO_LAST_NAME_1, 
        p.PEO_EMAIL,
        p.PEO_STATE,
        u.USU_PASSWORD AS usu_password, 
        u.USU_ROLE AS usu_role,
        t.TEA_PEO_ID -- Sacamos el ID del profesor (será null si es estudiante/admin)
      FROM AMS_PEOPLE p 
      INNER JOIN AMS_USERS u ON u.USU_PEO_ID = p.PEO_ID 
      LEFT JOIN AMS_TEACHERS t ON t.TEA_PEO_ID = p.PEO_ID 
      WHERE p.PEO_IDENTIFICATION = ? LIMIT 1`,
      [usu_user]
    );

    //si el correo no existe
    if (data.length === 0) return res.status(404).json({ Message: 'Identificación incorrecta o no existe en el sistema' })

    //verificar si el usuario esta activo
    const [checkState] = await pool.query('SELECT PEO_STATE FROM AMS_PEOPLE WHERE PEO_IDENTIFICATION = ? ', [usu_user])

    //Validamos el estado
    const state = checkState[0].PEO_STATE

    if (state === 'I') return res.status(401).json({ Message: 'Usuario inactivo' })
    // const user = data[0];
    // almanecenamos la password de la bd
    const storedcontrasena = data[0].usu_password;

    //comparmos contraseñas- usu_password,
    const passwordPlano = String(usu_password).trim();
    const passwordHash = String(storedcontrasena).trim();
    // const checkPassword = await bcrypt.compare( usu_password, storedcontrasena);
    const checkPassword = await bcrypt.compare(
      passwordPlano,
      passwordHash
    );
    //sino coinciden
    if (!checkPassword) return res.status(401).json({ Message: 'Password incorrecta - password' })
    console.log(checkPassword)

    const peoId = data[0].PEO_ID
    const usu_identification = data[0].PEO_IDENTIFICATION
    const usu_name1 = data[0].PEO_NAME_1
    const usu_lastname1 = data[0].PEO_LAST_NAME_1
    const usu_correo = data[0].PEO_EMAIL
    const usu_role = data[0].usu_role
    const usu_state = data[0].PEO_STATE
    const tea_peo_id = data[0].TEA_PEO_ID || null

    //-- generamos el jwt
    const token = await generateJwt(peoId, usu_identification, usu_name1, usu_lastname1, usu_correo, usu_role, usu_state, tea_peo_id)
    console.log('Token generado:', token)
    const response = {
      content: {
        token
      },
      status: true,
      message: 'Usuario logueado correctamente'
    }
    const Data = {
      data: response
    }

    return res.status(200).json(Data)

  } catch (error) {

    console.error(error)

    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: error.message
    })

  }

}

//ver todos los usuarios
export const getusers = async (req, res) => {

  const { limit, offset } = req.query;

  const limitValue = limit ? Number(limit) : 10

  const offsetValue = offset ? Number(offset) : 0

  try {

    const [totalUser] = await pool.query('SELECT COUNT(*) AS total FROM AMS_USERS')

    const [users] = await pool.query('SELECT * FROM AMS_USERS LIMIT ? OFFSET ? ', [limitValue, offsetValue])

    const total = totalUser[0].total

    res.json({ total, users })

  } catch (error) {

    console.error(error)

    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: error.message
    })
  }
}

//ver perfil del usuario
export const userProfile = async (req, res) => {

  const { peoId } = req.user;

  try {
    const [data] = await pool.query('SELECT * FROM AMS_USERS WHERE USU_PEO_ID =?', [peoId])
    console.log(data)
    if (data.length === 0) return res.status(404).json({ Message: 'Usuario no encontrado' })

    //sacamos la data para mostrarla


    const { usu_id, usu_user, usu_password, usu_role, usu_peo_id, ...user } = data[0]

    //return res.json({user})


    const response = {
      content: {
        user
      },
      status: true,
      message: 'Informacion del perfil del usuario'
    }

    const Data = {
      data: response
    }

    return res.status(200).json(Data)


  } catch (error) {

    console.error(error)

    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: error.message
    })
  }
}



// Obtener información del usuario por usu_user
export const getUserProfileByUser = async (req, res) => {

  const { id_users } = req.params;
  console.log('usu_user:', id_users);
  try {

    /* ===============================
       1️⃣ Usuario
    =============================== */
    const [users] = await pool.query(
      'SELECT USU_ID, USU_PEO_ID FROM AMS_USERS WHERE USU_USER = ? LIMIT 1',
      [id_users]
    );

    if (users.length === 0) {
      return res.status(404).json({ Message: 'Usuario no encontrado' });
    }

    const { USU_ID, USU_PEO_ID } = users[0];

    /* ===============================
       2️⃣ Persona
    =============================== */
    const [people] = await pool.query(
      `SELECT *
       FROM AMS_PEOPLE
       WHERE PEO_ID = ?
       LIMIT 1`,
      [USU_PEO_ID]
    );

    if (people.length === 0) {
      return res.status(404).json({ Message: 'Persona no encontrada' });
    }

    const personData = people[0];
    const [contacts] = await pool.query(
      `SELECT *
       FROM AMS_CONTACT
       WHERE CON_PEO_ID = ?
       LIMIT 1`,
      [USU_PEO_ID]
    );
    const contactData = contacts.length > 0 ? contacts[0] : null;
    /* ===============================
       3️⃣ Buscar si es docente
    =============================== */
    const [teachers] = await pool.query(
      `SELECT *
       FROM AMS_TEACHERS
       WHERE TEA_PEO_ID = ?
       LIMIT 1`,
      [USU_PEO_ID]
    );

    /* ===============================
       4️⃣ Buscar si es estudiante
    =============================== */
    const [students] = await pool.query(
      `SELECT *
       FROM AMS_ESTUDENTS
       WHERE EST_PEO_ID = ?
       LIMIT 1`,
      [USU_PEO_ID]
    );

    /* ===============================
       5️⃣ Armar respuesta
    =============================== */
    const response = {
      content: {
        usu_id: USU_ID,
        people: personData,
        contact: contactData,
        teacher: teachers.length > 0 ? teachers[0] : null,
        student: students.length > 0 ? students[0] : null
      },
      status: true,
      message: 'Información del perfil del usuario'
    };

    res.json({ data: response });

  } catch (error) {

    console.error(error)

    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: error.message
    })
  }
};