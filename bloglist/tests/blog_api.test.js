const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Blog = require('../models/blogs');
const User = require('../models/users');
const testHelper = require('./test_helper');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const api = supertest(app);
var adToken;
beforeEach(async () => {
  await User.deleteMany({});
  const passwordHash = await bcrypt.hash('sekert', 10);
  const user = new User({
    username: 'root',
    name: 'root',
    passwordHash: passwordHash,
  });
  await user.save();
  let userInDb = await User.findOne({ username: 'root' });
  const userToken = {
    username: userInDb.username,
    id: userInDb._id,
  };
  const initialBlogs = [
    {
      title: 'blog1',
      author: 'sivasurya',
      url: 'www.blog1.com',
      likes: 2,
      user: userInDb._id,
    },
    {
      title: 'blog2',
      author: 'anu',
      url: 'www.blog2.com',
      likes: 5,
      user: userInDb._id,
    },
  ];
  adToken = jwt.sign(userToken, process.env.SECRET, { expiresIn: 60 * 60 });
  await Blog.deleteMany({});
  await Blog.insertMany(initialBlogs);
  userInDb = await User.findOne({ username: 'root' });
  const blogsInDb = await (await Blog.find({})).map((x) => x._id);
  userInDb.blogs = userInDb.blogs.concat(blogsInDb);
  await userInDb.save();
});
describe('when there is data in database', () => {
  test('blogs are returned as JSON', async () => {
    const blogs = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
    expect(blogs.body).toHaveLength(testHelper.initialBlogs.length);
  });
  test('blogs have a unique identifier property as id', async () => {
    const blogs = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
    blogs.body.forEach((blog) => {
      expect(blog.id).toBeDefined();
    });
  });
});
describe('finding a specific blog', () => {
  test('finding a blog by id succeeds with status code 200', async () => {
    const blogsAtStart = await testHelper.blogsInDb();
    const blogToBeViewed = blogsAtStart[0];
    const foundBlog = await api
      .get(`/api/blogs/${blogToBeViewed.id}`)
      .expect(200);
    expect(foundBlog.body.id).toEqual(blogToBeViewed.id);
  });
});
describe('adding a new blog', () => {
  test('a blog can be added', async () => {
    const newBlog = {
      title: 'note added by test',
      author: 'tester',
      url: 'www.test.com',
      likes: 4,
    };
    await api
      .post('/api/blogs')
      .set('authorization', `Bearer ${adToken}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
    const blogsInDB = await testHelper.blogsInDb();
    expect(blogsInDB).toHaveLength(testHelper.initialBlogs.length + 1);
    const blogsTitle = blogsInDB.map((x) => x.title);
    expect(blogsTitle).toContain('note added by test');
  });
  test('likes will be defaulted to 0', async () => {
    const newBlog = {
      title: 'note added by test',
      author: 'tester',
      url: 'www.test.com',
    };
    await api
      .post('/api/blogs')
      .set('authorization', `Bearer ${adToken}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
    const blogsInDB = await testHelper.blogsInDb();
    const insertedBlog = blogsInDB.find(
      (x) => x.title === 'note added by test'
    );
    expect(insertedBlog.likes).toBe(0);
  });
  test('a blog with no title will not be inserted', async () => {
    const newBlog = {
      author: 'tester',
      url: 'www.test.com',
    };
    await api
      .post('/api/blogs')
      .set('authorization', `Bearer ${adToken}`)
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });
  test('a blog with no url will not be inserted', async () => {
    const newBlog = {
      title: 'note added by test',
      author: 'tester',
    };
    await api
      .post('/api/blogs')
      .set('authorization', `Bearer ${adToken}`)
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });
});
describe('deletion of specific notes', () => {
  test('deletion of blog succeeds with status code 204', async () => {
    const blogsAtStart = await testHelper.blogsInDb();
    const blogToBeDeleted = blogsAtStart[0];
    await api
      .delete(`/api/blogs/${blogToBeDeleted.id}`)
      .set('authorization', `Bearer ${adToken}`)
      .expect(204);
    const blogsAtEnd = await testHelper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1);
    const blogTitles = blogsAtEnd.map((blog) => blog.title);
    expect(blogTitles).not.toContain(blogToBeDeleted.title);
  });
});
afterAll(async () => {
  await mongoose.connection.close();
});
