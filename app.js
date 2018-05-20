const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.listen(8081, (err) => {
    if (err) {
        throw err;
    }
    console.log('Server is listening on port 8081');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/posts.json', (req, res) => {
    fs.readFile(path.join(__dirname, 'public/posts.json'), (err, data) => {
        res.json(data);
        res.end();
    })
});

app.get('/getPhotoPost', async (req, res) => {
    let id = req.query.id;

    let posts = await readFile();
    for (let i = 0; i < posts.length; i++) {
        if (posts[i].id === id) {
            res.writeHead(200, {'content-type': 'application/json'});
            res.write(JSON.stringify(posts[i]));
            return res.end();
        }
    }
    res.end();
});

app.get('/authors', (req, res) => {
    fs.readFile(path.join(__dirname, 'public/users.json'), 'utf8', (err, data) => {
        if (err) throw err;
        res.json(data);
        res.end();
    });
});

app.get('/hashtags', (req, res) => {
    readFile().then(posts => {
        let hashtags = new Set();

        for (let post of posts) {
            for (let i = 0; i < post.hashtags.length; i++) {
                hashtags.add(post.hashtags[i]);
            }
        }
        let response = Array.from(hashtags);
        res.json(JSON.stringify(response));
        res.end();
    });
});

app.post('/getPhotoPosts', (req, res) => {
    let skip = req.query.skip;
    let top = req.query.top;
    let filterConfig = req.body;

    fs.readFile(path.join(__dirname, 'public/posts.json'), (err, data) => {
        if (err) throw err
        let posts = JSON.parse(data)

        posts = posts.filter(x => !x.deleted)

        if (filterConfig !== undefined) {
            if (filterConfig.hashtags) {
                for (let hashtag of filterConfig.hashtags) {
                    posts = posts.filter(x => {
                        return this.intersection([hashtag], x.hashtags);
                    });
                }

            }

            if (filterConfig.author) {
                posts = posts.filter(x => x.author.includes(filterConfig.author));
            }

            if (filterConfig.dateFrom) {
                posts = posts.filter(x => x.createdAt > filterConfig.dateFrom);
            }

            if (filterConfig.dateTo) {
                posts = posts.filter(x => x.createdAt < filterConfig.dateTo);
            }

        }
        posts.sort(function (a, b) {
            return Date.parse(b.createdAt) - Date.parse(a.createdAt);
        });
        posts.slice(skip, skip + top);

        res.json(posts);
        res.end();
    })
});

app.post('/updatePosts', (req, res) => {
    let posts = req.body;
    fs.writeFile(path.join(__dirname, 'public/posts.json'), JSON.stringify(posts), (err) => {
        console.log(err);
        res.end();
    });
});

app.post('/addPhotoPost', (req, res) => {
    let postToAdd = req.body;

    let date = new Date(postToAdd.createdAt);
    postToAdd.createdAt = date;

    postToAdd.id = Date.now().toString();
    postToAdd.deleted = false;

    try {
        if (validatePhotoPost(postToAdd)) {
            readFile().then(posts => {
                posts.push(postToAdd);
                fs.writeFile(path.join(__dirname, 'public/posts.json'), JSON.stringify(posts), () => {
                    res.end();
                });
            })
        }

    } catch (e) {
        res.writeHead(500);
        res.end();
    }
});

app.post('/likePhotoPost', async (req, res) => {
    let id = req.query.id;
    let user = req.query.user;
    let posts = await readFile();
    let post = posts.find(x => x.id === id);

    if (!user) {
        res.status(401);
        res.end();
        return;
    }

    if (post.likes) {
        let hasMyLike = !!post.likes.find(x => x.nickname === user);

        if (!hasMyLike) {
            post.likes.push({nickname: user});
        } else {
            post.likes = post.likes.filter(x => x.nickname !== user);
        }
    } else {
        post.likes = [user];
    }

    writeFile(posts);
    res.json(post.likes.length);
    res.end();
});

app.put('/editPhotoPost', (req, res) => {
    const unchangeable = new Set(['id', 'author', 'createdAt', 'likes']);

    let id = req.query.id;
    let newInfo = req.body;

    for (let key in newInfo) {
        if (unchangeable.has(key)) {
            res.writeHead(500);
            res.end();
        }
    }
    readFile().then(posts => {
        for (let i = 0; i < posts.length; i++) {
            if (posts[i].id === id) {
                var clone = clonePost(posts[i]);
                if (validatePhotoPost(Object.assign(clone, newInfo))) {
                    Object.assign(posts[i], newInfo);
                    fs.writeFile(path.join(__dirname, 'public/posts.json'), JSON.stringify(posts), () => {
                        res.end();
                    })
                }
            }
        }
    });
});

app.delete('/removePhotoPost', (req, res) => {
    let id = req.query.id;

    readFile().then(posts => {
        for (let i = 0; i < posts.length; i++) {
            if (posts[i].id === id) {
                posts.splice(i, 1);
                fs.writeFile(path.join(__dirname, 'public/posts.json'), JSON.stringify(posts), () => {
                    res.end();
                })
                return;
            }
        }
        res.end();
    });
});


function clonePost(post) {
    var clone = {};
    for (let key in post) {
        clone[key] = post[key];
    }
    return clone;
}

function readFile() {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, 'public/posts.json'), (err, data) => {
            if (err) {
                return reject(err);
            }
            let posts = JSON.parse(data);
            resolve(posts);
        })
    })
}

function writeFile(posts) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path.join(__dirname, 'public/posts.json'), JSON.stringify(posts), (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        })
    })
}

let template = {
    id: 'string',
    description: 'string',
    author: 'string',
    createdAt: 'object',
    photoLink: 'string',
};

function validatePhotoPost(post) {
    for (let key in template) {
        if (!post.hasOwnProperty(key)) {
            throw new Error(`Empty field: ${key}`);
        }
        if ((typeof post[key] !== template[key] || post[key] === '') && key !== 'createdAt') {
            throw new Error(`Invalid type: ${key}`);
        }
    }
    return true;
}