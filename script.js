// Personal Blog JavaScript
class BlogManager {
    constructor() {
        this.posts = [];
        this.filteredPosts = [];
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.currentFilter = 'all';
        
        this.init();
    }

    async init() {
        await this.loadPosts();
        this.setupEventListeners();
        this.renderPosts();
        this.setupSmoothScrolling();
    }

    async loadPosts() {
        try {
            const response = await fetch('./posts.json');
            const data = await response.json();
            this.posts = data.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
            this.filteredPosts = [...this.posts];
        } catch (error) {
            console.error('Error loading posts:', error);
            this.showError('Failed to load blog posts. Please try again later.');
        }
    }

    setupEventListeners() {
        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterPosts(category);
                
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.currentPage++;
                this.renderPosts(true);
            });
        }

        // Search functionality (if search input exists)
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchPosts(e.target.value);
            });
        }
    }

    filterPosts(category) {
        this.currentFilter = category;
        this.currentPage = 1;
        
        if (category === 'all') {
            this.filteredPosts = [...this.posts];
        } else {
            this.filteredPosts = this.posts.filter(post => post.category === category);
        }
        
        this.renderPosts();
    }

    searchPosts(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filteredPosts = [...this.posts];
        } else {
            this.filteredPosts = this.posts.filter(post => 
                post.title.toLowerCase().includes(searchTerm) ||
                post.excerpt.toLowerCase().includes(searchTerm) ||
                post.content.toLowerCase().includes(searchTerm) ||
                post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }
        
        this.currentPage = 1;
        this.renderPosts();
    }

    renderPosts(append = false) {
        const container = document.getElementById('posts-container');
        const loadMoreBtn = document.getElementById('load-more-btn');
        
        if (!container) return;

        if (!append) {
            container.innerHTML = '';
        }

        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        const postsToShow = this.filteredPosts.slice(startIndex, endIndex);

        if (postsToShow.length === 0 && !append) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h3 class="text-muted">No posts found</h3>
                    <p class="text-muted">Try adjusting your filter or search terms.</p>
                </div>
            `;
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            return;
        }

        postsToShow.forEach(post => {
            const postElement = this.createPostElement(post);
            container.appendChild(postElement);
        });

        // Show/hide load more button
        if (loadMoreBtn) {
            const hasMorePosts = endIndex < this.filteredPosts.length;
            loadMoreBtn.style.display = hasMorePosts ? 'block' : 'none';
        }

        // Add animation to new posts
        if (append) {
            const newPosts = container.querySelectorAll('.post-card:not(.animated)');
            newPosts.forEach((post, index) => {
                post.classList.add('animated');
                setTimeout(() => {
                    post.style.opacity = '1';
                    post.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }
    }

    createPostElement(post) {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 mb-4';
        
        const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        col.innerHTML = `
            <article class="card post-card h-100">
                <img src="${post.image}" alt="${post.title}" class="card-img-top post-card-img">
                <div class="card-body post-card-body d-flex flex-column">
                    <div class="post-meta">
                        <i class="fas fa-calendar-alt me-1"></i>${formattedDate}
                        <span class="mx-2">•</span>
                        <i class="fas fa-user me-1"></i>${post.author}
                    </div>
                    <span class="post-category">${post.category}</span>
                    <h3 class="post-title">
                        <a href="post.html?id=${post.id}">${post.title}</a>
                    </h3>
                    <p class="post-excerpt flex-grow-1">${post.excerpt}</p>
                    <div class="post-tags">
                        ${post.tags.map(tag => `<a href="#" class="post-tag" data-tag="${tag}">#${tag}</a>`).join('')}
                    </div>
                    <div class="mt-3">
                        <a href="post.html?id=${post.id}" class="btn btn-primary btn-sm">
                            Read More <i class="fas fa-arrow-right ms-1"></i>
                        </a>
                    </div>
                </div>
            </article>
        `;

        // Add click handlers for tags
        const tagLinks = col.querySelectorAll('.post-tag');
        tagLinks.forEach(tagLink => {
            tagLink.addEventListener('click', (e) => {
                e.preventDefault();
                const tag = e.target.dataset.tag;
                this.searchPosts(tag);
                
                // Scroll to posts section
                document.getElementById('posts').scrollIntoView({ behavior: 'smooth' });
            });
        });

        return col;
    }

    setupSmoothScrolling() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    showError(message) {
        const container = document.getElementById('posts-container');
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <h3 class="text-muted">Oops! Something went wrong</h3>
                    <p class="text-muted">${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-refresh me-2"></i>Try Again
                    </button>
                </div>
            `;
        }
    }

    // Utility method to get post by ID
    getPostById(id) {
        return this.posts.find(post => post.id === parseInt(id));
    }
}

// Individual Post Page Handler
class PostPageManager {
    constructor() {
        this.init();
    }

    async init() {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        
        if (postId) {
            await this.loadAndDisplayPost(postId);
        }
    }

    async loadAndDisplayPost(postId) {
        try {
            const response = await fetch('./posts.json');
            const data = await response.json();
            const post = data.posts.find(p => p.id === parseInt(postId));
            
            if (post) {
                this.renderPost(post);
            } else {
                this.showPostNotFound();
            }
        } catch (error) {
            console.error('Error loading post:', error);
            this.showError('Failed to load the post. Please try again later.');
        }
    }

    renderPost(post) {
        const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Update page title
        document.title = `${post.title} - Personal Blog`;

        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.content = post.excerpt;
        }

        // Render post content
        const container = document.getElementById('post-container');
        if (container) {
            container.innerHTML = `
                <article class="post-article">
                    <header class="post-header text-center text-white">
                        <div class="container">
                            <div class="row">
                                <div class="col-lg-8 mx-auto">
                                    <span class="post-category">${post.category}</span>
                                    <h1 class="display-4 fw-bold mb-3">${post.title}</h1>
                                    <div class="post-meta mb-4">
                                        <i class="fas fa-calendar-alt me-2"></i>${formattedDate}
                                        <span class="mx-3">•</span>
                                        <i class="fas fa-user me-2"></i>${post.author}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                    
                    <div class="container py-5">
                        <div class="row">
                            <div class="col-lg-8 mx-auto">
                                <img src="${post.image}" alt="${post.title}" class="img-fluid rounded mb-4 shadow">
                                <div class="post-content">
                                    ${this.formatContent(post.content)}
                                </div>
                                <div class="post-tags mt-4">
                                    <h6 class="fw-bold mb-3">Tags:</h6>
                                    ${post.tags.map(tag => `<a href="index.html#posts" class="post-tag me-2 mb-2">#${tag}</a>`).join('')}
                                </div>
                                <hr class="my-5">
                                <div class="text-center">
                                    <a href="index.html" class="btn btn-primary">
                                        <i class="fas fa-arrow-left me-2"></i>Back to All Posts
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            `;
        }
    }

    formatContent(content) {
        // Simple content formatting - split by paragraphs
        const paragraphs = content.split('\n\n');
        return paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
    }

    showPostNotFound() {
        const container = document.getElementById('post-container');
        if (container) {
            container.innerHTML = `
                <div class="container py-5">
                    <div class="row">
                        <div class="col-lg-6 mx-auto text-center">
                            <i class="fas fa-file-alt fa-5x text-muted mb-4"></i>
                            <h2 class="mb-3">Post Not Found</h2>
                            <p class="text-muted mb-4">The post you're looking for doesn't exist or has been removed.</p>
                            <a href="index.html" class="btn btn-primary">
                                <i class="fas fa-home me-2"></i>Go to Homepage
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    showError(message) {
        const container = document.getElementById('post-container');
        if (container) {
            container.innerHTML = `
                <div class="container py-5">
                    <div class="row">
                        <div class="col-lg-6 mx-auto text-center">
                            <i class="fas fa-exclamation-triangle fa-5x text-warning mb-4"></i>
                            <h2 class="mb-3">Error Loading Post</h2>
                            <p class="text-muted mb-4">${message}</p>
                            <button class="btn btn-primary" onclick="location.reload()">
                                <i class="fas fa-refresh me-2"></i>Try Again
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize the appropriate manager based on the current page
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the individual post page
    if (document.getElementById('post-container')) {
        new PostPageManager();
    } else {
        // Initialize blog manager for main page
        new BlogManager();
    }

    // Add some interactive enhancements
    addInteractiveEnhancements();
});

function addInteractiveEnhancements() {
    // Add loading states to buttons
    document.querySelectorAll('button, .btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.disabled) {
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
                this.disabled = true;
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.disabled = false;
                }, 1000);
            }
        });
    });

    // Add scroll-to-top functionality
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollToTopBtn.className = 'btn btn-primary position-fixed';
    scrollToTopBtn.style.cssText = `
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: none;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(scrollToTopBtn);

    // Show/hide scroll-to-top button
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });

    // Scroll to top when clicked
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Add navbar background on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 50) {
                navbar.style.backgroundColor = 'rgba(37, 99, 235, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.backgroundColor = 'var(--primary-color)';
                navbar.style.backdropFilter = 'none';
            }
        });
    }
}