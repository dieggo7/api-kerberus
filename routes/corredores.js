const express = require('express');
const router = express.Router();
const db = require('../db')
const bcrypt = require('bcrypt')


// GET todos os corredores
router.get('/', (req, res) => {
    const sql = "SELECT * FROM corredores"
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar corredores:', err);
            res.status(500).json({ error: 'Erro ao buscar corredores' });
        } else {
            res.json(results);
        }
    })
})

router.get('/cadastrados', (req, res) => {
    const sql = "SELECT * FROM corredores"
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar corredores:', err);
            res.status(500).json({ error: 'Erro ao buscar corredores' });
        } else {
            res.json(results);
        }
    })
})

router.post('/', async (req, res) => {
    const { nome, turma, senha } = req.body;

    if (!nome || !turma || !senha) {
        return res.status(400).json({ error: 'nome, turma e senha são obrigatórios' });
    }

    const senhaHash2 = await bcrypt.hash(senha, 10);

    const sql = "INSERT INTO corredores (nome, turma, senha) VALUES(?,?,?)";

    db.query(sql, [nome, turma, senhaHash2], (err, results) => {
        if (err) {
            console.error('Erro ao criar corredor:', err);
            return res.status(500).json({ error: 'Erro ao criar corredor' });
        }

        res.status(201).json({
            message: 'Corredor criado com sucesso!',
            id: results.insertId
        });
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params
    const sql = "DELETE FROM corredores WHERE id = ?"
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Erro ao deletar corredor:', err);
            res.status(500).json({ error: 'Erro ao deletar corredor' });
        } else if (results.affectedRows === 0) {
            res.status(404).json({ error: 'Corredor não encontrado' });
        } else {
            res.status(200).json({ message: 'Corredor deletado com sucesso!' });
        }
    })
})

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, turma, senha } = req.body;

    if (!nome || !turma || !senha) {
        return res.status(400).json({ error: 'nome, turma e senha são obrigatórios' });
    }

    const senhaHash2 = await bcrypt.hash(senha, 10);

    const sql = "UPDATE corredores SET nome = ?, turma = ?, senha = ? WHERE id = ?";

    db.query(sql, [nome, turma, senhaHash2, id], (err, results) => {
        if (err) {
            console.error('Erro ao atualizar corredor:', err);
            return res.status(500).json({ error: 'Erro ao atualizar corredor' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Corredor não encontrado' });
        }

        res.status(200).json({ message: 'Corredor atualizado com sucesso!' });
    });
});

router.get("/melhor-volta", (req, res) => {
    const sql = `
        SELECT corredores.nome, corridas.tempo
        FROM corredores, corridas
        WHERE corredores.id = corridas.corredores_id
        ORDER BY corridas.tempo ASC
        LIMIT 1
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar melhor volta:', err);
            return res.status(500).json({ error: 'Erro ao buscar melhor volta' });
        }
        res.json(results[0]);
    });
});

router.get("/tempo-total", (req, res) => {
    const sql = `
        SELECT corredores.nome, SUM(corridas.tempo)
        FROM corredores, corridas
        WHERE corredores.id = corridas.corredores_id
        GROUP BY corredores.id, corredores.nome
        ORDER BY SUM(corridas.tempo) ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar tempo total:', err);
            return res.status(500).json({ error: 'Erro ao buscar tempo total' });
        }
        res.json(results);
    });
});

router.get("/voltas", (req, res) => {
    const sql = `
        SELECT corredores.nome, SUM(corridas.voltas)
        FROM corredores, corridas
        WHERE corredores.id = corridas.corredores_id
        GROUP BY corredores.id, corredores.nome
        ORDER BY SUM(corridas.voltas) ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar quantidade de voltas:', err);
            return res.status(500).json({ error: 'Erro ao buscar quantidade de voltas' });
        }
        res.json(results);
    });
});

router.get("/ranking", (req, res) => {
    const sql = `
        SELECT corredores.nome, corredores.turma, SUM(corridas.tempo)
        FROM corredores, corridas
        WHERE corredores.id = corridas.corredores_id
        GROUP BY corredores.id, corredores.nome, corredores.turma
        ORDER BY SUM(corridas.tempo) ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar ranking:', err);
            return res.status(500).json({ error: 'Erro ao buscar ranking' });
        }
        res.json(results);
    });
});

module.exports = router;