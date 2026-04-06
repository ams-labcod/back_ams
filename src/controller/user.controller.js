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
        p.PEO_TP_PERSON,
        u.USU_PASSWORD AS usu_password, 
        u.USU_ROLE AS usu_role,
        t.TEA_PEO_ID 
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

    // const [users] = await pool.query('SELECT * FROM AMS_USERS LIMIT ? OFFSET ? ', [limitValue, offsetValue])

    const [users] = await pool.query(
      `SELECT 
        p.PEO_ID AS peo_id,
        u.USU_ROLE AS usu_role,
        u.USU_USER AS usu_user,
        p.PEO_NAME_1 AS usu_name1,
        p.PEO_NAME_2 AS usu_name2,
        p.PEO_LAST_NAME_1 AS usu_lastname1,
        p.PEO_LAST_NAME_2 AS usu_lastname2,
        p.PEO_TP_PERSON AS usu_tp_person,
        p.PEO_TP_ID AS usu_tp_id,
        p.PEO_IDENTIFICATION AS usu_identification,
        p.PEO_LEVEL AS usu_level,
        p.PEO_TP_REG AS usu_tp_reg,
        p.PEO_GRADE AS usu_grade,
        p.PEO_GRADE_L AS usu_grade_l,
        p.PEO_SEX AS usu_sex,
        p.PEO_BIRTH AS usu_birth,
        p.PEO_PLACE_BIRTH AS usu_place_birth,
        p.PEO_CEL AS usu_cel,
        p.PEO_EMAIL AS usu_correo,
        p.PEO_CITY AS usu_city,
        p.PEO_DEPARTAMENT AS usu_departament,
        p.PEO_ADDRESS AS usu_address,
        p.PEO_EPS AS usu_eps,
        p.PEO_POPULATION AS usu_population,
        p.PEO_PREV_SCHOOL AS usu_prev_school,
        p.PEO_ALLERGIES AS usu_allergies,
        p.PEO_CONDITION AS usu_condition,
        p.PEO_STATE AS estado,
        e.COU_ID AS cou_id -- Solo traerá dato si es estudiante, sino será null
      FROM AMS_USERS u
      INNER JOIN AMS_PEOPLE p ON u.USU_PEO_ID = p.PEO_ID
      LEFT JOIN AMS_ESTUDENTS e ON p.PEO_ID = e.EST_PEO_ID
      LIMIT ? OFFSET ?`,
      [limitValue, offsetValue]
    );

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



export const delete_person = async (req, res) => {
  const { peo_id } = req.params;

  try {

    const [person] = await pool.query('SELECT PEO_ID FROM AMS_PEOPLE WHERE PEO_ID = ?', [peo_id]);

    if (person.length === 0) {
      return res.status(404).json({ message: 'El usuario no existe en el sistema' });
    }

    // Soft Delete
    await pool.query(
      `UPDATE AMS_PEOPLE SET PEO_STATE = 'I' WHERE PEO_ID = ?`,
      [peo_id]
    );

    const response = {
      content: null,
      status: true,
      message: 'Usuario eliminado (inactivado) correctamente'
    };

    return res.status(200).json({ data: response });

  } catch (error) {
    console.error('❌ ERROR DELETE_PERSON:', error);
    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor al intentar eliminar el usuario',
      error: error.message
    });
  }
};



export const update_person = async (req, res) => {
  // Recibimos el ID de la persona por los parámetros de la ruta (Ej: /api/users/update/123-uuid)
  const { peo_id } = req.params;

  const {
    usu_name1,
    usu_name2,
    usu_lastname1,
    usu_lastname2,
    usu_level,
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
    usu_condition
  } = req.body;

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1️⃣ Validar si la persona existe y obtener su tipo
    const [personInfo] = await connection.query(
      'SELECT PEO_TP_PERSON FROM AMS_PEOPLE WHERE PEO_ID = ? LIMIT 1',
      [peo_id]
    );

    if (personInfo.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Usuario no encontrado en el sistema' });
    }

    const tipoPersona = personInfo[0].PEO_TP_PERSON?.trim().toUpperCase();

    // 2️⃣ Actualizar datos en AMS_PEOPLE
    await connection.query(
      `UPDATE AMS_PEOPLE SET 
        PEO_NAME_1 = ?, PEO_NAME_2 = ?, PEO_LAST_NAME_1 = ?, PEO_LAST_NAME_2 = ?, 
        PEO_LEVEL = ?, PEO_GRADE = ?, PEO_GRADE_L = ?, PEO_SEX = ?, PEO_BIRTH = ?, 
        PEO_PLACE_BIRTH = ?, PEO_CEL = ?, PEO_EMAIL = ?, PEO_CITY = ?, PEO_DEPARTAMENT = ?, 
        PEO_ADDRESS = ?, PEO_EPS = ?, PEO_POPULATION = ?, PEO_PREV_SCHOOL = ?, 
        PEO_ALLERGIES = ?, PEO_CONDITION = ?
       WHERE PEO_ID = ?`,
      [
        usu_name1, usu_name2, usu_lastname1, usu_lastname2, usu_level, usu_grade, usu_grade_l,
        usu_sex, usu_birth, usu_place_birth, usu_cel, usu_correo, usu_city, usu_departament,
        usu_address, usu_eps, usu_population, usu_prev_school, usu_allergies, usu_condition,
        peo_id
      ]
    );

    // 3️⃣ Mantener sincronizados los nombres en las tablas secundarias (Docentes o Estudiantes)
    if (tipoPersona === 'DOCENTE') {
      await connection.query(
        'UPDATE AMS_TEACHERS SET TEA_NAME = ?, TEA_LAST_NAME = ? WHERE TEA_PEO_ID = ?',
        [usu_name1, usu_lastname1, peo_id]
      );
    } else if (tipoPersona === 'ESTUDIANTE') {
      // Si quieres permitir cambiar de curso, puedes agregar el cou_id aquí también
      await connection.query(
        'UPDATE AMS_ESTUDENTS SET EST_NAME = ?, EST_LAST_NAME = ? WHERE EST_PEO_ID = ?',
        [usu_name1, usu_lastname1, peo_id]
      );
    }

    // 4️⃣ Confirmar transacción
    await connection.commit();

    return res.status(200).json({
      data: {
        content: null,
        status: true,
        message: 'Usuario actualizado correctamente'
      }
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('❌ ERROR UPDATE_PERSON:', error);
    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
};




//* Correo de recuperación
export const EnviarCorreoRecuperacion = async (req, res) => {
  // Ahora recibimos el correo (PEO_EMAIL)
  const { peo_email } = req.body;

  try {
    // Verificamos si el correo existe en AMS_PEOPLE y si tiene un usuario asociado en AMS_USERS
    const [userCheck] = await pool.query(
      `SELECT p.PEO_ID, p.PEO_NAME_1, u.USU_ID 
       FROM AMS_PEOPLE p
       INNER JOIN AMS_USERS u ON p.PEO_ID = u.USU_PEO_ID
       WHERE p.PEO_EMAIL = ? LIMIT 1`,
      [peo_email]
    );

    if (userCheck.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado en el sistema con ese correo' });
    }

    const { USU_ID, PEO_NAME_1 } = userCheck[0];

    // Generamos el token
    const token = await generarTokenUnico();

    // Guardamos el token en la tabla de usuarios
    await pool.query(
      'UPDATE AMS_USERS SET USU_RECOVERY_TOKEN = ? WHERE USU_ID = ?',
      [token, USU_ID]
    );

    // Configuramos el enlace (¡Recuerda cambiarlo por la URL real de tu Frontend AMS!)
    const link = `https://ams-front-puce.vercel.app/auth/forgot-password/${token}`;
    
    // Configuración de Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 465,
      secure: true,
      auth: {
        user: 'afanador1106@gmail.com',
        pass: 'svpp xpra jqez xqzr' // ⚠️ TIP: En producción, guarda esto en un archivo .env
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: '"Soporte AMS" <afanador1106@gmail.com>',
      to: peo_email,
      subject: "Recuperación de Contraseña",
      html: `
        <h2>Recuperación de Contraseña</h2>
        <p>Hola <b>${PEO_NAME_1}</b>,</p>
        <p>Has solicitado recuperar tu contraseña. Haz clic en el siguiente enlace para crear una nueva:</p>
        <p><a href="${link}" style="color: blue; text-decoration: underline;">${link}</a></p>
        <p>Si no fuiste tú, ignora este correo.</p>
      `
    };

    // Enviamos el correo
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      data: {
        content: null,
        status: true,
        message: 'Correo de recuperación enviado con éxito'
      }
    });

  } catch (error) {
    console.error('❌ ERROR ENVIANDO CORREO:', error);
    return res.status(500).json({ errorMessage: 'Error interno al enviar el correo de recuperación' });
  }
};




//* Recuperar contraseña
export const recuperarContrasena = async (req, res) => {
  const { token, usu_password } = req.body;

  try {
    // Buscamos al usuario que tenga ese token de recuperación
    const [usuario] = await pool.query(
      'SELECT USU_ID FROM AMS_USERS WHERE USU_RECOVERY_TOKEN = ? LIMIT 1',
      [token]
    );

    if (usuario.length === 0) {
      return res.status(400).json({ message: 'El token no es válido o ya ha sido utilizado' });
    }

    const { USU_ID } = usuario[0];

    // Hasheamos la nueva contraseña asegurando que sea string
    const hashNewPassword = await bcrypt.hash(String(usu_password).trim(), salt);

    // Actualizamos la contraseña y anulamos el token pasándolo a NULL
    await pool.query(
      'UPDATE AMS_USERS SET USU_PASSWORD = ?, USU_RECOVERY_TOKEN = NULL WHERE USU_ID = ?',
      [hashNewPassword, USU_ID]
    );

    return res.status(200).json({
      data: {
        content: null,
        status: true,
        message: 'Contraseña recuperada con éxito'
      }
    });

  } catch (error) {
    console.error('❌ ERROR RECUPERANDO CONTRASEÑA:', error);
    return res.status(500).json({ errorMessage: 'Error interno al restablecer la contraseña' });
  }
};