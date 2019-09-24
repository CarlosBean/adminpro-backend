const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const fs = require('fs');
const auth = require('../middleware/auth');

const Hospital = require('../models/hospital');
const Doctor = require('../models/doctor');
const User = require('../models/user');

const models = {
    doctors: Doctor,
    hospitals: Hospital,
    users: User
};

app.use(fileUpload());

app.put('/:collection/:id', (req, res, next) => {

    const collection = req.params.collection;
    const documentRef = collection.slice(0, -1);
    const id = req.params.id;

    const allowedCollections = ['hospitals', 'doctors', 'users'];

    // conditional that validates if it is a valid collection
    if (!allowedCollections.includes(collection)) {
        return res.status(400).json({
            success: false,
            message: `${collection} collection is not accepted`,
            errors: { message: `${collection} collection is not accepted` }
        });
    }

    searchById(collection, id).then(foundDocument => {

        // conditional that validates if upload a file
        if (!req.files) {
            return res.status(400).json({
                success: false,
                message: 'no images were uploaded',
                errors: { message: 'no images were uploaded' }
            });
        }

        const file = req.files.image;
        const filetype = file.name.split('.').pop();
        const allowedFiletypes = ['jpg', 'jpeg', 'gif', 'png'];

        // conditional that validates if it is a valid file type
        if (!allowedFiletypes.includes(filetype)) {
            return res.status(400).json({
                success: false,
                message: 'file type is not valid',
                errors: { message: `accepted file types are ${allowedFiletypes.join(', ')}` }
            });
        }

        const filename = `${id}-${new Date().getMilliseconds()}.${filetype}`;
        const filepath = `./uploads/${collection}/${filename}`;

        // moves image to server folder on filepath
        file.mv(filepath, err => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'error moving the file to server path',
                    errors: err
                });
            }
        });

        // removes old image from server folder
        const oldpath = `./uploads/${collection}/${foundDocument.img}`;

        if (fs.existsSync(oldpath)) {
            fs.unlinkSync(oldpath);
        }

        foundDocument.updateOne({ img: filename }, (err, updatedResource) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: `error updating ${documentRef} image`,
                    errors: err
                });
            }

            return res.status(200).json({
                success: true,
                message: `${documentRef} image has been updated`,
                data: { name: foundDocument.name, img: filename }
            });
        })

    }).catch(err => {

        // conditional that validates if it is an existing resource
        if (err.notFound) {
            return res.status(400).json({
                success: false,
                message: `${documentRef} with id ${id} is not exist`,
                errors: { message: `${documentRef} not exist` }
            });
        } else {
            return res.status(500).json({
                success: false,
                message: `error searching ${documentRef}`,
                errors: err
            });
        }
    })
});

function searchById(collection, id) {
    return new Promise((resolve, reject) => {
        models[collection].findById(id, (err, foundDocument) => {
            if (err) {
                err.notFound = err.kind && err.kind === 'ObjectId';
                reject(err);
            } else {
                resolve(foundDocument);
            }
        });
    });
}

module.exports = app;