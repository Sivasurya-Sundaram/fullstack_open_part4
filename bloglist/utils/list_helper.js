const _ = require('lodash');
const dummy = (blogs) => {
  return 1;
};
const totalLikes = (blogs) => {
  const total = blogs.reduce((totalLikes, blog) => {
    return (totalLikes += blog.likes);
  }, 0);
  return total;
};
const favBlog = (blogs) => {
  const likes = blogs.map((x) => x.likes);
  const maxLikes = Math.max(...likes);
  const favBlog = blogs.find((x) => x.likes == maxLikes);
  //console.log(_.pick(favBlog, ['title', 'author', 'likes']));
  return _.pick(favBlog, ['title', 'author', 'likes']);
  //console.log({ title, author });
  //return { title, author };
};
const mostBlogs = (blogs) => {
  const authorList = _.map(_.countBy(blogs, 'author'), (val, key) => {
    return { author: key, blogs: val };
  });
  const maxAuthor = _.maxBy(authorList, 'blogs');
  return maxAuthor;
};
const mostLikes = (blogs) => {
  const authorList = _.map(_.groupBy(blogs, 'author'), (val, key) => {
    return {
      author: key,
      likes: val.reduce((sum, x) => sum + x.likes, 0),
    };
  });
  const maxLikes = _.maxBy(authorList, 'likes');
  return maxLikes;
};
module.exports = {
  dummy,
  totalLikes,
  favBlog,
  mostBlogs,
  mostLikes,
};
