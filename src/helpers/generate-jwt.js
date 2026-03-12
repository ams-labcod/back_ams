import jwt from 'jsonwebtoken'


export const generateJwt = (peoId  = '', usu_identification = '', usu_name1 = '', usu_lastname1 = '', usu_correo = '', usu_role = '', usu_state = '',tea_peo_id = ''  ) => {

    return new Promise((resolve, reject) => {

        const payload = { peoId, usu_identification, usu_name1, usu_lastname1, usu_correo, usu_role, usu_state, tea_peo_id }
        jwt.sign(payload, process.env.JWT_SECRET, {  expiresIn: '8h'}, (error, token) => {
            
            if (error) {
                console.log(error)

                reject('Error a la hora de generar el token')
            } else {

                resolve(token)
            }


        })
    })

}   