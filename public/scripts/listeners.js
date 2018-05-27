let loginButton = document.getElementById('log-in');
let logoutButton = document.getElementById('log-out');
let loginModal = document.getElementById('logInModal');
let loadMore = document.getElementById('loadMore');

fetch('/posts.json', {method: 'GET'}).then(res => {
    return res.json().then(posts => {

        window.photoPosts = new PhotoPosts(posts);
        window.photoPostsController = new PhotoPostsController(posts);


        // set header buttons
        if (photoPostsController.isLogIn) {
            logoutButton.style.display = 'block';
            loginButton.style.display = 'none';
            document.getElementById('username').textContent = localStorage.getItem('user');
        } else {
            logoutButton.style.display = 'none';
            loginButton.style.display = 'block';
            document.getElementById('username').textContent = 'Guest';
        }

        loginButton.addEventListener('click', () => {
            loginModal.style.display = 'block';
            loginModal.querySelector('#loginButton').addEventListener('click', () => {
                let username = loginModal.querySelector('#login').value;
                let password = loginModal.querySelector('#password').value;

                if (username && password) {
                    if (photoPostsController.logIn(username, password)) {
                        loginModal.style.display = 'none';
                    } else {
                        loginModal.querySelector('#wrongInput').style.display = 'block';
                    }
                }
            });
        });

        logoutButton.addEventListener('click', () => {
            photoPostsController.logOut();
        });

        window.onclick = function (event) {
            if (event.target == loginModal) {
                loginModal.style.display = 'none';
            }
        };

        // loading posts
        photoPostsController.reload(0, 9);


        // filtering posts

        let filters = {
            hashtags: [],
            author: null,
            dateFrom: null,
            dateTo: null
        };

        loadMore.addEventListener('click', () => {
            photoPostsController.loadMore(filters);
        });

        let authorInput = document.querySelector('#authorsInput');
        authorInput.addEventListener('change', () => {
            let numberOfPosts = photoPostsController.posts.length;

            if (authorInput.value === '') {
                filters.author = null;
            } else {
                filters.author = authorInput.value;
            }
        });

        let hashtagsInput = document.querySelector('#hastagsInput');
        hashtagsInput.addEventListener('change', () => {
            let value = hashtagsInput.value;

            if (value !== '') {
                filters.hashtags.push(value);
                hashtagsInput.value = '';
                let hashtagElement = document.querySelector('.hashtag').cloneNode(true);
                let hashtagList = document.querySelector('.hashtag-list');

                hashtagElement.querySelector('span').innerText = value;
                hashtagElement.style.display = 'flex';
                hashtagElement.querySelector('.hashtag-icon').addEventListener('click', () => {
                    filters.hashtags = filters.hashtags.filter(x => x !== value);
                    hashtagList.removeChild(hashtagElement);
                });
                hashtagList.appendChild(hashtagElement);
            }
        });

        let dateFromInput = document.querySelector('#dateFrom');
        dateFromInput.addEventListener('change', () => {
            filters.dateFrom = dateFromInput.value;
        });

        let dateToInput = document.querySelector('#dateTo');
        dateToInput.addEventListener('change', () => {
            filters.dateTo = dateToInput.value;
        });


        document.querySelector('.apply-button').addEventListener('click', () => {
            photoPostsController.reload(0, 9, filters);
        });

        let newPostButton = document.getElementById('new-post');
        let createModal = document.getElementById('createModal');
        newPostButton.addEventListener('click', () => {
            createModal.style.display = 'block';
            createModal.querySelector('textarea').value = '';
            createModal.querySelector('img').src = '';
            createModal.querySelector('.hashtag-list').innerHTML = '';
            createModal.querySelector('input[name=hashtags]').value = '';
            createModal.querySelector('input[type=file]').value = null;

            let fileInput = createModal.querySelector('input');
            let img = createModal.querySelector('img');
            fileInput.addEventListener('change', () => {
                let file = fileInput.files[0];
                img.src = window.URL.createObjectURL(file);
            });

            createModal.querySelector('input[name=name]').value = localStorage.user;
            createModal.querySelector('input[name=date]').value = new Date().toDateString();


            let hashtagsToAdd = [];

            const createHashtagListener = () => {
                let value = createModal.querySelector('input[name=hashtags]').value;
                let hashtagElement = document.querySelector('.hashtag').cloneNode(true);
                let hashtagList = createModal.querySelector('.hashtag-list');

                if (value !== '') {
                    hashtagElement.querySelector('span').innerText = value;
                    hashtagElement.style.display = 'flex';
                    hashtagElement.querySelector('.hashtag-icon').addEventListener('click', () => {
                        hashtagsToAdd = hashtagsToAdd.filter(x => x !== value);
                    hashtagList.removeChild(hashtagElement);
                });
                    hashtagList.appendChild(hashtagElement);
                    hashtagsToAdd.push(value);
                }

            };
            createModal.querySelector('input[name=hashtags]').addEventListener('change', createHashtagListener);
            const createButtonListener = () => {

            	const post = {
		            id: Date.now().toString(),
		            createdAt: new Date(),
		            hashtags: hashtagsToAdd,
		            author: localStorage.user,
		            photoLink: 'link',
		            description: createModal.querySelector('textarea').value,
		            likes: [],
		            deleted: false
	            };

                photoPostsController.addPhotoPost(post, fileInput.files[0]);
                createModal.style.display = 'none';
                createModal.querySelector('#createButton').removeEventListener('click', createButtonListener);
                createModal.querySelector('input[name=hashtags]').removeEventListener('change', createHashtagListener);
            };
            createModal.querySelector('#createButton').addEventListener('click', createButtonListener);

        });
    });
});
