class PhotoPostsController {

    constructor(posts) {
        localStorage.user ? this.isLogIn = true : this.isLogIn = false;

        this.posts = posts;
        this.feed = document.getElementById('feed');
        this.setFiltersData();
    }

    showPhotoPostsElement() {
        this.posts.forEach(post => this.feed.append(this.createPhotoPostElement(post)));
        this.setButtonsDisplay();
    }

    addPhotoPost(post) {
        if (photoPosts.addPhotoPost(post)) {
            this.reload(0, this.posts.length);
        }
    }

    removePhotoPost(id) {
        if (photoPosts.removePhotoPost(id)) {
            if (this.posts.some(post => post.id === id)) {
                this.reload(0, this.posts.length - 1);
            }
        }
    }

    editPhotoPost(id, post) {
        if (photoPosts.editPhotoPost(id, post)) {
            this.posts.forEach(item => {
                if (item.id === id) {
                    for (let key in post) {
                        item[key] = post[key];
                    }
                    this.replaceDomPost(item);
                }
            });
        }
    }

    replaceDomPost(newPost) {
        let post = document.getElementById(newPost.id);
        post.parentNode.replaceChild(this.createPhotoPostElement(newPost), post);
        this.setButtonsDisplay();
    }

    async reload(skip = 0, top = 10, filterConfig) {
        fetch('/getPhotoPosts?skip=' + skip + '&top=' + top, {
            method: 'POST',
            body: filterConfig,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            res.json().then(posts => {
                this.posts = posts;
                this.deleteDomPosts();
                this.showPhotoPostsElement();
            })
        })
    }


    loadMore(filterConfig) {
        this.reload(0, this.posts.length + 3, filterConfig);
    }

    deleteDomPosts() {
        while (feed.firstChild)
            feed.removeChild(feed.firstChild);
    }

    createPhotoPostElement(photoPost) {
        let post = document.createElement('div');
        post.setAttribute('id', photoPost.id);
        post.classList.add('post');

        let top = document.createElement('div');
        top.classList.add('post-top');

        let author = document.createElement('span');
        author.classList.add('post-username');
        author.textContent = photoPost.author;
        top.append(author);

        let date = document.createElement('span');
        date.classList.add('time');
        date.textContent = new Date(photoPost.createdAt).toDateString();
        top.append(date);
        post.append(top);

        let img = document.createElement('img');
        img.classList.add('post-image');
        img.setAttribute('src', photoPost.photoLink);
        post.append(img);

        let toolbar = document.createElement('div');
        toolbar.classList.add('toolbar');

        let heart = document.createElement('div');
        let i = document.createElement('i');
        i.className = 'fas fa-heart';
        heart.classList.add('small-image');
        heart.appendChild(i);
        toolbar.append(heart);

        if (photoPosts.hasMyLike(photoPost.id)) {
            heart.querySelector('.fa-heart').style.color = 'red';
        } else {
            heart.querySelector('.fa-heart').style.color = 'black';
        }

        heart.addEventListener('click', () => {
            if (this.isLogIn) {
                if (photoPosts.likePhotoPost(photoPost.id)) {
                    heart.querySelector('.fa-heart').style.color = 'red';
                } else {
                    heart.querySelector('.fa-heart').style.color = 'black';
                }
            }
        });

        if (photoPost.author === localStorage.user) {
            img = document.createElement('img');
            img.classList.add('small-image');
            img.setAttribute('src', 'images/trash.png');
            toolbar.append(img);

            img.addEventListener('click', () => {
                this.removePhotoPost(photoPost.id);
                this.reload();
            });

            img = document.createElement('img');
            img.classList.add('small-image');
            img.setAttribute('src', 'images/edit.png');

            let editModal = document.querySelector('#editModal');

            img.addEventListener('click', () => {
                editModal.style.display = 'block';
                editModal.querySelector('input[name=name]').value = photoPost.author;
                editModal.querySelector('input[name=date]').value = photoPost.createdAt;
                editModal.querySelector('img').src = photoPost.photoLink;
                editModal.querySelector('textarea').innerText = photoPost.description;

                for (let hashtag of photoPost.hashtags) {
                    let hashtagElement = document.querySelector('.hashtag').cloneNode(true);
                    let hashtagList = editModal.querySelector('.hashtag-list');

                    hashtagElement.querySelector('span').innerText = hashtag;
                    hashtagElement.style.display = 'flex';
                    hashtagElement.querySelector('.hashtag-icon').addEventListener('click', () => {
                        photoPost.hashtags = photoPost.hashtags.filter(x => x !== hashtag);
                        hashtagList.removeChild(hashtagElement);
                    });
                    hashtagList.appendChild(hashtagElement);
                }

                editModal.querySelector('input[name=hashtags]').addEventListener('change', () => {
                    let value = editModal.querySelector('input[name=hashtags]').value;
                    let hashtagElement = document.querySelector('.hashtag').cloneNode(true);
                    let hashtagList = editModal.querySelector('.hashtag-list');

                    if (value !== '') {
                        hashtagElement.querySelector('span').innerText = value;
                        hashtagElement.style.display = 'flex';
                        hashtagElement.querySelector('.hashtag-icon').addEventListener('click', () => {
                            photoPost.hashtags = photoPost.hashtags.filter(x => x !== value);
                            hashtagList.removeChild(hashtagElement);
                        });
                        photoPost.hashtags.push(value);
                        hashtagList.appendChild(hashtagElement);
                    }
                })

                editModal.querySelector('#editButton').addEventListener('click', () => {
                    this.editPhotoPost(photoPost.id, {
                        description: editModal.querySelector('textarea').value,
                        hashtags: photoPost.hashtags
                    });
                    editModal.style.display = 'none';
                })
            });

            window.onclick = function (event) {
                if (event.target === editModal) {
                    editModal.style.display = 'none';
                }
            };

            toolbar.append(img);
        }

        post.append(toolbar);

        let bar = document.createElement('div');
        bar.classList.add('description-bar');

        let description = document.createElement('p');
        description.classList.add('description');
        description.textContent = photoPost.description;
        bar.append(description);

        let hashtags = document.createElement('p');
        hashtags.textContent = photoPost.hashtags.join('');
        bar.append(hashtags);
        post.append(bar);

        return post;
    }

    logIn(user, password) {
        if (!this.isLogIn && user !== undefined) {
            if (photoPosts.getUsers().find(x => x.username === user && x.password === password)) {
                this.isLogIn = true;

                localStorage.setItem('user', user);
                let username = document.getElementById('username');
                let logOut = document.getElementById('log-out');
                logOut.style.display = 'block';

                let logIn = document.getElementById('log-in');
                logIn.style.display = 'none';

                username.textContent = localStorage.getItem('user');
                this.setButtonsDisplay();
                this.reload();

                return true;
            }
        }
        return false;
    }

    logOut() {
        if (this.isLogIn) {
            this.isLogIn = false;

            localStorage.setItem('user', '');
            let username = document.getElementById('username');
            let logOut = document.getElementById('log-out');
            logOut.style.display = 'none';

            let logIn = document.getElementById('log-in');
            logIn.style.display = 'block';

            username.textContent = 'Guest';
            this.setButtonsDisplay();
            this.reload();
        }
    }

    setButtonsDisplay() {
        let newPostButton = document.getElementById('new-post');
        newPostButton.style.display = this.isLogIn ? 'block' : 'none';

        var toolbars = document.body.querySelectorAll('.toolbar');
        toolbars.forEach(toolbar => {
            let imgs = toolbar.querySelectorAll('img');
            imgs.forEach(item => item.style.display = this.isLogIn ? 'block' : 'none');
        });
    }

    setFiltersData() {
        let authors = photoPosts.getAuthors();
        let hashtags = photoPosts.getHashtags();
        let authorsList = document.getElementById('authors');
        let hashtagsList = document.getElementById('hashtags');

        authors.forEach(author => {
            let option = document.createElement('option');
            option.setAttribute('value', author);
            authorsList.append(option);
        });

        hashtags.forEach(author => {
            let option = document.createElement('option');
            option.setAttribute('value', author);
            hashtagsList.append(option);
        });
    }
}