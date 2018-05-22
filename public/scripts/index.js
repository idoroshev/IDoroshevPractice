var author = 'author';
var hashtags = 'hashtags';
var unchangeable = new Set(['id', 'author', 'createdAt', 'likes']);

window.PhotoPosts = class PhotoPosts {

    constructor(posts) {
        this.photoPosts = posts;
        this.template = {
            id: 'string',
            description: 'string',
            author: 'string',
            createdAt: 'object',
            photoLink: 'string',
        };
        this.maxLength = 200;
        this.users = [
            {
                username: 'Elon',
                password: '123'
            },
            {
                username: 'Ihar',
                password: '321'
            }
        ];

    }

    async save() {
        await fetch('/updatePosts', {
            method: 'POST',
            body: JSON.stringify(this.photoPosts),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    async getPhotoPosts(skip = 0, top = 10, filterConfig) {
        await fetch('/getPhotoPosts?offset=' + skip + '&top=' + top, {
            method: 'POST',
            body: filterConfig,
            headers: {
            'Content-Type': 'application/json'
            }
        })
    }

    getPhotoPost(id) {
        for (let i = 0; i < this.photoPosts.length; i++) {
            if (this.photoPosts[i].id === id) {
                return this.photoPosts[i];
            }
        }
        return null;
    }

    getAuthors() {
        let authors = new Set();
        posts.filter(post => {
            if (!authors.has(post.author))
                authors.add(post.author);
        });
        return authors;
    }

    getHashtags() {
        let hashtags = new Set();
        posts.filter(post => {
            post.hashtags.forEach(hashtag => {
                if (!hashtags.has(hashtag))
                    hashtags.add(hashtag);
            });
        });
        return hashtags;
    }

    validatePhotoPost(post) {
        for (let key in this.template) {
            if (!post.hasOwnProperty(key)) {
                throw new Error(`Empty field: ${key}`);
            }
            if ((typeof post[key] !== this.template[key] || post[key] === '') && key !== 'createdAt') {
                throw new Error(`Invalid type: ${key}`);
            }
        }
        return true;
    }

    addPhotoPost(object) {
        if (this.validatePhotoPost(object) && this.isUniqueId(object.id)) {
            this.photoPosts.push(object);
            this.save();
            return true;
        }
        return false;
    }

    clonePost(post) {
        var clone = {};
        for (let key in post) {
            clone[key] = post[key];
        }
        return clone;
    }

    editPhotoPost(id, newInfo) {
        for (let key in newInfo) {
            if (unchangeable.has(key)) {
                throw new Error(`You can't change field: ${key}`);
            }
        }
        for (let i = 0; i < this.photoPosts.length; i++) {
            if (this.photoPosts[i].id === id) {
                var clone = this.clonePost(this.photoPosts[i]);
                if (this.validatePhotoPost(Object.assign(clone, newInfo))) {
                    Object.assign(this.photoPosts[i], newInfo);
                    this.save();
                    return true;
                }
            }
        }
        return false;
    }

    removePhotoPost(id) {
        for (let i = 0; i < this.photoPosts.length; i++) {
            if (this.photoPosts[i].id === id) {
                this.photoPosts.splice(i, 1);
                this.save();
                return true;
            }
        }
        return false;
    }

    likePhotoPost(id) {
        let likeAdded = false;
        let photoPost = this.getPhotoPost(id);
        if (this.hasMyLike(id)) {
            photoPost.likes = photoPost.likes.filter(x => x !== localStorage.user);
        } else {
            photoPost.likes.push(localStorage.user);
            likeAdded = true;
        }

        this.save();
        return likeAdded;
    }

    hasMyLike(id) {
        if (localStorage.user !== null) {
            let photoPost = this.getPhotoPost(id);
            if (!photoPost.likes) return false;
            for (let user of photoPost.likes) {
                if (user === localStorage.user) {
                    return true;
                }
            }
            return false;
        }
        return false;
    }

    intersection(a, b) {
        return a.some(function (item) {
            return b.indexOf(item) >= 0;
        });
    }

    isUniqueId(id) {
        for (let i = 0; i < this.photoPosts.length; i++) {
            if (this.photoPosts[i].id === id) {
                return false;
            }
        }
        return true;
    }

    getUsers() {
        return this.users;
    }
}

var posts = [];