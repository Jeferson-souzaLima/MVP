const multer = require('multer');
const path = require('path');

// Configurações do Multer para armazenar a imagem
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');  // Caminho da pasta de uploads
    },
    filename: function (req, file, cb) {
        const fileName = Date.now() + path.extname(file.originalname);  // Nome único para o arquivo
        cb(null, fileName);
    }
});

// Validar o tipo de arquivo
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo inválido. Apenas imagens são permitidas.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }  // Limite de 5MB por imagem
});

module.exports = upload;
