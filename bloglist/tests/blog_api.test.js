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
    expect(foundBlog.body).toEqual(blogToBeViewed);
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
});
describe('deletion of specific notes', () => {
  test('deletion of blog succeeds with status code 204', async () => {
    const blogsAtStart = await testHelper.blogsInDb();
    const blogToBeDeleted = blogsAtStart[0];
    await api.delete(`/api/blogs/${blogToBeDeleted.id}`).expect(204);
    const blogsAtEnd = await testHelper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1);
    const blogTitles = blogsAtEnd.map((blog) => blog.title);
    expect(blogTitles).not.toContain(blogToBeDeleted.title);
  });
});
afterAll(async () => {
  await mongoose.connection.close();
});
