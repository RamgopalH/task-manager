const express = require('express');
const mongoose = require('./db/mongoose');
app = express();

const bodyParser = require('body-parser');

const { List,Task,User } = require('./db/models/index');
const jwt = require('jsonwebtoken');
const { response } = require('express');

/* MIDDLEWARE */

app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");
    res.header("Access-Control-Expose-Headers",[ "x-access-token", "x-refresh-token"]);
    next();
});

let authenticate = (req, res, next) => {
    let token = req.header('x-access-token');

    jwt.verify(token, User.getJWTSecret(), (error, decoded) => {
        if(error) {
            res.status(401).send(error);
        } else {
            req.user_id = decoded._id;
            next();
        }
    })
}

let verifySessionValid = (req, res, next) => {
    let refreshToken = req.header('x-refresh-token');
    let _id = req.header('_id');

    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if(!user) {
            return Promise.reject({
                'error': 'User Could Not be Found. Make Sure user _id and refresh token are correct'
            });
        }

        //If Session Valid, 

        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if(session.token === refreshToken) {
                if(User.hasRefreshTokenExpired(session.expiresAt) === false) {
                    isSessionValid = true;
                }
            }
        });

        if(isSessionValid) {
            //Call next to contnue processing web request
            next();
        } else {
            return Promise.reject( {
                'error' : 'The Refresh Token has Expired or the Session is invalid'
            })
        }
    }).catch((err)=> {
        console.log(err);
        res.status(401).send(err);
    });
}

/* LIST ROUTE HANDLERS */ 

/**
 * GET /lists
 * Getting all the lists that beling to the authentiated user
 */
app.get('/lists', authenticate, (req, res) => {
    List.find({ _userId: req.user_id }).then((lists) => {
        res.send(lists);
    });
});

/**
 * POST /lists
 * Create a new List and return the list
 */
app.post('/lists', authenticate, (req, res) => {
    let title = req.body.title;
    let newList = new List({
        title,
        _userId: req.user_id
    });

    newList.save().then((listDoc) => {
        //Full list Document is returned
        res.send(listDoc);
    })
});

/**
 * PATCH /lists/:id
 * Update the list with the id :id
 */
app.patch('/lists/:id', authenticate, (req, res) => {
    List.findOneAndUpdate({ _id: req.params.id, _userId: req.user_id }, { $set: req.body }).then(() => {
        res.sendStatus(200);
    });
});

/**
 * DELETE /lists/:id
 * Delete the list and return it
 */
app.delete('/lists/:id', authenticate, (req, res) => {
    List.findByIdAndDelete({ _id: req.params.id, _userId: req.user_id }).then((deletedList) => {
        deleteTasksFromList(deletedList._id);
        //Delete Tasks from the list
        res.send(deletedList);
    });
});

/* TASK ROUTES */

/**
 * GET /lists/:listId/tasks
 * Get all Tasks in the particular List
 */
app.get('/lists/:listId/tasks', authenticate, (req, res) => {
    Task.find({ _listId: req.params.listId }).then((tasks) => {
        res.send(tasks);
    });
});

/**
 * GET /lists/:listId/tasks/:taskId
 * Get a particular Task From a list
 */

app.get('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
    Task.findOne({ _id: req.params.taskId, _listId: req.params.listId }).then((taskDoc) => {
        res.send(taskDoc);
    });
});

/**
 * POST /lists/:listId/tasks
 * Add a task to a list and return the task
 */

app.post('/lists/:listId/tasks', authenticate, (req, res) => {
    List.findOne({ _id: req.params.listId, _userId: req.user_id }).then((list) => {
        //List belongs to user so user can create task
        if(list) return true;
        else return false;
    }).then((canCreateTask) => {
        if(canCreateTask) {
            let newTask = new Task({
                title: req.body.title,
                _listId: req.params.listId,
                completed: false
            });
            newTask.save().then((newTaskDoc) => {
                res.send(newTaskDoc);
            });
        } else {
            res.sendStatus(404);
        }
    })

});

/**
 * PATCH /lists/:listId/tasks/:taskId
 * Edit a task
 */

app.patch('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
    List.findOne({ _id: req.params.listId, _userId: req.user_id }).then((list) => {
        //List belongs to user so user can create task
        if(list) return true;
        else return false;
    }).then((canUpdateTask) => {
        if(canUpdateTask) {
            Task.findOneAndUpdate({ _id: req.params.taskId, _listId: req.params.listId }, { $set: req.body }).then((task) => {
                res.send(task);
            });
        } else {
            res.sendStatus(404);
        }
    })
});

/**
 * DELETE /lists/:listId/tasks/:taskId
 * Delete a Task
 */

app.delete('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
    List.findOne({ _id: req.params.listId, _userId: req.user_id }).then((list) => {
        //List belongs to user so user can create task
        if(list) return true;
        else return false;
    }).then((canDeleteTask) => {
        if(canDeleteTask) {
            Task.findOneAndDelete({ _id: req.params.taskId, _listId: req.params.listId }).then((deletedTask) => {
                res.send(deletedTask);
            });
        } else {
            res.sendStatus(404);
        }
    })
    
});

/* USER ROUTES */

/**
 * POST /users
 * Creates a New User
 */

app.post('/users', (req, res) => {
    let body = req.body;
    let newUser = new User(body);

    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        return newUser.generateAccessAuthToken().then((accessToken) => {
            return { accessToken, refreshToken };
        })
    }).then((authToken) => {
        console.log(newUser);
        res.header('x-refresh-token', authToken.refreshToken).header('x-access-token', authToken.accessToken).send(newUser);
    }).catch((err) => {
        console.log(err);
        res.status(400).send(err);
    })
});

/**
 * POST /users/login
 * Login Route
 */

app.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
     
    return User.findByCredentials(email, password).then((user) => {
        user.createSession().then((refreshToken) => {
            return user.generateAccessAuthToken().then((accessToken) => {
                return { accessToken, refreshToken };
            })
        }).then((authToken) => {
            res.header('x-access-token', authToken.accessToken).header('x-refresh-token', authToken.refreshToken).send(user);
        })
    }).catch((err) => {
        res.status(400).send(err);
    })
});

/**
 * GET /users/me/auth-token
 * Genrates a new auth token when called
 */

app.get('/users/me/access-token', verifySessionValid,  (req, res) => {
//We know that user is autheneticated and user id is available
req.userObject.generateAccessAuthToken().then((accessToken) => {
    res.header('x-access-token', accessToken).send({ accessToken });
}).catch((err) => {
    console.log(err);
    res.status(400).send(err);
})
})

app.listen(3000, () => {
    console.log('Server Listening on port 3000');
});

/* HELPER METHODS */

deleteTasksFromList = function(listId) {
    Task.deleteMany({_listId: listId}).then(()=>{
        console.log('Tasks From ' + listId + 'were deleted');
    });
}