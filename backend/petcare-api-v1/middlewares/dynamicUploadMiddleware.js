const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Função para garantir que o diretório existe
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Configuração dinâmica de armazenamento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'uploads';

        if (req.baseUrl.includes('lojas')) {
            folder += '/lojas';
        } else if (req.baseUrl.includes('produtos')) {
            folder += '/produtos';
        }

        ensureDir(folder);
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({ storage });

module.exports = upload;
