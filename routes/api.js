'use strict';

let issues = {};

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      
      if (!issues[project]) {
        return res.json([]);
      }

      let filteredIssues = issues[project];

      Object.keys(req.query).forEach(key => {
        filteredIssues = filteredIssues.filter(issue => issue[key] === req.query[key]);
      });

      res.json(filteredIssues);
    })
    
    .post(function (req, res){
      let project = req.params.project;
      
      let { issue_title, issue_text, created_by, assigned_to, status_text } = req.body
      
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: "required field(s) missing" });
      }

      let issue = {
        _id: Math.random().toString(36).substr(2, 9),
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || "",
        status_text: status_text || "",
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      };

      if (!issues[project]) {
        issues[project] = [];
      }
      issues[project].push(issue);

      res.json(issue);
    })
    
    .put(function (req, res){
      let project = req.params.project;
      let { _id, ...updateFields} = req.body;

      if (!_id) {
        return res.json({ error: "missing _id" });
      }

      if (Object.keys(updateFields).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      if (!issues[project]) {
        return res.json({ error: "project not found" });
      }

      let issue = issues[project].find(issue => issue._id === _id);
      if (!issue) {
        return res.json({ error: 'could not update', _id });
      }

      Object.keys(updateFields).forEach(key => {
        if (updateFields[key]) {
          issue[key] = updateFields[key];
        }
      });

      issue.updated_on = new Date();
      return res.json({ result: "successfully updated", _id });
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      let { _id } = req.body;

      if (!_id) {
        return res.json({ error: "missing _id" });
      }

      if (!issues[project]) {
        return res.json({ error: "project not found" });
      }

      let issueIndex = issues[project].findIndex(issue => issue._id === _id);

      if (issueIndex === -1) {
        return res.json({ error: "could not delete", _id });
      }

      issues[project].splice(issueIndex, 1);
      res.status(200).json({ result: "successfully deleted", _id });
    });
    
};
