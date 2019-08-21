const express = require('express');
const bodyParser = require('body-parser')
const Hospital = require('../models/hospital');
const auth = require('../middleware/auth');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// get all hospitals
app.get('/', (req, res) => {

    let from = req.query.from || 0;
    from = Number(from);

    Hospital.find({})
        .skip(from)
        .limit(5)
        .populate('user')
        .exec((err, hospitals) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'error loading hospitals'
                });
            }

            Hospital.countDocuments({}, (err, total) => {
                res.status(200).json({
                    success: true,
                    message: 'successful hospitals',
                    data: hospitals,
                    total
                });
            });
        });
});

// create hospital
app.post('/', auth.verifyToken, (req, res) => {
    const body = req.body;

    const hospital = new Hospital({
        name: body.name,
        img: body.img,
        user: req.currentUser._id
    });

    hospital.save((err, savedHospital) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: 'error create hospital',
                errors: err
            });
        }

        res.status(201).json({
            success: true,
            message: 'successful create',
            data: savedHospital
        });
    });
});

// update hospital
app.put('/:id', auth.verifyToken, (req, res) => {
    const id = req.params.id;
    const body = req.body;

    Hospital.findById(id, (err, foundHospital) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'error searching hospital'
            });
        }

        if (!foundHospital) {
            return res.status(400).json({
                success: false,
                message: `hospital with id ${id} is not exist`,
                errors: { message: 'hospital not exist' }
            });
        }

        foundHospital.name = body.name;
        foundHospital.img = body.img ? body.img : foundHospital.img;
        foundHospital.user = req.currentUser._id;

        foundHospital.save((err, savedHospital) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: 'error update hospital',
                    errors: err
                });
            }

            res.status(200).json({
                success: true,
                message: 'successful update',
                data: savedHospital
            });
        })
    });
});


app.delete('/:id', auth.verifyToken, (req, res) => {
    const id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, deletedHospital) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'error delete hospital'
            });
        }

        if (!deletedHospital) {
            return res.status(400).json({
                success: false,
                message: `hospital with id ${id} is not exist`,
                errors: { message: 'hospital not exist' }
            });
        }

        res.status(200).json({
            success: true,
            message: 'successful delete',
            data: deletedHospital
        });
    });
});

module.exports = app;

