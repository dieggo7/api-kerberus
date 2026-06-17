const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
    const sql = `
        SELECT
            (SELECT COUNT(*) FROM corredores) AS total_corredores,
            (SELECT COUNT(DISTINCT nome) FROM corridas) AS total_corridas,
            (SELECT COUNT(DISTINCT turma) FROM corredores) AS total_turmas,
            (SELECT MIN(tempo) FROM corridas) AS melhor_tempo
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar estatísticas:', err);
            return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
        }

        res.json(results[0] || {
            total_corredores: 0,
            total_corridas: 0,
            total_turmas: 0,
            melhor_tempo: null
        });
    });
});

router.get('/ranking', (req, res) => {
    const sql = `
        SELECT corredores.nome, corredores.turma, SUM(corridas.tempo) AS tempo_total
        FROM corredores
        INNER JOIN corridas ON corredores.id = corridas.corredores_id
        GROUP BY corredores.id, corredores.nome, corredores.turma
        ORDER BY tempo_total ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar ranking de estatísticas:', err);
            return res.status(500).json({ error: 'Erro ao buscar ranking de estatísticas' });
        }

        res.json(results);
    });
});

router.get('/turmas', (req, res) => {
    const sql = `
        SELECT turma, COUNT(*) AS total_corredores
        FROM corredores
        GROUP BY turma
        ORDER BY turma ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar estatísticas por turma:', err);
            return res.status(500).json({ error: 'Erro ao buscar estatísticas por turma' });
        }

        res.json(results);
    });
});

module.exports = router;
