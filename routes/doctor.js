const express = require('express');
const bodyParser = require('body-parser')
const Doctor = require('../models/doctor');
const auth = require('../middleware/auth');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// get all doctors
app.get('/', (req, res) => {

    let from = req.query.from || 0;
    from = Number(from);

    Doctor.find({})
        .skip(from)
        .limit(5)
        .populate('user')
        .populate('hospital')
        .exec((err, doctors) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'error loading doctors'
                });
            }

            Doctor.count({}, (err, total) => {
                res.status(200).json({
                    success: true,
                    message: 'successful doctors',
                    data: doctors,
                    total
                });
            });
        });
});

// create a doctor
app.post('/', auth.verifyToken, (req, res) => {
    const body = req.body;

    const doctor = new Doctor({
        name: body.name,
        img: body.img,
        user: req.currentUser._id,
        hospital: body.hospital
    });

    doctor.save((err, savedDoctor) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: 'error create doctor',
                errors: err
            });
        }

        res.status(201).json({
            success: true,
            message: 'successful create',
            data: savedDoctor
        });
    });
});

// update doctor
app.put('/:id', auth.verifyToken, (req, res) => {
    const id = req.params.id;
    const body = req.body;

    Doctor.findById(id, (err, foundDoctor) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'error searching doctor'
            });
        }

        if (!foundDoctor) {
            return res.status(400).json({
                success: false,
                message: `doctor with id ${id} is not exist`,
                errors: { message: 'doctor not exist' }
            });
        }

        foundDoctor.name = body.name;
        foundDoctor.img = body.img ? body.img : foundDoctor.img;
        foundDoctor.user = req.currentUser._id;
        foundDoctor.hospital = body.hospital ? body.hospital : foundDoctor.hospital;

        foundDoctor.save((err, savedDoctor) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: 'error update doctor',
                    errors: err
                });
            }

            res.status(200).json({
                success: true,
                message: 'successful update',
                data: savedDoctor
            });
        })
    });
});

app.delete('/:id', auth.verifyToken, (req, res) => {
    const id = req.params.id;

    Doctor.findByIdAndRemove(id, (err, deletedDoctor) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'error delete doctor'
            });
        }

        if (!deletedDoctor) {
            return res.status(400).json({
                success: false,
                message: `doctor with id ${id} is not exist`,
                errors: { message: 'doctor not exist' }
            });
        }

        res.status(200).json({
            success: true,
            message: 'successful delete',
            data: deletedDoctor
        });
    });
});


module.exports = app;
