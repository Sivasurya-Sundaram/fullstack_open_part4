const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Blog = require('../models/blogs');
const testHelper = require('./test_helper');
const api = supertest(app);
beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(testHelper.initialBlogs);
});
test('blogs are returned as JSON', async () => {
  const blogs = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
  expect(blogs.body).toHaveLength(testHelper.initialBlogs.length);
});
test('blog have a unique identifier property as id', async () => {
  const blogs = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
  blogs.body.forEach((blog) => {
    expect(blog.id).toBeDefined();
  });
});
test('a blog can be added', async () => {
  const newBlog = {
    title: 'note added by test',
    author: 'tester',
    url: 'www.test.com',
    likes: 4,
  };
  await api
    .post('/api/blogs')
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
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);
  const blogsInDB = await testHelper.blogsInDb();
  const insertedBlog = blogsInDB.find((x) => x.title === 'note added by test');
  expect(insertedBlog.likes).toBe(0);
});
test('a blog with no title will not be inserted', async () => {
  const newBlog = {
    author: 'tester',
    url: 'www.test.com',
  };
  await api
    .post('/api/blogs')
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
    .send(newBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/);
});
afterAll(async () => {
  await mongoose.connection.close();
});
