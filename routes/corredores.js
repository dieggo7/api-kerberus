const express = require('express');
const router = express.Router();
const db = require('../db')


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

router.post('/', (req, res) => {
    const { nome, turma, equipe } = req.body;

    if (!nome || !turma || !equipe) {
        return res.status(400).json({ error: 'nome, turma e equipe são obrigatórios' });
    }

    const sql = "INSERT INTO corredores (nome, turma, equipe) VALUES(?,?,?)";

    db.query(sql, [nome, turma, equipe], (err, results) => {
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


router.post("/cadastro/corridas", (req, res) => {
    const { nome, tempo, voltas, corredores_id } = req.body;

    if (!nome || !tempo || !voltas || !corredores_id) {
        return res.status(400).json({ error: 'nome, tempo, voltas e id do corredor são obrigatórios' });
    }

    const sql = "INSERT INTO corridas (nome, tempo, voltas, corredores_id) VALUES (?, ?, ?, ?)";

    db.query(sql, [nome, tempo, voltas, corredores_id], (err, results) => {
        if (err) {
            console.error('Erro ao cadastrar a corrida:', err);
            return res.status(500).json({ error: 'Erro ao cadastrar a corrida' });
        }

        res.status(201).json({
            message: 'Corrida criada com sucesso!',
            id: results.insertId
        });
    });
});




// GET todas as corridas (com dados do corredor)
router.get("/corridas", (req, res) => {
    const sql = `
        SELECT corridas.id, corridas.nome, corridas.tempo, corridas.voltas, corridas.corredores_id,
               corredores.nome AS corredor_nome, corredores.turma AS corredor_turma
        FROM corridas
        LEFT JOIN corredores ON corredores.id = corridas.corredores_id
        ORDER BY corridas.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar corridas:', err);
            return res.status(500).json({ error: 'Erro ao buscar corridas' });
        }
        res.json(results);
    });
});

// GET pódium (média de tempo por corredor)
router.get("/podium", (req, res) => {
    const sql = `
        SELECT corredores.id, corredores.nome, corredores.turma,
               AVG(corridas.tempo) AS media_tempo,
               COUNT(corridas.id) AS total_corridas
        FROM corredores
        INNER JOIN corridas ON corredores.id = corridas.corredores_id
        GROUP BY corredores.id, corredores.nome, corredores.turma
        ORDER BY media_tempo ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar pódium:', err);
            return res.status(500).json({ error: 'Erro ao buscar pódium' });
        }
        res.json(results);
    });
});

// PUT editar tempo/voltas de uma corrida (participação)
router.put("/corridas/:id", (req, res) => {
    const { id } = req.params;
    const { tempo, voltas } = req.body;

    if (tempo === undefined || voltas === undefined) {
        return res.status(400).json({ error: 'tempo e voltas são obrigatórios' });
    }

    const sql = "UPDATE corridas SET tempo = ?, voltas = ? WHERE id = ?";

    db.query(sql, [tempo, voltas, id], (err, results) => {
        if (err) {
            console.error('Erro ao atualizar corrida:', err);
            return res.status(500).json({ error: 'Erro ao atualizar corrida' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Corrida não encontrada' });
        }

        res.status(200).json({ message: 'Corrida atualizada com sucesso!' });
    });
});

// DELETE remover uma corrida (participação)
router.delete("/corridas/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM corridas WHERE id = ?";

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Erro ao deletar corrida:', err);
            return res.status(500).json({ error: 'Erro ao deletar corrida' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Corrida não encontrada' });
        }

        res.status(200).json({ message: 'Corrida removida com sucesso!' });
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params
    const sql = "DELETE FROM corredores WHERE id = ?"
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Erro ao deletar corredor:', err);
            if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
                return res.status(409).json({
                    error: 'Esse piloto possui corridas registradas e não pode ser removido. Remova as corridas dele primeiro.'
                });
            }
            return res.status(500).json({ error: 'Erro ao deletar corredor' });
        } else if (results.affectedRows === 0) {
            res.status(404).json({ error: 'Corredor não encontrado' });
        } else {
            res.status(200).json({ message: 'Corredor deletado com sucesso!' });
        }
    })
})

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nome, turma, equipe } = req.body;

    if (!nome || !turma || !equipe) {
        return res.status(400).json({ error: 'nome, turma e equipe são obrigatórios' });
    }

    const sql = "UPDATE corredores SET nome = ?, turma = ?, equipe = ? WHERE id = ?";

    db.query(sql, [nome, turma, equipe, id], (err, results) => {
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