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
    usu_condition
  } = req.body

  try {
    console.log('================ INICIO CREATE_PERSON ================')

    /* ===============================
       1️⃣ INSERT PERSONA
       =============================== */
    const [resultPeople] = await pool.query(
      'INSERT INTO ${AMS.PEOPLE} (PEO_ID, PEO_NAME_1, PEO_NAME_2, PEO_LAST_NAME_1, PEO_LAST_NAME_2, PEO_TP_PERSON, PEO_TP_ID, PEO_IDENTIFICATION, PEO_LEVEL, PEO_TP_REG, PEO_GRADE, PEO_GRADE_L, PEO_SEX, PEO_BIRTH, PEO_PLACE_BIRTH, PEO_CEL, PEO_EMAIL, PEO_CITY, PEO_DEPARTAMENT, PEO_ADDRESS, PEO_EPS, PEO_POPULATION, PEO_PREV_SCHOOL, PEO_ALLERGIES, PEO_CONDITION, PEO_TYPE, PEO_STATE) VALUES (UUID(),?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
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
    )

    console.log('🆔 Persona creada:', resultPeople)

    /* ===============================
       2️⃣ OBTENER PEO_ID
       =============================== */
    const [rows] = await pool.query(
      'SELECT PEO_ID FROM ams_people WHERE PEO_IDENTIFICATION = ? LIMIT 1',
      [usu_identification]
    )

    if (rows.length === 0) {
      throw new Error('No se pudo obtener el PEO_ID')
    }

    const peoId = rows[0].PEO_ID
    console.log('🔗 PEO_ID obtenido:', peoId)

    /* ===============================
       3️⃣ CREAR USUARIO (SI APLICA)
       =============================== */
    const tipoPersona = usu_tp_person?.trim().toUpperCase()
    console.log('🔄 Tipo normalizado:', tipoPersona)

    if (tipoPersona === 'ESTUDIANTE' || tipoPersona === 'PROFESOR') {

      const role =
        tipoPersona === 'ESTUDIANTE'
          ? 'ROL_STUDENT'
          : 'ROL_TEACHER'

      console.log('🎭 Rol asignado:', role)
      const usu_password = usu_identification // Contraseña inicial igual a la identificación
      const hashPassword = await bcrypt.hash(usu_password, salt)
      console.log('🔐 Password hasheado')
      // const pass = usu_identification;
      const [resultUser] = await pool.query(
        'INSERT INTO ams_users (USU_ID, USU_USER, USU_PASSWORD, USU_ROLE, USU_PEO_ID) VALUES (UUID(), ?, ?, ?, ?)',
        [
          usu_identification, // usuario
          hashPassword,       // password
          role,               // rol
          peoId               // FK persona
        ]
      )

      console.log('👤 Usuario creado:', resultUser)
    } else {
      console.log('ℹ️ Tipo de persona sin usuario')
    }

    console.log('================ FIN CREATE_PERSON ================')

    return res.status(201).json({
      status: true,
      message: 'Persona registrada correctamente'
    })

  } catch (error) {
    console.error('❌ ERROR CREATE_PERSON')
    console.error(error)

    return res.status(500).json({
      status: false,
      message: 'Error en el servidor'
    })
  }
}


export const login = async (req, res) => {

  const { usu_user, usu_password } = req.body;

  try {

    //verificamos si existe el correo
    const [data] = await pool.query('SELECT  p.PEO_ID, p.PEO_IDENTIFICATION, p.PEO_NAME_1, p.PEO_LAST_NAME_1, p.PEO_EMAIL,p.PEO_STATE,u.USU_PASSWORD AS usu_password, u.USU_ROLE AS usu_role FROM ams_people p INNER JOIN ams_users u ON u.USU_PEO_ID = p.PEO_ID WHERE p.PEO_IDENTIFICATION = ? LIMIT 1 ', [usu_user])

    //si el correo no existe
    if (data.length === 0) return res.status(404).json({ Message: 'Correo Incorrecto o no existe' })

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
    const passwordHash  = String(storedcontrasena).trim();
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
    
    //-- generamos el jwt
    const token = await generateJwt(peoId, usu_identification, usu_name1, usu_lastname1, usu_correo, usu_role, usu_state)
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

    console.log(error)

    res.status(500).json({ Message: 'Error en el servidor' })

  }
  // const [data] = await pool.query(
  //     'SELECT USU_USER, USU_PASSWORD FROM AMS_USERS WHERE USU_USER = ?',
  //     [usu_user]
  // );
  // console.log(data[0]);
  // if (!data || data.length === 0) {
  //     return res.status(404).json({
  //         status: false,
  //         message: 'Usuario no encontrado'
  //     });
  // }

  // 👇 USAR EL NOMBRE REAL DE LA COLUMNA
  //     const storedPassword = data[0].USU_PASSWORD;
  //     console.log(data[0]);
  //     if (usu_password !== storedPassword) {
  //         return res.status(401).json({
  //             status: false,
  //             message: 'Password incorrecta'
  //         });
  //     }

  //     return res.status(200).json({
  //         status: true,
  //         message: 'Usuario logueado correctamente'
  //     });

  // } catch (error) {
  //     console.error(error);
  //     return res.status(500).json({
  //         status: false,
  //         message: 'Error en el servidor'
  //     });
  // }
}
