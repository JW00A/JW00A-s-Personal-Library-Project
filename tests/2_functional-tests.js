const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { test, Test } = require('mocha');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let testingId;
  test('Create an issue with every field', function(done) {
    chai.request(server).post('/api/issues/test_project')
        .send({
            issue_title: "Test Issue",
            issue_text: "Details Here",
            created_by: "User",
            assigned_to: "Dev",
            status_text: "In Progress"
        }).end((err, res) => {
            assert.strictEqual(res.status, 200);
            assert.exists(res.body._id);
            assert.strictEqual(res.body.issue_title, "Test Issue");
            testingId = res.body._id;
            done();
        });
  });
  test('Create an issue with only required fields', function(done) {
    chai.request(server).post('/api/issues/test_project')
        .send({
            issue_title: "Required Only",
            issue_text: "Details Here",
            created_by: "User"
        }).end((err, res) => {
            assert.strictEqual(res.status, 200);
            assert.exists(res.body._id);
            assert.strictEqual(res.body.issue_title, "Required Only");
            done();
        });
  });
  test('Create an issue with missing required fields', function(done) {
    chai.request(server).post('/api/issues/test_project')
        .send({
            issue_title: "Missing Fields"
        }).end((err, res) => {
            assert.strictEqual(res.status, 200);
            assert.deepEqual(res.body, { error: "required field(s) missing"});
            done();
        });
  });
  test('View issues on a project', function(done) {
    chai.request(server).get('/api/issues/test_project')
        .end((err, res) => {
            assert.strictEqual(res.status, 200);
            assert.isArray(res.body);
            done();
        });
  });
  test('View issues on a project with one filter', function(done) {
    chai.request(server).get('/api/issues/test_project?status_text=In Progress')
        .end((err, res) => {
            assert.strictEqual(res.status, 200);
            assert.isArray(res.body);
            assert.strictEqual(res.body[0].status_text, "In Progress");
            done();
        });
  });
  test('View issues on a project with multiple filters', function(done) {
    chai.request(server).get('/api/issues/test_project?created_by=User&assigned_to=Dev')
        .end((err, res) => {
            assert.strictEqual(res.status, 200);
            assert.isArray(res.body);
            assert.strictEqual(res.body[0].created_by, "User");
            assert.strictEqual(res.body[0].assigned_to, "Dev");
            done();
        });
  });
  test('Update one field on an issue', function(done) {
    chai.request(server).put('/api/issues/test_project')
        .send({ _id: testingId, status_text: 'Resolved' })
        .end((err, res) => {
            assert.strictEqual(res.status, 200);
            assert.deepEqual(res.body, { result: "successfully updated", _id: testingId });
            done();
        });
  });
  test('Update multiple fields on an issue', function(done) {
    chai.request(server).put('/api/issues/test_project')
        .send({ _id: testingId, issue_title: 'Updated Title', issue_text: 'Updated Details' })
        .end((err, res) => {
            assert.strictEqual(res.status, 200);
            assert.deepEqual(res.body, { result: "successfully updated", _id: testingId });
            done();
        });
  });
  test('Update an issue with missing _id', function(done) {
    chai.request(server).put('/api/issues/test_project')
        .send({ issue_title: "Update Attempt" })
        .end((err, res) => {
            assert.strictEqual(res.status, 200);
            assert.deepEqual(res.body, { error: "missing _id" });
            done();
        });
  });
  test('Update an issue with no fields to update', function(done) {
    chai.request(server).put('/api/issues/test_project')
        .send({ _id: testingId })
        .end((err, res) => {
            assert.strictEqual(res.status, 200);
            assert.deepEqual(res.body, { error: "no update field(s) sent", _id: testingId });
            done();
        });
  });
  test('Update an issue with an invalid _id', function(done) {
    chai.request(server).put('/api/issues/test_project')
        .send({ _id: 'invalid',
                issue_text: 'invalid _id',
                created_by: 'User'
         })
        .end((err, res) => {
            assert.strictEqual(res.status, 200);
            assert.deepEqual(res.body, { error: 'could not update', _id: 'invalid' });
            done();
        });
  });
  test('Delete an issue', function(done) {
    chai.request(server).delete('/api/issues/test_project')
        .send({ _id: testingId })
        .end((err, res) => {
            assert.strictEqual(res.status, 200);
            assert.deepEqual(res.body, { result: "successfully deleted", _id: testingId });
            done();
        });
  });
  test('Delete an issue with invalid _id', function(done) {
    chai.request(server).delete('/api/issues/test_project')
        .send({ _id: 'invalid' })
        .end((err, res) => {
            assert.strictEqual(res.status, 200);
            assert.deepEqual(res.body, { error: 'could not delete', '_id': 'invalid' });
            done();
        });
  });
  test('Delete an issue with missing _id', function(done) {
    chai.request(server).delete('/api/issues/test_project')
        .send({})
        .end((err, res) => {
            assert.strictEqual(res.status, 200);
            assert.deepEqual(res.body, { error: 'missing _id' });
            done();
        });
  });
});
