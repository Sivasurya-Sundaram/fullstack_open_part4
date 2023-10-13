const Blog = require('../models/blogs');
const initialBlogs = [
  {
    title: 'blog1',
    author: 'sivasurya',
    url: 'www.blog1.com',
    likes: 2,
  },
  {
    title: 'blog2',
    author: 'anu',
    url: 'www.blog2.com',
    likes: 5,
  },
];
const blogsInDb = async () => {
  const blogsInDb = await Blog.find({});
  return blogsInDb.map((blog) => blog.toJSON());
};
module.exports = {
  initialBlogs,
  blogsInDb,
};
