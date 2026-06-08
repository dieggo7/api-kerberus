const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get('/', (req, res) => {
    const sql = 'SELECT * FROM users';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar usuários:', err);
            res.status(500).json({ error: 'Erro ao buscar usuários' });
        } else {
            res.json(results);
        }
    });
});

router.post('/', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ error: 'nome, email e senha são obrigatórios' });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const sql = 'INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)';
        db.query(sql, [nome, email, senhaHash], (err, result) => {
            if (err) {
                console.error('Erro ao criar usuário:', err);
                res.status(500).json({ error: 'Erro ao criar usuário' });
            } else {
                res.status(201).json({ message: 'Usuário criado com sucesso!', id: result.insertId });
            }
        });
    } catch (error) {
        console.error('Erro ao processar requisição:', error);
        res.status(500).json({ error: 'Erro ao processar requisição' });
    }
});

// Endpoint de login
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        // Buscar usuário por email
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.query(sql, [email], async (err, results) => {
            if (err) {
                console.error('Erro ao buscar usuário:', err);
                return res.status(500).json({ error: 'Erro ao buscar usuário' });
            }

            if (results.length === 0) {
                return res.status(401).json({ error: 'Email ou senha incorretos' });
            }

            const usuario = results[0];

            // Comparar senha
            try {
                const senhaValida = await bcrypt.compare(senha, usuario.senha);
                if (!senhaValida) {
                    return res.status(401).json({ error: 'Email ou senha incorretos' });
                }

                // Gerar token JWT
                const token = jwt.sign(
                    { id: usuario.id, email: usuario.email, nome: usuario.nome },
                    process.env.JWT_SECRET || 'secret_key',
                    { expiresIn: '24h' }
                );

                res.json({
                    message: 'Login realizado com sucesso!',
                    token: token,
                    usuario: {
                        id: usuario.id,
                        nome: usuario.nome,
                        email: usuario.email
                    }
                });
            } catch (compareError) {
                console.error('Erro ao comparar senha:', compareError);
                res.status(500).json({ error: 'Erro ao processar login' });
            }
        });
    } catch (error) {
        console.error('Erro ao processar login:', error);
        res.status(500).json({ error: 'Erro ao processar login' });
    }
});

module.exports = router;