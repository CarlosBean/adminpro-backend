const express = require('express');
const app = express();

const Hospital = require('../models/hospital');
const Doctor = require('../models/doctor');
const User = require('../models/user');

const collections = {
    doctors: { model: Doctor, populate: ['user', 'hospital'] },
    hospitals: { model: Hospital, populate: ['user'] },
    users: { model: User, populate: [] }
};

// search by collection
app.get('/collection/:table/:search', (req, res) => {
    const table = req.params.table;
    const search = req.params.search;
    const regex = new RegExp(search, 'i');

    if (collections[table]) {
        searchByTable(table, regex).then(results => {
            res.status(200).json({
                success: true,
                message: 'successful search',
                data: results
            });
        }).catch(err => {
            res.status(500).json({
                success: false,
                message: err
            });
        });
    } else {
        res.status(400).json({
            success: false,
            message: `${table} collection doesn't exist`
        });
    }
});


// general search
app.get('/all/:search', (req, res) => {

    const search = req.params.search;
    const regex = new RegExp(search, 'i');
    const promises = [
        searchByTable('doctors', regex),
        searchByTable('hospitals', regex),
        searchByTable('users', regex)
    ];

    Promise.all(promises).then(results => {
        const [doctors, hospitals, users] = results;
        res.status(200).json({
            success: true,
            message: 'successful search',
            data: { doctors, hospitals, users }
        });
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err
        });
    });
});

function searchByTable(table, regex) {
    return new Promise((resolve, reject) => {
        collections[table].model.find({ name: regex })
            .populate(collections[table].populate)
            .exec((err, results) => {
                err ? reject(`error searching on ${table}`, err) : resolve(results);
            });
    });
}

module.exports = app;