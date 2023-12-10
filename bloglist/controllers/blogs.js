const blogsRouter = require('express').Router();
const Blog = require('../models/blogs');
const User = require('../models/users');
const jwt = require('jsonwebtoken');
const middleware = require('../utils/middleware');
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs);
});
blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  if (blog) {
    response.json(blog);
  } else {
    response.status(404).end();
  }
});
blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body;
  // const decodedToken = await jwt.verify(request.token, process.env.SECRET);
  // if (!decodedToken) {
  //   return response.status(401).json({ error: 'invalid token' });
  // }
  // const user = await User.findById(decodedToken.id);
  // if (!user) {
  //   return response.status(400).json({ error: 'Invalid userId' });
  // }
  const user = request.user;
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id,
  });
  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  user.save();
  response.status(201).json(savedBlog);
});
blogsRouter.delete(
  '/:id',
  middleware.userExtractor,
  async (request, response) => {
    // const decodedToken = await jwt.verify(request.token, process.env.SECRET);
    // if (!decodedToken) {
    //   return response.status(401).json({ error: 'invalid token' });
    // }
    // const user = await User.findById(decodedToken.id);
    // if (!user) {
    //   return response.status(400).json({ error: 'Invalid userId' });
    // }
    const blog = await Blog.findById(request.params.id);
    console.log(blog);
    if (!blog.user) {
      return response.status(400).json({
        error: 'Invalid blog id',
      });
    }
    const user = request.user;
    if (blog.user.toString() === user.id.toString()) {
      await Blog.findByIdAndDelete(request.params.id);
    } else {
      return response
        .status(403)
        .json({ error: 'user is not authorized to delelet the blog' });
    }
    response.status(204).end();
    // const id = Number(request.params.id);
    // notes = notes.filter((x) => x.id !== id);
    // response.status(204).end();
  }
);
blogsRouter.put('/:id', async (request, response) => {
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
