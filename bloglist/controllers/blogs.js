const blogsRouter = require('express').Router();
const Blog = require('../models/blogs');
blogsRouter.get('/', (request, response) => {
  Blog.find({}).then((notes) => {
    response.json(notes);
  });
});
blogsRouter.get('/:id', (request, response, next) => {
  Blog.findById(request.params.id)
    .then((blog) => {
      if (blog) {
        response.json(blog);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => {
      next(error);
    });
});
blogsRouter.post('/', (request, response, next) => {
  const body = request.body;
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  });
  blog
    .save()
    .then((savedBlog) => {
      response.json(savedBlog);
    })
    .catch((error) => next(error));
});
blogsRouter.delete('/:id', (request, response, next) => {
  Blog.findByIdAndDelete(request.params.id)
    .then((res) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
  // const id = Number(request.params.id);
  // notes = notes.filter((x) => x.id !== id);
  // response.status(204).end();
});
blogsRouter.put('/:id', (request, response, next) => {
  const body = request.body;
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };
  Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
    runValidation: true,
    context: 'query',
  })
    .then((updatedBlogs) => {
      response.json(updatedBlogs);
    })
    .catch((error) => next(error));
});
module.exports = blogsRouter;
