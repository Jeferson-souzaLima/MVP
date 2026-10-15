const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Fun��o para garantir que o diret�rio existe
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Configura��o din�mica de armazenamento
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
