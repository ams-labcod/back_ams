import crypto from 'crypto'


export const generarTokenUnico = () => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(20, (err, buffer) => {
            if (err) {
                reject('Error a la hora de generar token único');
            } else {
                const token = buffer.toString('hex');
                resolve(token);
            }
        });
    });
};