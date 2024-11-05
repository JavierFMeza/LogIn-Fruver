const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

// Conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) throw err;
  console.log('Conectado a la base de datos MySQL');
});

// Ruta para crear un nuevo usuario (registro)
app.post('/api/register', (req, res) => {
  const { nombre, correo, contraseña } = req.body;

  // Verificar si el usuario ya existe
  const checkUserQuery = 'SELECT * FROM users WHERE correo = ?';
  db.query(checkUserQuery, [correo], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al verificar el usuario.' });
    }

    if (results.length > 0) {
      return res.json({ success: false, message: 'El correo ya está registrado.' });
    }

    // Insertar nuevo usuario
    const insertUserQuery = 'INSERT INTO users (nombre, correo, contraseña) VALUES (?, ?, ?)';
    db.query(insertUserQuery, [nombre, correo, contraseña], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error al registrar el usuario.' });
      }

      res.json({ success: true, message: 'Usuario registrado exitosamente.' });
    });
  });
});

// Ruta para autenticación de usuario (inicio de sesión)
app.post('/api/login', (req, res) => {
  const { correo, contraseña } = req.body;

  const sql = 'SELECT nombre, correo FROM users WHERE correo = ? AND contraseña = ?';
  db.query(sql, [correo, contraseña], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al autenticar usuario.' });
    }

    if (results.length > 0) {
      // Si el usuario existe, devuelve el nombre del usuario junto con un mensaje de éxito
      const { nombre } = results[0];
      res.json({ success: true, message: 'Inicio de sesión exitoso.', nombre });
    } else {
      res.json({ success: false, message: 'Correo o contraseña incorrectos.' });
    }
  });
});

// Ruta raíz para evitar el error de "Cannot GET /"
app.get('/', (req, res) => {
  res.send('Bienvenido a la API de registro y autenticación');
});

// Manejador para rutas no existentes
app.use((req, res) => {
  res.status(404).send('Ruta no encontrada');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
