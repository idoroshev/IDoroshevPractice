(function() {

	var author = "author";
	var hashtags = "hashtags";
	var unchangeable = new Set(["id", "author", "createdAt", "likes"]);

	class PhotoPosts {

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
		}

		getPhotoPosts(skip = 0, top = 10, filterConfig) {
			posts = [];
			if (filterConfig != undefined) {
				for (let i = 0; i < this.photoPosts.length; i++) {
					if (author in filterConfig && hashtags in filterConfig) {
						if (this.photoPosts[i].author === filterConfig.author && this.intersection(filterConfig.hashtags, this.photoPosts[i].hashtags)) {
							posts.push(this.photoPosts[i]);
						}
					} else if (author in filterConfig) {
						if (this.photoPosts[i].author === filterConfig.author) {
							posts.push(this.photoPosts[i]);
						}
					} else if (hashtags in filterConfig) {
						if (this.intersection(filterConfig.hashtags, this.photoPosts[i].hashtags)) {
							posts.push(this.photoPosts[i]);
						}
					}
				}
			} else {
				var posts = this.photoPosts.slice();
			}
			posts.sort(function(a, b) {
				return Date.parse(a.createdAt) - Date.parse(b.createdAt);
			});
			return posts.slice(skip, skip + top);
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
				if (typeof post[key] !== this.template[key] || post[key] == "") {
					throw new Error(`Invalid type: ${key}`);
				}
				if (post[key].constructor.name === 'description' && post[key] > maxLength) {
					throw new Error('Description must be less than 200 characters');
				}
			}
			return true;
		}

		addPhotoPost(object) {
			if (this.validatePhotoPost(object) && this.isUniqueId(object.id)) {
				this.photoPosts.push(object);
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
					return true;
				}
			}
			return false;
		}

		intersection(a, b) {
			return a.some(function(item) {
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
	}

	var posts = [
	{
		id: "1",
		description: "funny picture with a squirrel",
		createdAt: new Date('2018-04-04'),
		author: "Ihar Dorashau",
		photoLink: "images/image01.jpg",
		hashtags: ["#squirrel", "#funny"],
		likes: ["Elon Musk", "Donald Trump", "Anonymous"]
	},
	{
		id: "2",
		description: "funny picture with a monkey",
		createdAt: new Date('2018-03-03'),
		author: "Ivan Petrov",
		photoLink: "images/image02.jpg",
		hashtags: ["#monkey"],
		likes: ["Elon Musk", "Ihar Dorashau"]
	},
	{
		id: "3",
		description: "beautiful picture with a wolf",
		createdAt: new Date('2018-02-02'),
		author: "Ihar Dorashau",
		photoLink: "images/image03.jpg",
		hashtags: ["#wolf", "#water"],
		likes: ["Elon Musk", "Donald Trump", "Ivan Petrov"]
	},
	{
		id: "4",
		description: "horrible clown from cool remake",
		createdAt: new Date('2018-01-01'),
		author: "Elon Musk",
		photoLink: "images/image04.png",
		hashtags: ["#it", "#clown", "#pennywise"],
		likes: ["Arseny", "Donald Trump", "Ihar Dorashau"]
	},
	{
		id: "5",
		description: "beautiful scenery",
		createdAt: new Date('2018-04-04'),
		author: "Ihar Dorashau",
		photoLink: "images/image05.jpg",
		hashtags: ["#scenery", "#beautiful"],
		likes: ["Elon Musk", "Donald Trump", "Arseny"]
	},
	{
		id: "6",
		description: "funny picture with a squirrel",
		createdAt: new Date('2018-04-04'),
		author: "Ihar Dorashau",
		photoLink: "images/image01.jpg",
		hashtags: ["#squirrel", "#funny"],
		likes: ["Elon Musk", "Donald Trump", "Anonymous"]
	},
	{
		id: "7",
		description: "funny picture with a monkey",
		createdAt: new Date('2018-03-03'),
		author: "Ivan Petrov",
		photoLink: "images/image02.jpg",
		hashtags: ["#monkey"],
		likes: ["Elon Musk", "Ihar Dorashau"]
	},
	{
		id: "8",
		description: "beautiful picture with a wolf",
		createdAt: new Date('2018-02-02'),
		author: "Ihar Dorashau",
		photoLink: "images/image03.jpg",
		hashtags: ["#wolf", "#water"],
		likes: ["Elon Musk", "Donald Trump", "Ivan Petrov"]
	},
	{
		id: "9",
		description: "horrible clown from cool remake",
		createdAt: new Date('2018-01-01'),
		author: "Elon Musk",
		photoLink: "images/image04.png",
		hashtags: ["#it", "#clown", "#pennywise"],
		likes: ["Arseny", "Donald Trump", "Ihar Dorashau"]
	},
	{
		id: "10",
		description: "beautiful scenery",
		createdAt: new Date('2018-04-04'),
		author: "Ihar Dorashau",
		photoLink: "images/image05.jpg",
		hashtags: ["#scenery", "#beautiful"],
		likes: ["Elon Musk", "Donald Trump", "Arseny"]
	},
	{
		id: "11",
		description: "funny picture with a squirrel",
		createdAt: new Date('2018-04-04'),
		author: "Ihar Dorashau",
		photoLink: "images/image01.jpg",
		hashtags: ["#squirrel", "#funny"],
		likes: ["Elon Musk", "Donald Trump", "Anonymous"]
	},
	{
		id: "12",
		description: "funny picture with a monkey",
		createdAt: new Date('2018-03-03'),
		author: "Ivan Petrov",
		photoLink: "images/image02.jpg",
		hashtags: ["#monkey"],
		likes: ["Elon Musk", "Ihar Dorashau"]
	},
	{
		id: "13",
		description: "beautiful picture with a wolf",
		createdAt: new Date('2018-02-02'),
		author: "Ihar Dorashau",
		photoLink: "images/image03.jpg",
		hashtags: ["#wolf", "#water"],
		likes: ["Elon Musk", "Donald Trump", "Ivan Petrov"]
	},
	{
		id: "14",
		description: "horrible clown from cool remake",
		createdAt: new Date('2018-01-01'),
		author: "Elon Musk",
		photoLink: "images/image04.png",
		hashtags: ["#it", "#clown", "#pennywise"],
		likes: ["Arseny", "Donald Trump", "Ihar Dorashau"]
	},
	{
		id: "15",
		description: "beautiful scenery",
		createdAt: new Date('2018-04-04'),
		author: "Ihar Dorashau",
		photoLink: "images/image05.jpg",
		hashtags: ["#scenery", "#beautiful"],
		likes: ["Elon Musk", "Donald Trump", "Arseny"]
	},
	{
		id: "16",
		description: "funny picture with a squirrel",
		createdAt: new Date('2018-04-04'),
		author: "Ihar Dorashau",
		photoLink: "images/image01.jpg",
		hashtags: ["#squirrel", "#funny"],
		likes: ["Elon Musk", "Donald Trump", "Anonymous"]
	},
	{
		id: "17",
		description: "funny picture with a monkey",
		createdAt: new Date('2018-03-03'),
		author: "Ivan Petrov",
		photoLink: "images/image02.jpg",
		hashtags: ["#monkey"],
		likes: ["Elon Musk", "Ihar Dorashau"]
	},
	{
		id: "18",
		description: "beautiful picture with a wolf",
		createdAt: new Date('2018-02-02'),
		author: "Ihar Dorashau",
		photoLink: "images/image03.jpg",
		hashtags: ["#wolf", "#water"],
		likes: ["Elon Musk", "Donald Trump", "Ivan Petrov"]
	},
	{
		id: "19",
		description: "horrible clown from cool remake",
		createdAt: new Date('2018-01-01'),
		author: "Elon Musk",
		photoLink: "images/image04.png",
		hashtags: ["#it", "#clown", "#pennywise"],
		likes: ["Arseny", "Donald Trump", "Ihar Dorashau"]
	},
	{
		id: "20",
		description: "beautiful scenery",
		createdAt: new Date('2018-04-04'),
		author: "Ihar Dorashau",
		photoLink: "images/image05.jpg",
		hashtags: ["#scenery", "#beautiful"],
		likes: ["Elon Musk", "Donald Trump", "Arseny"]
	}
	

];	





	window.photoPosts = new PhotoPosts(posts);
	/*console.log('getPhotoPost with id = 10');
	console.log(PhotoPosts.getPhotoPost('10'));
	console.log('getPhotoPost with invalid id(type = number)');
	console.log(PhotoPosts.getPhotoPost(10));

	// addPhotoPost
	console.log('addPhotoPost with id = 21');
	console.log(PhotoPosts.addPhotoPost({
		id: '21',
		description: 'Scenery',
		createdAt: new Date('2018-04-04'),
		author: 'Ihar Dorashau',
		photoLink: 'images/image05.jpg',
		hashtags: ['#scenery']
	}));
	try {
		console.log('addPhotoPost with invalid id(type = number)');
		console.log(PhotoPosts.addPhotoPost({
		id: 22,
		description: 'Scenery',
		createdAt: new Date('2018-04-04'),
		author: 'Ihar Dorashau',
		photoLink: 'images/image05.jpg',
		hashtags: ['#scenery']
	}));
	} catch(e) {
		console.error(e);
	}

	// editPhotoPost 
	console.log('editPhotoPost valid information');
	console.log(PhotoPosts.editPhotoPost('21', {description: "valid information"}));
	try {
		console.log('editPhotoPost with unchangeable property');
		console.log(PhotoPosts.editPhotoPost('21', {
		id: '21'
	}));
	} catch(e) {
		console.error(e);
	}

	// removePhotoPost
	console.log('removePhotoPost with id = 21');
	console.log(PhotoPosts.removePhotoPost('21'));
	console.log('removePhotoPost with the id of which does not exist');
	console.log(PhotoPosts.removePhotoPost('21'));

	// getPhotoPosts
	console.log('getPhotoPost by author Ihar Dorashay');
	var posts = PhotoPosts.getPhotoPosts(0, 10, {author: "Ihar Dorashau"});
	for (let i = 0; i < posts.length; ++i) {
		console.log(posts[i]);
	}*/
	
})();