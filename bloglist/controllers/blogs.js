const blogsRouter = require('express').Router();
const Blog = require('../models/blogs');
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});
blogsRouter.get('/:id', async (request, response, next) => {
  const blog = await Blog.findById(request.params.id);
  if (blog) {
    response.json(blog);
  } else {
    response.status(404).end();
  }
});
blogsRouter.post('/', async (request, response, next) => {
  const body = request.body;
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
  });
  const savedBlog = await blog.save();
  response.status(201).json(savedBlog);
});
blogsRouter.delete('/:id', async (request, response, next) => {
  await Blog.findByIdAndDelete(request.params.id);
  response.status(204).end();
  // const id = Number(request.params.id);
  // notes = notes.filter((x) => x.id !== id);
  // response.status(204).end();
});
blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body;
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };
  const updatedBlogs = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
    runValidation: true,
    context: 'query',
  });
  response.json(updatedBlogs);
});
module.exports = blogsRouter;
