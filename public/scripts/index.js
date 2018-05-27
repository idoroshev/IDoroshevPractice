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

    save() {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'updatePosts');
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.send(JSON.stringify(this.photoPosts));
    }

    getPhotoPosts(skip = 0, top = 10, filterConfig) {
      return new Promise((resolve) => {
	      let xhr = new XMLHttpRequest();
	      xhr.open('POST', '/getPhotoPosts?offset=' + skip + '&top=' + top);
	      xhr.setRequestHeader('Content-type', 'application/json');

	      xhr.onload = () => {
	      	if (xhr.status === 200) {
			    resolve(xhr.responseText);
	      	}
	      };
	      xhr.send(JSON.stringify(filterConfig));
      }).then(data => JSON.parse(data));
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

   addPhotoPost(object, file) {
	   if (this.validatePhotoPost(object) && this.isUniqueId(object.id)) {
		   return new Promise((resolve, reject) => {
			   let xhr = new XMLHttpRequest();
			   xhr.open('POST', '/addPhotoPost');
			   xhr.setRequestHeader('Accept', 'application/json');

			   const formPost = new FormData();
			   formPost.append('image', file);
			   formPost.append('post', JSON.stringify(object));

			   xhr.onload = () => {
				   if (xhr.status === 200) {
					   resolve(xhr.responseText);
				   } else {
					   reject(new Error(xhr.statusText));
				   }
			   };

			   xhr.send(formPost);
		   }).then((post) => {
			   this.photoPosts.push(JSON.parse(post));
		   })
			   .catch((error) => {
				   throw error;
			   });
	   }
    }

    clonePost(post) {
        var clone = {};
        for (let key in post) {
            clone[key] = post[key];
        }
        return clone;
    }

    async editPhotoPost(id, newInfo) {
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
                    await this.save();
                    return true;
                }
            }
        }
        return false;
    }

    async removePhotoPost(id) {
        for (let i = 0; i < this.photoPosts.length; i++) {
            if (this.photoPosts[i].id === id) {
                this.photoPosts.splice(i, 1);
                await this.save();
                return true;
            }
        }
        return false;
    }

    async likePhotoPost(id) {
        let likeAdded = false;
        let photoPost = this.getPhotoPost(id);
        if (this.hasMyLike(id)) {
            photoPost.likes = photoPost.likes.filter(x => x !== localStorage.user);
        } else {
            photoPost.likes.push(localStorage.user);
            likeAdded = true;
        }

        await this.save();
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
