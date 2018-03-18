(function() {

	class PhotoPostsController {

		constructor() {
			this.user = 'Ihar Dorashau';
			this.isLogIn = false;
			this.posts = [];
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

		downloadPhotoPosts(skip = 0, top = 10, filterConfig) {
			this.posts = this.posts.concat(photoPosts.getPhotoPosts(skip, top, filterConfig));
		}

		reload(skip, top, filterConfig) {
			this.posts = photoPosts.getPhotoPosts(skip, top, filterConfig);
			this.deleteDomPosts();
			this.showPhotoPostsElement();
		}

		deleteDomPosts() {
			while(feed.firstChild) 
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
			date.textContent = photoPost.createdAt;
			top.append(date);
			post.append(top);

			let img = document.createElement('img');
			img.classList.add('post-image');
			img.setAttribute('src', photoPost.photoLink);
			post.append(img);

			let toolbar = document.createElement('div');
			toolbar.classList.add('toolbar');

			img = document.createElement('img');
			img.classList.add('small-image');
			img.setAttribute('src', 'images/heart.png');
			toolbar.append(img);

			img = document.createElement('img');
			img.classList.add('small-image');
			img.setAttribute('src', 'images/trash.png');
			toolbar.append(img);

			img = document.createElement('img');
			img.classList.add('small-image');
			img.setAttribute('src', 'images/edit.png');
			toolbar.append(img);
			post.append(toolbar);

			let bar = document.createElement('div');
			bar.classList.add('description-bar');

			let description = document.createElement('p');
			description.classList.add('description');
			description.textContent = photoPost.description;
			bar.append(description);

			let hashtags = document.createElement('p');
			hashtags.classList.add('hashtags');
			hashtags.textContent = photoPost.hashtags.join('');
			bar.append(hashtags);
			post.append(bar);

			return post;
		}

		logIn() {
			this.isLogIn = true;
			this.user = 'Ihar Dorashau';
			let username = document.getElementById('username');
			let log = document.getElementById('log-in-out');
			username.textContent = this.user;
			log.textContent = 'Log out';
			this.setButtonsDisplay();
		}

		logOut() {
			this.isLogIn = false;
			this.user = null;
			let username = document.getElementById('username');
			let log = document.getElementById('log-in-out');
			username.textContent = 'Guest';
			log.textContent = 'Log in'
			this.setButtonsDisplay();
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

	window.photoPostsController = new PhotoPostsController();
})();