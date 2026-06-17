const express = require('express');
const router = express.Router();
const db = require('../db')

function garantirTabelaVencedores(callback) {
    const sql = `
        CREATE TABLE IF NOT EXISTS corrida_vencedores (
            id INT NOT NULL AUTO_INCREMENT,
            corrida_nome VARCHAR(100) NOT NULL,
            corredores_id INT NOT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uk_corrida_vencedor_nome (corrida_nome),
            INDEX idx_corrida_vencedor_corredor (corredores_id),
            CONSTRAINT fk_corrida_vencedor_corredor
                FOREIGN KEY (corredores_id)
                REFERENCES corredores (id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        )
    `;

    db.query(sql, callback);
}

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
    garantirTabelaVencedores((tableErr) => {
        if (tableErr) {
            console.error('Erro ao preparar tabela de vencedores:', tableErr);
            return res.status(500).json({ error: 'Erro ao buscar corridas' });
        }

    const sql = `
        SELECT corridas.id, corridas.nome, corridas.tempo, corridas.voltas, corridas.corredores_id,
               corredores.nome AS corredor_nome, corredores.turma AS corredor_turma,
               vencedores.corredores_id AS vencedor_corredores_id,
               vencedor.nome AS vencedor_nome,
               CASE
                   WHEN vencedores.corredores_id = corridas.corredores_id THEN 1
                   ELSE 0
               END AS vencedor
        FROM corridas
        LEFT JOIN corredores ON corredores.id = corridas.corredores_id
        LEFT JOIN corrida_vencedores vencedores ON vencedores.corrida_nome = corridas.nome
        LEFT JOIN corredores vencedor ON vencedor.id = vencedores.corredores_id
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
});

router.post("/corridas/:nome/vencedor", (req, res) => {
    const { nome } = req.params;
    const { corredores_id } = req.body;

    if (!nome || !corredores_id) {
        return res.status(400).json({ error: 'nome da corrida e id do corredor são obrigatórios' });
    }

    garantirTabelaVencedores((tableErr) => {
        if (tableErr) {
            console.error('Erro ao preparar tabela de vencedores:', tableErr);
            return res.status(500).json({ error: 'Erro ao declarar vencedor' });
        }

        const validaParticipanteSql = `
            SELECT id
            FROM corridas
            WHERE nome = ? AND corredores_id = ?
            LIMIT 1
        `;

        db.query(validaParticipanteSql, [nome, corredores_id], (validaErr, participantes) => {
            if (validaErr) {
                console.error('Erro ao validar participante:', validaErr);
                return res.status(500).json({ error: 'Erro ao declarar vencedor' });
            }

            if (!participantes.length) {
                return res.status(400).json({ error: 'O vencedor precisa ser um participante dessa corrida' });
            }

            const upsertSql = `
                INSERT INTO corrida_vencedores (corrida_nome, corredores_id)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE corredores_id = VALUES(corredores_id)
            `;

            db.query(upsertSql, [nome, corredores_id], (upsertErr) => {
                if (upsertErr) {
                    console.error('Erro ao salvar vencedor:', upsertErr);
                    return res.status(500).json({ error: 'Erro ao declarar vencedor' });
                }

                res.status(200).json({ message: 'Vencedor declarado com sucesso!' });
            });
        });
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
    const buscaSql = "SELECT nome, corredores_id FROM corridas WHERE id = ?";

    db.query(buscaSql, [id], (buscaErr, rows) => {
        if (buscaErr) {
            console.error('Erro ao buscar corrida:', buscaErr);
            return res.status(500).json({ error: 'Erro ao deletar corrida' });
        }

        const corrida = rows[0];
        const sql = "DELETE FROM corridas WHERE id = ?";

        db.query(sql, [id], (err, results) => {
            if (err) {
                console.error('Erro ao deletar corrida:', err);
                return res.status(500).json({ error: 'Erro ao deletar corrida' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Corrida não encontrada' });
            }

            if (!corrida) {
                return res.status(200).json({ message: 'Corrida removida com sucesso!' });
            }

            garantirTabelaVencedores((tableErr) => {
                if (tableErr) {
                    console.error('Erro ao preparar tabela de vencedores:', tableErr);
                    return res.status(200).json({ message: 'Corrida removida com sucesso!' });
                }

                const limpaVencedorSql = `
                    DELETE FROM corrida_vencedores
                    WHERE corrida_nome = ? AND corredores_id = ?
                `;

                db.query(limpaVencedorSql, [corrida.nome, corrida.corredores_id], () => {
                    res.status(200).json({ message: 'Corrida removida com sucesso!' });
                });
            });
        });
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
        res.json(results[0] || null);
    });
});

router.get("/tempo-total", (req, res) => {
    const sql = `
        SELECT corredores.nome, SUM(corridas.tempo) AS tempo_total
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
        SELECT corredores.nome, SUM(corridas.voltas) AS total_voltas
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
        SELECT corredores.nome, corredores.turma, SUM(corridas.tempo) AS tempo_total
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
